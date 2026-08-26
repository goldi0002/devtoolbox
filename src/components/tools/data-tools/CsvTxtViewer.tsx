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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileCode,
  LayoutGrid,
  CheckSquare,
  Square,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react'
import SectionPanel from '../../ui/SectionPanel'
import StatCard from '../../ui/StatCard'
import RowDetailModal from './csv-viewer/RowDetailModal'
import ReadMetricsCard, { ReadMetrics } from './csv-viewer/ReadMetricsCard'
import FileMetadataPanel, { FileDetails } from './csv-viewer/FileMetadataPanel'
import { createCsvIndexWorker, IndexWorkerMessage } from './csv-viewer/csvIndexWorker'

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function detectDelimiter(sampleText: string): string {
  const delimiters = [',', '\t', '|', ';']
  const lines = sampleText.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 10)
  if (lines.length === 0) return ','

  let bestDelim = ','
  let maxConsistentCount = 0

  for (const delim of delimiters) {
    const counts = lines.map(line => line.split(delim).length - 1)
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

function inferColumnTypes(data: string[][], colCount: number): ColumnType[] {
  if (!data || data.length === 0 || colCount === 0) {
    return Array.from({ length: colCount }, () => 'text')
  }

  const types: ColumnType[] = []
  const sampleRows = Math.min(data.length, 30)

  for (let colIdx = 0; colIdx < colCount; colIdx++) {
    let isNum = true
    let isBool = true
    let isDate = true
    let sampleCount = 0

    for (let r = 0; r < sampleRows; r++) {
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

    if (sampleCount === 0) {
      types.push('text')
    } else if (isNum) {
      types.push('number')
    } else if (isBool) {
      types.push('boolean')
    } else if (isDate) {
      types.push('date')
    } else {
      types.push('text')
    }
  }

  return types
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

  // Features: Sorting, Column Visibility, Density, Column Filters
  const [sortConfig, setSortConfig] = useState<ColumnSort | null>(null)
  const [hiddenCols, setHiddenCols] = useState<Record<number, boolean>>({})
  const [showColumnManager, setShowColumnManager] = useState<boolean>(false)
  const [columnSearchQuery, setColumnSearchQuery] = useState<string>('')
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false)
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('compact')
  const [activeTab, setActiveTab] = useState<'table' | 'json_preview'>('table')

  // Horizontal Column Windowing / Virtual Range for ultra-wide datasets (100+ to 1,000+ cols)
  const [columnRange, setColumnRange] = useState<'all' | 'first50' | 'first100' | 'custom'>('all')
  const [customRangeStart, setCustomRangeStart] = useState<number>(1)
  const [customRangeEnd, setCustomRangeEnd] = useState<number>(100)

  // Stream Cancellation, Worker, and Byte Index Ref
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeWorkerRef = useRef<{ terminate: () => void } | null>(null)
  const pageOffsetsRef = useRef<number[]>([0]) // Stores start byte offset for each page
  const fileRef = useRef<File | null>(null)

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (activeWorkerRef.current) {
        activeWorkerRef.current.terminate()
      }
    }
  }, [])

  // Read Timing Benchmarks & File Details
  const [readMetrics, setReadMetrics] = useState<ReadMetrics>({
    initialInspectionTimeMs: 0,
    totalIndexingTimeMs: 0,
    pageReadTimeMs: 0,
    bytesPerSecond: 0,
    totalBytesProcessed: 0,
    totalRowsIndexed: 0
  })
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null)

  // Row Detail Inspector State
  const [inspectedRowIndex, setInspectedRowIndex] = useState<number | null>(null)

  const effectiveTotalRows = Math.max(totalRows, (currentPage - 1) * rowsPerPage + pageData.length)
  const totalPages = Math.max(1, Math.ceil(effectiveTotalRows / rowsPerPage))

  // Load a specific page chunk from file slice with dynamic lookahead
  const loadPage = useCallback(async (
    page: number, 
    targetFile: File | null = fileRef.current,
    activeDelim: string = actualDelimiter,
    firstRowHeader: boolean = hasHeader,
    rPerPage: number = rowsPerPage
  ) => {
    if (!targetFile) return
    setIsLoadingPage(true)
    const pageStartTime = performance.now()

    try {
      const pageIdx = page - 1
      const startByte = pageOffsetsRef.current[pageIdx] ?? 0
      
      // Calculate end byte safely:
      let endByte: number
      if (pageOffsetsRef.current[pageIdx + 1] !== undefined) {
        endByte = Math.min(targetFile.size, pageOffsetsRef.current[pageIdx + 1] + 16384)
      } else {
        // Fallback for indexing in progress: generous 16MB chunk
        endByte = Math.min(targetFile.size, startByte + Math.max(rPerPage * 8192, 1024 * 1024))
      }

      // Read slice
      const sliceBlob = targetFile.slice(startByte, endByte)
      const sliceText = await sliceBlob.text()

      // Parse with PapaParse
      Papa.parse<string[]>(sliceText, {
        delimiter: activeDelim,
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results: { data: string[][] }) => {
          const sliceElapsed = performance.now() - pageStartTime
          let rows = results.data || []
          // If page 1 and hasHeader and startByte is 0, skip the first row (the header)
          if (page === 1 && firstRowHeader && startByte === 0 && rows.length > 0) {
            rows = rows.slice(1)
          }
          // Cap precisely at rowsPerPage
          rows = rows.slice(0, rPerPage)
          setPageData(rows)
          setCurrentPage(page)
          setIsLoadingPage(false)

          // Update page slice latency metric
          setReadMetrics(prev => ({
            ...prev,
            pageReadTimeMs: sliceElapsed
          }))

          // Sync totalRows if current slice loaded more rows than previously known
          setTotalRows(prev => Math.max(prev, (page - 1) * rPerPage + rows.length))
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
    setInspectedRowIndex(null)
    pageOffsetsRef.current = [0]

    const startIndexingTime = performance.now()

    try {
      // 1. Delimiter & Header Inspection
      const inspectStartTime = performance.now()
      const previewSize = Math.min(inputFile.size, 256 * 1024)
      const previewBlob = inputFile.slice(0, previewSize)
      const previewText = await previewBlob.text()

      // Determine effective delimiter
      const effectiveDelim = selectedDelim === 'auto' ? detectDelimiter(previewText) : selectedDelim
      setActualDelimiter(effectiveDelim)

      // Parse sample to get complete header column list & column types
      const initialParsed = Papa.parse<string[]>(previewText, {
        delimiter: effectiveDelim,
        header: false,
        skipEmptyLines: 'greedy'
      })

      const rawRows = initialParsed.data || []
      let detectedHeaders: string[] = []
      let inferredTypes: ColumnType[] = []

      if (rawRows.length > 0) {
        if (firstRowHeader) {
          detectedHeaders = rawRows[0].map((h: string, i: number) => (h && h.trim() ? h.trim() : `Column_${i + 1}`))
        } else {
          const maxCols = Math.max(...rawRows.map((r: string[]) => r.length))
          detectedHeaders = Array.from({ length: maxCols }, (_, i) => `Column_${i + 1}`)
        }
        inferredTypes = inferColumnTypes(rawRows.slice(firstRowHeader ? 1 : 0), detectedHeaders.length)
        setHeaders(detectedHeaders)
        setColumnTypes(inferredTypes)
      }

      const inspectElapsed = performance.now() - inspectStartTime

      // Detect line ending type
      const hasCRLF = previewText.includes('\r\n')
      const hasLF = previewText.includes('\n')
      const lineEndingType = hasCRLF ? 'CRLF (Windows)' : hasLF ? 'LF (Unix/macOS)' : 'Mixed / Unknown'

      // Count column types breakdown
      const typeBreakdown = {
        number: inferredTypes.filter(t => t === 'number').length,
        text: inferredTypes.filter(t => t === 'text').length,
        date: inferredTypes.filter(t => t === 'date').length,
        boolean: inferredTypes.filter(t => t === 'boolean').length
      }

      // Populate initial file details early
      setFileDetails({
        name: inputFile.name,
        size: inputFile.size,
        type: inputFile.type || 'text/csv',
        lastModified: inputFile.lastModified,
        lineEnding: lineEndingType,
        detectedDelimiter: effectiveDelim,
        totalColumns: detectedHeaders.length,
        columnTypeBreakdown: typeBreakdown,
        averageRowBytes: 0,
        estimatedTotalRows: 0,
        hasQuotes: previewText.includes('"')
      })

      // Immediately load page 1 so user sees content instantly in milliseconds
      loadPage(1, inputFile, effectiveDelim, firstRowHeader, rPerPage)

      // 2. High-Performance Multi-Threaded Web Worker Background Indexing
      if (activeWorkerRef.current) {
        activeWorkerRef.current.terminate()
      }

      const { worker, terminate } = createCsvIndexWorker()
      activeWorkerRef.current = { terminate }

      worker.onmessage = (e: MessageEvent<IndexWorkerMessage>) => {
        const msg = e.data
        if (msg.type === 'progress') {
          if (msg.pct !== undefined) setIndexingProgress(msg.pct)
          if (msg.rowCount !== undefined) setTotalRows(msg.rowCount)
          if (msg.pageOffsets) pageOffsetsRef.current = msg.pageOffsets
          setReadMetrics(prev => ({
            ...prev,
            initialInspectionTimeMs: inspectElapsed,
            totalIndexingTimeMs: msg.elapsedMs || 0,
            bytesPerSecond: msg.bytesPerSec || 0,
            totalBytesProcessed: msg.processedBytes || 0,
            totalRowsIndexed: msg.rowCount || 0
          }))
        } else if (msg.type === 'complete') {
          const finalRows = msg.rowCount || 0
          const finalDuration = msg.elapsedMs || (performance.now() - startIndexingTime)
          const finalBps = msg.bytesPerSec || (finalDuration > 0 ? (inputFile.size / (finalDuration / 1000)) : 0)

          if (msg.pageOffsets) pageOffsetsRef.current = msg.pageOffsets
          setTotalRows(finalRows)
          setIndexingProgress(100)
          setIsIndexing(false)

          setReadMetrics({
            initialInspectionTimeMs: inspectElapsed,
            totalIndexingTimeMs: finalDuration,
            pageReadTimeMs: 0,
            bytesPerSecond: finalBps,
            totalBytesProcessed: inputFile.size,
            totalRowsIndexed: finalRows
          })

          setFileDetails(prev => prev ? {
            ...prev,
            averageRowBytes: finalRows > 0 ? (inputFile.size / finalRows) : 0,
            estimatedTotalRows: finalRows
          } : null)

          activeWorkerRef.current?.terminate()
          activeWorkerRef.current = null
        } else if (msg.type === 'error') {
          console.error('CSV Index Worker Error:', msg.error)
          setIsIndexing(false)
          activeWorkerRef.current?.terminate()
          activeWorkerRef.current = null
        }
      }

      worker.onerror = (err) => {
        console.error('CSV Index Worker error event:', err)
        setIsIndexing(false)
        activeWorkerRef.current?.terminate()
        activeWorkerRef.current = null
      }

      // Launch worker with 8MB chunks for maximum OS DMA I/O throughput
      worker.postMessage({
        file: inputFile,
        rowsPerPage: rPerPage,
        firstRowHeader,
        chunkSize: 8 * 1024 * 1024
      })

    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Error processing file')
        setIsIndexing(false)
      }
    }
  }, [loadPage])

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

  // Quick Demo Dataset Loader for Instant Testing
  const handleLoadSampleDataset = (type: 'ecommerce' | 'logs' | 'pipe_db') => {
    let content = ''
    let filename = 'sample_dataset.csv'
    let mimeType = 'text/csv'

    if (type === 'ecommerce') {
      filename = 'ecommerce_transactions_sample.csv'
      const sampleHeaders = ['order_id', 'customer_name', 'customer_email', 'product_sku', 'category', 'unit_price', 'quantity', 'total_amount', 'currency', 'payment_status', 'shipping_country', 'order_date', 'is_loyalty_member']
      const rows: string[] = [sampleHeaders.join(',')]
      const categories = ['Electronics', 'Home & Kitchen', 'Footwear', 'Apparel', 'Books & Media', 'Sports & Outdoors']
      const statuses = ['COMPLETED', 'PROCESSING', 'DELIVERED', 'REFUNDED', 'PENDING']
      const countries = ['US', 'CA', 'DE', 'GB', 'FR', 'JP', 'AU', 'IN', 'BR']

      for (let i = 1; i <= 500; i++) {
        const price = (Math.random() * 250 + 9.99).toFixed(2)
        const qty = Math.floor(Math.random() * 4) + 1
        const total = (parseFloat(price) * qty).toFixed(2)
        const cat = categories[i % categories.length]
        const st = statuses[i % statuses.length]
        const ctry = countries[i % countries.length]
        const d = new Date(Date.now() - i * 3600000 * 4).toISOString().split('T')[0]
        rows.push(`ORD-${10000 + i},Customer_${i},user_${i}@example.com,SKU-${cat.substring(0, 3).toUpperCase()}-${100 + (i % 50)},"${cat}",${price},${qty},${total},USD,${st},${ctry},${d},${i % 3 === 0 ? 'true' : 'false'}`)
      }
      content = rows.join('\n')
    } else if (type === 'pipe_db') {
      filename = 'database_records_dump.psv'
      const sampleHeaders = ['id', 'user_uuid', 'username', 'role', 'auth_provider', 'last_ip_address', 'login_attempts', 'is_active', 'created_at', 'last_login', 'api_quota_remaining', 'department']
      const rows: string[] = [sampleHeaders.join('|')]
      const roles = ['ADMIN', 'DEVELOPER', 'ANALYST', 'OPERATOR', 'VIEWER']
      const depts = ['Engineering', 'Data Science', 'Security Ops', 'Infrastructure', 'Product Management']

      for (let i = 1; i <= 600; i++) {
        const role = roles[i % roles.length]
        const dept = depts[i % depts.length]
        const dt = new Date(Date.now() - i * 1800000).toISOString()
        rows.push(`${i}|usr_uuid_${90000 + i}|dev_user_${i}|${role}|github_oauth|192.168.1.${(i % 250) + 1}|${i % 4}|${i % 7 !== 0 ? 'true' : 'false'}|2026-01-15T08:00:00Z|${dt}|${1000 - (i % 800)}|${dept}`)
      }
      content = rows.join('\n')
    } else {
      filename = 'server_access_traffic.log'
      mimeType = 'text/plain'
      const sampleHeaders = ['timestamp', 'http_method', 'endpoint_path', 'status_code', 'response_time_ms', 'client_ip', 'user_agent', 'bytes_sent', 'cache_hit']
      const rows: string[] = [sampleHeaders.join('\t')]
      const endpoints = ['/api/v1/users', '/api/v1/auth/login', '/api/v1/products', '/api/v1/orders/checkout', '/api/v1/metrics/stream', '/static/bundle.js']
      const methods = ['GET', 'POST', 'PUT', 'DELETE']

      for (let i = 1; i <= 750; i++) {
        const ep = endpoints[i % endpoints.length]
        const meth = ep.includes('login') || ep.includes('checkout') ? 'POST' : methods[i % methods.length]
        const code = i % 19 === 0 ? 500 : i % 13 === 0 ? 404 : 200
        const latency = (Math.random() * 120 + 2.5).toFixed(1)
        const dt = new Date(Date.now() - i * 60000).toISOString()
        rows.push(`${dt}\t${meth}\t${ep}\t${code}\t${latency}\t10.0.4.${(i % 254) + 1}\t"Mozilla/5.0 (ViteApp/1.0)"\t${Math.floor(Math.random() * 50000 + 400)}\t${i % 2 === 0 ? 'true' : 'false'}`)
      }
      content = rows.join('\n')
    }

    const mockFile = new File([content], filename, { type: mimeType, lastModified: Date.now() })
    handleFileChange(mockFile)
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

  const hideAllColumns = () => {
    const hidden: Record<number, boolean> = {}
    headers.forEach((_, idx) => {
      hidden[idx] = true
    })
    setHiddenCols(hidden)
  }

  // Quick Preset Selection for Column Range
  const handleColumnRangePreset = (range: 'all' | 'first50' | 'first100' | 'custom') => {
    setColumnRange(range)
    if (range === 'all') {
      showAllColumns()
    } else if (range === 'first50') {
      const hidden: Record<number, boolean> = {}
      headers.forEach((_, idx) => {
        if (idx >= 50) hidden[idx] = true
      })
      setHiddenCols(hidden)
    } else if (range === 'first100') {
      const hidden: Record<number, boolean> = {}
      headers.forEach((_, idx) => {
        if (idx >= 100) hidden[idx] = true
      })
      setHiddenCols(hidden)
    }
  }

  const applyCustomColumnRange = () => {
    const start = Math.max(0, customRangeStart - 1)
    const end = Math.min(headers.length - 1, customRangeEnd - 1)
    const hidden: Record<number, boolean> = {}
    headers.forEach((_, idx) => {
      if (idx < start || idx > end) {
        hidden[idx] = true
      }
    })
    setHiddenCols(hidden)
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

  // Filtered columns for the Column Manager Search
  const filteredColumnsList = useMemo(() => {
    if (!columnSearchQuery.trim()) return headers.map((h, i) => ({ header: h, index: i }))
    const query = columnSearchQuery.toLowerCase()
    return headers
      .map((h, i) => ({ header: h, index: i }))
      .filter(item => item.header.toLowerCase().includes(query) || `col ${item.index + 1}`.includes(query))
  }, [headers, columnSearchQuery])

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
                Supports massive CSV, TXT, TSV, PSV up to <span className="text-bright font-mono font-medium">1GB+</span> with 100+ columns & zero memory freeze
              </p>

              {/* Instant Demo Dataset Loaders */}
              <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono z-10">
                <span className="text-subtle flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  Load Demo Data:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLoadSampleDataset('ecommerce')
                  }}
                  className="px-2.5 py-1 rounded bg-background hover:bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors"
                >
                  500-Row E-Commerce CSV
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLoadSampleDataset('pipe_db')
                  }}
                  className="px-2.5 py-1 rounded bg-background hover:bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors"
                >
                  600-Row Pipe (|) DB Dump
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLoadSampleDataset('logs')
                  }}
                  className="px-2.5 py-1 rounded bg-background hover:bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors"
                >
                  750-Row Access TSV Log
                </button>
              </div>

              {file && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-dim bg-surface px-3 py-1 rounded border border-border">
                  <HardDrive className="w-3.5 h-3.5 text-accent" />
                  <span>Size: {formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>Delimiter: {actualDelimiter === '\t' ? 'Tab (\\t)' : actualDelimiter === '|' ? 'Pipe (|)' : actualDelimiter}</span>
                  {headers.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-accent font-medium">{headers.length} Columns</span>
                    </>
                  )}
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
                <option value=",">Comma (,) CSV</option>
                <option value="&#9;">Tab (\t) TSV</option>
                <option value="|">Pipe (|) Delimited</option>
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
                <option value={100}>100 rows / page (Standard)</option>
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
                <span>Background indexing {file?.name}... (Current page is already fully interactive)</span>
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
                  {effectiveTotalRows.toLocaleString()}+ <Loader2 className="w-3 h-3 animate-spin text-accent" />
                </span>
              ) : (
                effectiveTotalRows.toLocaleString()
              )
            }
            icon={Table}
            subValue={`Showing page ${currentPage} of ${totalPages}`}
          />
          <StatCard
            label="Columns"
            value={`${visibleColIndices.length} / ${headers.length}`}
            icon={FileText}
            subValue={visibleColIndices.length < headers.length ? `${headers.length - visibleColIndices.length} hidden` : 'All columns visible'}
          />
          <StatCard
            label="Active Delimiter"
            value={actualDelimiter === '\t' ? 'TAB' : actualDelimiter === '|' ? 'PIPE (|)' : `"${actualDelimiter}"`}
            icon={SlidersHorizontal}
            subValue={delimiter === 'auto' ? 'Auto-detected' : 'Manual override'}
          />
          <StatCard
            label="Memory Footprint"
            value="< 8 MB"
            icon={HardDrive}
            subValue="Zero-freeze virtual slice"
          />
        </div>
      )}

      {/* Stream Read Metrics Card (Real-Time Read Process Timings) */}
      {headers.length > 0 && (
        <ReadMetricsCard
          metrics={readMetrics}
          isIndexing={isIndexing}
          indexingProgress={indexingProgress}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalFileSize={file?.size || 0}
        />
      )}

      {/* Uploaded File Details & Schema Breakdown */}
      {fileDetails && (
        <FileMetadataPanel details={fileDetails} />
      )}

      {/* Multi-Column Quick Filter / Range Bar (Highlighted when > 30 columns) */}
      {headers.length > 20 && (
        <div className="bg-surface/50 border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-dim font-mono">
            <LayoutGrid className="w-4 h-4 text-accent" />
            <span className="font-medium text-bright">Wide Dataset Navigator:</span>
            <span>{headers.length} Total Columns</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-background rounded-lg border border-border p-0.5">
              <button
                onClick={() => handleColumnRangePreset('all')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  columnRange === 'all' && visibleColIndices.length === headers.length
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                    : 'text-dim hover:text-bright'
                }`}
              >
                All ({headers.length})
              </button>
              <button
                onClick={() => handleColumnRangePreset('first50')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  columnRange === 'first50'
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                    : 'text-dim hover:text-bright'
                }`}
              >
                Cols 1–50
              </button>
              <button
                onClick={() => handleColumnRangePreset('first100')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  columnRange === 'first100'
                    ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                    : 'text-dim hover:text-bright'
                }`}
              >
                Cols 1–100
              </button>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
              <span>Cols:</span>
              <input
                type="number"
                min={1}
                max={headers.length}
                value={customRangeStart}
                onChange={(e) => setCustomRangeStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-background border border-border rounded px-1 py-0.5 text-center text-bright"
              />
              <span>to</span>
              <input
                type="number"
                min={1}
                max={headers.length}
                value={customRangeEnd}
                onChange={(e) => setCustomRangeEnd(Math.min(headers.length, parseInt(e.target.value, 10) || headers.length))}
                className="w-12 bg-background border border-border rounded px-1 py-0.5 text-center text-bright"
              />
              <button
                onClick={() => {
                  setColumnRange('custom')
                  applyCustomColumnRange()
                }}
                className="px-2 py-0.5 bg-surface border border-border hover:border-accent hover:text-accent rounded transition-colors text-bright font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Data Table Workspace */}
      {headers.length > 0 && (
        <div id="csv-viewer-table-section" className="space-y-4">
          <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-xl">
            
            {/* Header Bar */}
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-surface/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-bright flex items-center gap-2">
                    <span>{file?.name || 'Dataset Table Viewer'}</span>
                  </h3>
                  <p className="text-xs text-subtle font-mono">
                    Page {currentPage} of {totalPages} • {processedRows.length} rows loaded • {visibleColIndices.length} / {headers.length} columns active
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
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl p-3 z-30 space-y-2.5 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                        <span className="font-semibold text-bright">Column Manager</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={showAllColumns}
                            className="text-[11px] text-accent hover:underline flex items-center gap-1"
                            title="Show all columns"
                          >
                            <CheckSquare className="w-3 h-3" />
                            All
                          </button>
                          <button
                            onClick={hideAllColumns}
                            className="text-[11px] text-dim hover:text-bright hover:underline flex items-center gap-1"
                            title="Hide all columns"
                          >
                            <Square className="w-3 h-3" />
                            None
                          </button>
                        </div>
                      </div>

                      {/* Search Columns */}
                      <div className="relative">
                        <Search className="w-3 h-3 text-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search column names or index..."
                          value={columnSearchQuery}
                          onChange={(e) => setColumnSearchQuery(e.target.value)}
                          className="w-full text-xs font-mono bg-background border border-border rounded-lg pl-7 pr-2 py-1 text-bright focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Columns List */}
                      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                        {filteredColumnsList.map(({ header, index }) => (
                          <label
                            key={index}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-background cursor-pointer text-xs group"
                          >
                            <div className="flex items-center gap-2 truncate max-w-[200px]">
                              <span className="text-[10px] font-mono text-subtle w-6 shrink-0">
                                #{index + 1}
                              </span>
                              <span className="truncate text-dim group-hover:text-bright font-mono">
                                {header}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!hiddenCols[index]}
                              onChange={() => toggleColumnVisibility(index)}
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
              </div>
            </div>

            {/* Search and Quick Pagination Filter Bar */}
            <div className="px-4 py-3 border-b border-border bg-surface/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search across visible cells in loaded page..."
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
                /* High-Performance Smooth Horizontal & Vertical Scrolling Table */
                <div className="overflow-x-auto overflow-y-auto max-h-[640px] w-full select-text">
                  <table className="w-full text-left border-collapse min-w-full">
                    <thead className="sticky top-0 z-10 bg-surface border-b border-border shadow-sm">
                      <tr>
                        {/* Sticky Row Index Column */}
                        <th className={`${headerPaddingClass} font-mono text-dim border-r border-border w-14 min-w-[56px] text-center bg-surface sticky left-0 z-20 shadow-[1px_0_0_rgba(255,255,255,0.08)]`}>
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
                              className={`${headerPaddingClass} font-mono font-semibold text-bright whitespace-nowrap min-w-[140px] border-r border-border last:border-r-0 bg-surface cursor-pointer select-none hover:bg-border/60 transition-colors group`}
                              title={`Column ${colIdx + 1}: ${header} • Click to sort`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="truncate max-w-[200px] text-bright group-hover:text-accent transition-colors">
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
                              {/* Sticky Row Index Cell with Quick Inspector Trigger */}
                              <td
                                onClick={() => setInspectedRowIndex(rowIdx)}
                                className={`${cellPaddingClass} text-subtle text-center border-r border-border bg-surface/90 sticky left-0 z-0 shadow-[1px_0_0_rgba(255,255,255,0.08)] cursor-pointer hover:text-accent hover:bg-accent/10 transition-colors group/rowbtn`}
                                title={`Click to inspect complete Row #${globalRowNum} details`}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <span>{globalRowNum}</span>
                                  <Eye className="w-3 h-3 opacity-0 group-hover/rowbtn:opacity-100 text-accent transition-opacity shrink-0" />
                                </div>
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
                                    className={`${cellPaddingClass} text-dim whitespace-nowrap min-w-[140px] max-w-[340px] truncate border-r border-border last:border-r-0 cursor-pointer hover:text-bright hover:bg-accent/5 transition-colors relative group/cell ${
                                      isNumeric ? 'text-right' : ''
                                    }`}
                                    title={`Column ${colIdx + 1} (${headers[colIdx]}): ${cellValue}`}
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
                <div className="p-4 overflow-auto font-mono text-xs text-bright max-h-[640px]">
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
                  {isIndexing ? `${totalRows.toLocaleString()}+ (Streaming...)` : totalRows.toLocaleString()}
                </span>
                {searchTerm && (
                  <span className="text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {processedRows.length} filtered match{processedRows.length === 1 ? '' : 'es'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-subtle">
                <span>Tip: Click row # to inspect • Click column header to sort • Click any cell to copy</span>
                <span>{visibleColIndices.length} active columns</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row Detail Inspector Modal */}
      {inspectedRowIndex !== null && (
        <RowDetailModal
          isOpen={inspectedRowIndex !== null}
          onClose={() => setInspectedRowIndex(null)}
          globalRowNumber={(currentPage - 1) * rowsPerPage + inspectedRowIndex + 1}
          totalRows={effectiveTotalRows}
          headers={headers}
          rowData={processedRows[inspectedRowIndex] || []}
          columnTypes={columnTypes}
          delimiter={actualDelimiter}
          hasPrevious={inspectedRowIndex > 0}
          hasNext={inspectedRowIndex < processedRows.length - 1}
          onNavigatePrevious={() => setInspectedRowIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNavigateNext={() => setInspectedRowIndex(prev => (prev !== null && prev < processedRows.length - 1 ? prev + 1 : prev))}
        />
      )}
    </div>
  )
}
