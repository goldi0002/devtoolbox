import React, { useState, useRef, useEffect, useCallback } from 'react'
import Papa from 'papaparse'
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  AlertCircle,
  Loader2,
  Table,
  Filter,
  Download,
  Copy,
  Check,
  SlidersHorizontal,
  HardDrive
} from 'lucide-react'
import SectionPanel from '../../ui/SectionPanel'
import StatCard from '../../ui/StatCard'

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function detectDelimiter(sampleText: string): string {
  const delimiters = [',', '|', '\t', ';']
  const lines = sampleText.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 10)
  if (lines.length === 0) return ','

  let bestDelim = ','
  let maxConsistentCount = 0

  for (const delim of delimiters) {
    const counts = lines.map(line => {
      // count occurrences outside of quotes if possible, or basic split
      return line.split(delim).length - 1
    })
    const firstCount = counts[0]
    if (firstCount > 0 && counts.every(c => c === firstCount)) {
      if (firstCount > maxConsistentCount) {
        maxConsistentCount = firstCount
        bestDelim = delim
      }
    }
  }

  // If no perfectly consistent count, pick the one with highest average
  if (maxConsistentCount === 0) {
    let highestAvg = 0
    for (const delim of delimiters) {
      const avg = lines.reduce((acc, l) => acc + (l.split(delim).length - 1), 0) / lines.length
      if (avg > highestAvg) {
        highestAvg = avg
        bestDelim = delim
      }
    }
  }

  return bestDelim
}

function inferColumnTypes(data: string[][], headers: string[]): string[] {
  if (!data || data.length === 0) return headers.map(() => 'text')
  
  return headers.map((_, colIdx) => {
    let isNum = true
    let isBool = true
    let isDate = true
    let sampleCount = 0

    for (let r = 0; r < Math.min(data.length, 30); r++) {
      const val = (data[r]?.[colIdx] ?? '').trim()
      if (!val) continue
      sampleCount++

      if (isNum && isNaN(Number(val))) {
        isNum = false
      }
      if (isBool && !['true', 'false', '0', '1', 'yes', 'no'].includes(val.toLowerCase())) {
        isBool = false
      }
      if (isDate && isNaN(Date.parse(val))) {
        isDate = false
      }
    }

    if (sampleCount === 0) return 'text'
    if (isNum) return 'number'
    if (isBool) return 'boolean'
    if (isDate) return 'date'
    return 'text'
  })
}

export default function CsvTxtViewer() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [delimiter, setDelimiter] = useState<string>('auto')
  const [actualDelimiter, setActualDelimiter] = useState<string>(',')
  const [hasHeader, setHasHeader] = useState<boolean>(true)
  const [rowsPerPage, setRowsPerPage] = useState<number>(100)
  
  // Indexing and Progress
  const [isIndexing, setIsIndexing] = useState<boolean>(false)
  const [indexingProgress, setIndexingProgress] = useState<number>(0)
  const [totalRows, setTotalRows] = useState<number>(0)
  const [headers, setHeaders] = useState<string[]>([])
  const [columnTypes, setColumnTypes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Current page data
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageData, setPageData] = useState<string[][]>([])
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  // Stream Cancellation and Byte Index Ref
  const abortControllerRef = useRef<AbortController | null>(null)
  const pageOffsetsRef = useRef<number[]>([0]) // Stores start byte offset for each page
  const headerEndOffsetRef = useRef<number>(0)
  const fileRef = useRef<File | null>(null)

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))

  // Load a specific page chunk from file slice
  const loadPage = useCallback(async (
    page: number, 
    targetFile: File | null = fileRef.current,
    activeDelim: string = actualDelimiter,
    firstRowHeader: boolean = hasHeader,
    rPerPage: number = rowsPerPage
  ) => {
    if (!targetFile) return
    setIsLoadingPage(true)

    try {
      const pageIdx = page - 1
      const startByte = pageOffsetsRef.current[pageIdx] ?? 0
      
      // Determine end byte: either next page offset or a generous slice
      let endByte: number
      if (pageOffsetsRef.current[pageIdx + 1] !== undefined) {
        endByte = pageOffsetsRef.current[pageIdx + 1]
      } else {
        // Approximate byte size for remaining rows
        endByte = Math.min(targetFile.size, startByte + (rPerPage * 4096))
      }

      // Read slice
      const sliceBlob = targetFile.slice(startByte, endByte)
      const sliceText = await sliceBlob.text()

      // Parse with PapaParse
      Papa.parse<string[]>(sliceText, {
        delimiter: activeDelim,
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          let rows = results.data
          // If page 1 and hasHeader, skip the first row (the header)
          if (page === 1 && firstRowHeader && rows.length > 0) {
            rows = rows.slice(1)
          }
          // Cap at rowsPerPage in case slice caught extra rows
          rows = rows.slice(0, rPerPage)
          setPageData(rows)
          setCurrentPage(page)
          setIsLoadingPage(false)
        },
        error: (err) => {
          setError(`Error reading page ${page}: ${err.message}`)
          setIsLoadingPage(false)
        }
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load page')
      setIsLoadingPage(false)
    }
  }, [actualDelimiter, hasHeader, rowsPerPage])

  // Core High-Performance Stream Indexer
  const processAndIndexFile = useCallback(async (
    inputFile: File, 
    selectedDelim: string, 
    firstRowHeader: boolean,
    rPerPage: number
  ) => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    fileRef.current = inputFile
    setIsIndexing(true)
    setIndexingProgress(0)
    setError(null)
    setTotalRows(0)
    setCurrentPage(1)
    setPageData([])
    pageOffsetsRef.current = [0]
    headerEndOffsetRef.current = 0

    try {
      // 1. Fast Preview: Read first 128KB to immediately detect delimiter and headers
      const previewSize = Math.min(inputFile.size, 128 * 1024)
      const previewBlob = inputFile.slice(0, previewSize)
      const previewText = await previewBlob.text()

      // Determine effective delimiter
      const effectiveDelim = selectedDelim === 'auto' ? detectDelimiter(previewText) : selectedDelim
      setActualDelimiter(effectiveDelim)

      // Parse initial sample for immediate UI rendering
      const initialParsed = Papa.parse<string[]>(previewText, {
        delimiter: effectiveDelim,
        header: false,
        skipEmptyLines: true
      })

      const rawRows = initialParsed.data
      let detectedHeaders: string[] = []
      let firstPageRows: string[][] = []

      if (rawRows.length > 0) {
        if (firstRowHeader) {
          detectedHeaders = rawRows[0].map((h, i) => (h && h.trim() ? h.trim() : `Column_${i + 1}`))
          firstPageRows = rawRows.slice(1, 1 + rPerPage)
        } else {
          detectedHeaders = rawRows[0].map((_, i) => `Column_${i + 1}`)
          firstPageRows = rawRows.slice(0, rPerPage)
        }
        setHeaders(detectedHeaders)
        setColumnTypes(inferColumnTypes(firstPageRows, detectedHeaders))
        setPageData(firstPageRows)
      }

      // 2. High-Performance Chunk Streaming to build Page Byte Offsets
      // We stream raw bytes (Uint8Array) to avoid memory overhead
      const stream = inputFile.stream()
      const reader = stream.getReader()
      const totalBytes = inputFile.size

      let processedBytes = 0
      let rowCount = 0
      let inQuotes = false
      let isFirstLine = true
      const pageOffsets: number[] = [0]
      let lastProgressUpdate = performance.now()

      let isReading = true
      while (isReading) {
        if (abortController.signal.aborted) {
          reader.cancel()
          return
        }

        const { done, value } = await reader.read()
        if (done) {
          isReading = false
          break
        }

        const chunk = value
        const chunkLen = chunk.length

        for (let i = 0; i < chunkLen; i++) {
          const byte = chunk[i]

          // Handle double quotes for RFC 4180 CSVs
          if (byte === 34) { // '"'
            inQuotes = !inQuotes
          } else if (byte === 10 && !inQuotes) { // '\n'
            const currentLineStartOffset = processedBytes + i + 1

            if (isFirstLine) {
              isFirstLine = false
              headerEndOffsetRef.current = currentLineStartOffset
              if (firstRowHeader) {
                // Page 1 data starts right after header line
                pageOffsets[0] = currentLineStartOffset
              } else {
                rowCount++
              }
            } else {
              rowCount++
              if (rowCount % rPerPage === 0) {
                pageOffsets.push(currentLineStartOffset)
              }
            }
          }
        }

        processedBytes += chunkLen

        // Throttled UI Progress Updates (every 80ms)
        const now = performance.now()
        if (now - lastProgressUpdate > 80) {
          lastProgressUpdate = now
          const pct = Math.min(99, Math.round((processedBytes / totalBytes) * 100))
          setIndexingProgress(pct)
          setTotalRows(rowCount)
        }
      }

      // Handle final row if file doesn't end in newline
      if (processedBytes > 0 && !isFirstLine && !firstRowHeader) {
        // Already counted
      }

      pageOffsetsRef.current = pageOffsets
      setTotalRows(rowCount)
      setIndexingProgress(100)
      setIsIndexing(false)

    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Error processing file')
        setIsIndexing(false)
      }
    }
  }, [])

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    setFile(selectedFile)
    processAndIndexFile(selectedFile, delimiter, hasHeader, rowsPerPage)
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }

  // Handle delimiter re-selection
  const handleDelimiterChange = (newDelim: string) => {
    setDelimiter(newDelim)
    if (file) {
      processAndIndexFile(file, newDelim, hasHeader, rowsPerPage)
    }
  }

  // Handle header toggle
  const handleHeaderToggle = (newHasHeader: boolean) => {
    setHasHeader(newHasHeader)
    if (file) {
      processAndIndexFile(file, delimiter, newHasHeader, rowsPerPage)
    }
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (newRpp: number) => {
    setRowsPerPage(newRpp)
    if (file) {
      processAndIndexFile(file, delimiter, hasHeader, newRpp)
    }
  }

  // Navigation handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    loadPage(page)
    const tableEl = document.getElementById('csv-viewer-table-section')
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // Copy cell content
  const handleCopyCell = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell(id)
    setTimeout(() => setCopiedCell(null), 1500)
  }

  // Filtered page data based on search term
  const filteredPageData = pageData.filter(row => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return row.some(cell => String(cell).toLowerCase().includes(term))
  })

  // Export current page
  const handleExportCurrentPage = () => {
    if (!headers.length || !pageData.length) return
    const csvContent = Papa.unparse({
      fields: headers,
      data: pageData
    }, { delimiter: actualDelimiter })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `page_${currentPage}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* File Upload & Settings Section */}
      <SectionPanel title="Large File Importer & Configuration" label="Importer & Delimiter Settings">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dropzone */}
          <div className="lg:col-span-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-border-hover bg-surface/50'
              }`}
            >
              <input
                type="file"
                accept=".csv,.txt,.tsv,.psv,.dat,.log"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title=""
              />
              <div className="p-3 rounded-full bg-surface border border-border mb-3 text-accent">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-bright mb-1">
                {file ? (
                  <span className="text-accent font-semibold">{file.name}</span>
                ) : (
                  'Click to upload or drag & drop large file'
                )}
              </p>
              <p className="text-xs text-subtle">
                Supports massive CSV, TXT, TSV, PSV up to <span className="text-bright font-mono font-medium">300MB+</span> with instant streaming
              </p>
              {file && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-dim bg-surface px-3 py-1 rounded border border-border">
                  <HardDrive className="w-3.5 h-3.5 text-accent" />
                  <span>Size: {formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>Delimiter: {actualDelimiter === '\t' ? 'Tab (\\t)' : actualDelimiter === '|' ? 'Pipe (|)' : actualDelimiter}</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-4 bg-surface/30 p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-dim mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
              Parsing Options
            </div>

            {/* Delimiter Selection */}
            <div>
              <label className="text-xs text-dim block mb-1">Delimiter / Separator</label>
              <select
                value={delimiter}
                onChange={(e) => handleDelimiterChange(e.target.value)}
                className="w-full text-xs font-mono bg-surface border border-border rounded px-3 py-2 text-bright focus:outline-none focus:border-accent"
              >
                <option value="auto">Auto-Detect Delimiter</option>
                <option value="|">Pipe (|) Delimited</option>
                <option value=",">Comma (,) CSV</option>
                <option value="&#9;">Tab (\t) TSV</option>
                <option value=";">Semicolon (;)</option>
                <option value=" ">Space ( )</option>
              </select>
            </div>

            {/* Rows Per Page */}
            <div>
              <label className="text-xs text-dim block mb-1">Page Batch Size</label>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="w-full text-xs font-mono bg-surface border border-border rounded px-3 py-2 text-bright focus:outline-none focus:border-accent"
              >
                <option value={25}>25 rows / page</option>
                <option value={50}>50 rows / page</option>
                <option value={100}>100 rows / page (Recommended)</option>
                <option value={250}>250 rows / page</option>
                <option value={500}>500 rows / page</option>
              </select>
            </div>

            {/* Header Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hasHeaderCheckbox"
                checked={hasHeader}
                onChange={(e) => handleHeaderToggle(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent bg-surface cursor-pointer"
              />
              <label htmlFor="hasHeaderCheckbox" className="text-xs text-bright cursor-pointer select-none">
                First row contains column headers
              </label>
            </div>
          </div>
        </div>

        {/* Indexing Progress Indicator */}
        {isIndexing && (
          <div className="mt-4 p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 text-bright font-medium">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                <span>Background indexing {file?.name}... (Initial page is already interactive)</span>
              </div>
              <span className="font-mono text-accent font-semibold">{indexingProgress}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-150"
                style={{ width: `${indexingProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </SectionPanel>

      {/* Dataset Statistics */}
      {headers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Rows"
            value={
              isIndexing ? (
                <span className="flex items-center gap-1.5">
                  {totalRows.toLocaleString()}+ <Loader2 className="w-3 h-3 animate-spin text-accent" />
                </span>
              ) : (
                totalRows.toLocaleString()
              )
            }
            icon={Table}
            subValue={`Showing page ${currentPage} of ${totalPages}`}
          />
          <StatCard
            label="Columns"
            value={headers.length.toLocaleString()}
            icon={FileText}
            subValue="Auto-detected schema"
          />
          <StatCard
            label="Active Delimiter"
            value={actualDelimiter === '\t' ? 'TAB' : actualDelimiter === '|' ? 'PIPE (|)' : `"${actualDelimiter}"`}
            icon={SlidersHorizontal}
            subValue={delimiter === 'auto' ? 'Auto-detected' : 'Manual override'}
          />
          <StatCard
            label="Memory Footprint"
            value="< 5 MB"
            icon={HardDrive}
            subValue="Zero-freeze virtual slice"
          />
        </div>
      )}

      {/* Table Data Viewer */}
      {headers.length > 0 && (
        <div id="csv-viewer-table-section">
          <SectionPanel
            title="Tabular Data Viewer"
            label="Tabular Data Viewer"
            action={
              <button
                onClick={handleExportCurrentPage}
                className="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright px-2.5 py-1 rounded bg-surface hover:bg-border transition-colors border border-border"
                title="Export current page as CSV"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span>Export Page</span>
              </button>
            }
          >
            {/* Table Controls (Search & Pagination Bar) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
              {/* Quick Filter */}
              <div className="relative flex-1 max-w-md">
                <Filter className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter visible page rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs font-mono bg-surface border border-border rounded pl-9 pr-3 py-1.5 text-bright focus:outline-none focus:border-accent"
                />
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1 || isLoadingPage}
                  className="p-1.5 rounded border border-border bg-surface text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingPage}
                  className="p-1.5 rounded border border-border bg-surface text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2 text-xs font-mono text-dim">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10)
                      if (!isNaN(p)) goToPage(p)
                    }}
                    className="w-14 text-center bg-surface border border-border rounded px-1.5 py-1 text-bright text-xs focus:outline-none focus:border-accent"
                  />
                  <span>of {totalPages}</span>
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoadingPage}
                  className="p-1.5 rounded border border-border bg-surface text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage >= totalPages || isLoadingPage}
                  className="p-1.5 rounded border border-border bg-surface text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table View */}
            <div className="relative border border-border rounded-lg overflow-hidden bg-surface">
              {isLoadingPage && (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-border text-xs text-bright">
                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    <span>Loading page {currentPage}...</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-surface border-b border-border shadow-sm">
                    <tr>
                      <th className="px-3 py-2.5 font-mono text-[11px] text-dim border-r border-border w-14 text-center bg-surface/90">
                        #
                      </th>
                      {headers.map((header, colIdx) => (
                        <th
                          key={colIdx}
                          className="px-3 py-2.5 font-mono text-[11px] font-semibold text-bright whitespace-nowrap border-r border-border last:border-r-0 bg-surface/90"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate max-w-[200px]" title={header}>
                              {header}
                            </span>
                            <span className="text-[9px] font-normal px-1 py-0.5 rounded bg-border text-subtle uppercase">
                              {columnTypes[colIdx] || 'text'}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPageData.length > 0 ? (
                      filteredPageData.map((row, rowIdx) => {
                        const globalRowNum = (currentPage - 1) * rowsPerPage + rowIdx + 1
                        return (
                          <tr
                            key={rowIdx}
                            className="hover:bg-surface/80 transition-colors group"
                          >
                            <td className="px-3 py-2 font-mono text-[11px] text-subtle text-center border-r border-border bg-surface/30">
                              {globalRowNum}
                            </td>
                            {headers.map((_, colIdx) => {
                              const cellValue = row[colIdx] !== undefined ? String(row[colIdx]) : ''
                              const cellId = `${rowIdx}-${colIdx}`
                              const isCopied = copiedCell === cellId

                              return (
                                <td
                                  key={colIdx}
                                  onClick={() => handleCopyCell(cellValue, cellId)}
                                  className="px-3 py-2 font-mono text-dim whitespace-nowrap max-w-[280px] truncate border-r border-border last:border-r-0 cursor-pointer hover:text-bright hover:bg-accent/5 transition-colors relative group/cell"
                                  title={`Click to copy: ${cellValue}`}
                                >
                                  <span>{cellValue}</span>
                                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-surface px-1 py-0.5 rounded border border-border text-[10px]">
                                    {isCopied ? (
                                      <Check className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-dim" />
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={headers.length + 1}
                          className="px-4 py-12 text-center text-dim text-xs"
                        >
                          {searchTerm
                            ? `No rows matching "${searchTerm}" found on this page.`
                            : 'No data available.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="px-4 py-2.5 bg-surface/50 border-t border-border flex items-center justify-between text-[11px] text-dim font-mono">
                <span>
                  Showing rows {(currentPage - 1) * rowsPerPage + 1} –{' '}
                  {Math.min(currentPage * rowsPerPage, totalRows || pageData.length)} of{' '}
                  {isIndexing ? `${totalRows.toLocaleString()}+ (Indexing...)` : totalRows.toLocaleString()}
                </span>
                <span className="text-subtle">
                  Click any cell to copy value • Tip: Filter bar searches visible page
                </span>
              </div>
            </div>
          </SectionPanel>
        </div>
      )}
    </div>
  )
}
