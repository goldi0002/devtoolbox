import React, { useState, useMemo } from 'react'
import { Table, Search, ArrowUpDown, Download, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { jsonToCsv } from '../../../utils/jsonCsv'

interface JsonTableViewProps {
  data: any
}

export default function JsonTableView({ data }: JsonTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [inspectRow, setInspectRow] = useState<any | null>(null)

  // Normalize data into array of records
  const items: any[] = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === 'object') {
      // Find the first array property inside the object (e.g. data.users, data.items, data.products)
      for (const val of Object.values(data)) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          return val
        }
      }
      return [data]
    }
    return [{ value: data }]
  }, [data])

  // Extract all unique headers across items
  const headers = useMemo(() => {
    const headerSet = new Set<string>()
    items.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(k => headerSet.add(k))
      }
    })
    return Array.from(headerSet)
  }, [items])

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    const q = searchTerm.toLowerCase()
    return items.filter(item => {
      if (item === null || item === undefined) return false
      if (typeof item !== 'object') return String(item).toLowerCase().includes(q)
      return Object.values(item).some(v => String(v).toLowerCase().includes(q))
    })
  }, [items, searchTerm])

  // Sorted items
  const sortedItems = useMemo(() => {
    if (!sortColumn) return filteredItems
    return [...filteredItems].sort((a, b) => {
      const valA = a ? a[sortColumn] : undefined
      const valB = b ? b[sortColumn] : undefined

      if (valA === valB) return 0
      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA
      }

      const strA = String(valA)
      const strB = String(valB)
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA)
    })
  }, [filteredItems, sortColumn, sortDirection])

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize))
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedItems.slice(start, start + pageSize)
  }, [sortedItems, currentPage, pageSize])

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else setSortColumn(null)
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    try {
      const csv = jsonToCsv(JSON.stringify(sortedItems), { delimiter: ',', flatten: true, includeHeaders: true })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `json_table_export_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  if (items.length === 0 || headers.length === 0) {
    return (
      <div className="p-8 text-center bg-[#1e1e1e] rounded-xl border border-border text-[#808080] font-mono text-xs">
        <Table size={28} className="mx-auto mb-2 text-[#505050]" />
        <p>No array of objects detected to display in table mode.</p>
        <p className="text-[11px] text-[#606060] mt-1">Switch to Code or Tree view to inspect the structure.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl border border-border overflow-hidden font-mono text-xs shadow-lg">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#d4d4d4] font-medium">
            <Table size={14} className="text-indigo-400" />
            <span>Table View ({items.length} records)</span>
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#707070]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Filter table rows..."
              className="pl-7 pr-3 py-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[11px] text-[#e0e0e0] placeholder-[#606060] focus:outline-none focus:border-indigo-500 w-44 sm:w-60"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 bg-[#2d2d2d] hover:bg-[#383838] text-[#cccccc] hover:text-white rounded text-[11px] flex items-center gap-1.5 transition-colors"
            title="Download table data as CSV"
          >
            <Download size={12} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-[#2d2d2d] border border-[#3c3c3c] rounded px-2 py-1 text-[11px] text-[#cccccc] focus:outline-none"
          >
            <option value="10">10 / page</option>
            <option value="15">15 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2a2a2b] text-[#cccccc] sticky top-0 z-10 border-b border-[#3c3c3c] text-[11px]">
              <th className="p-2.5 w-12 text-center text-[#707070]">#</th>
              {headers.map(header => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="p-2.5 cursor-pointer hover:bg-[#333334] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#9cdcfe]">{header}</span>
                    <ArrowUpDown
                      size={11}
                      className={sortColumn === header ? 'text-indigo-400' : 'text-[#606060]'}
                    />
                  </div>
                </th>
              ))}
              <th className="p-2.5 w-16 text-center text-[#707070]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d2d] text-[#d4d4d4]">
            {paginatedItems.map((row, idx) => {
              const globalIndex = (currentPage - 1) * pageSize + idx + 1
              return (
                <tr
                  key={idx}
                  className="hover:bg-[#25282a] transition-colors group cursor-pointer"
                  onClick={() => setInspectRow(row)}
                >
                  <td className="p-2 text-center text-[#606060] text-[10px]">{globalIndex}</td>
                  {headers.map(header => {
                    const cellVal = row ? row[header] : undefined
                    return (
                      <td key={header} className="p-2.5 whitespace-nowrap max-w-xs truncate text-[11px]">
                        <CellFormatter value={cellVal} />
                      </td>
                    )
                  })}
                  <td className="p-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setInspectRow(row)
                      }}
                      className="p-1 rounded bg-[#2d2d2d] hover:bg-indigo-600 text-[#a0a0a0] hover:text-white transition-colors"
                      title="Inspect record JSON"
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {paginatedItems.length === 0 && (
              <tr>
                <td colSpan={headers.length + 2} className="p-8 text-center text-[#707070] italic">
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#252526] border-t border-[#3c3c3c] text-[11px] text-[#808080]">
        <div>
          Showing {sortedItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, sortedItems.length)} of {sortedItems.length} entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-[#2d2d2d] hover:bg-[#383838] disabled:opacity-40 disabled:hover:bg-[#2d2d2d] text-[#cccccc]"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-[#cccccc]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-[#2d2d2d] hover:bg-[#383838] disabled:opacity-40 disabled:hover:bg-[#2d2d2d] text-[#cccccc]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Row Detail Inspection Modal */}
      {inspectRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3c3c3c] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
              <span className="font-mono text-xs text-[#cccccc] font-medium flex items-center gap-1.5">
                <Eye size={13} className="text-indigo-400" />
                Row JSON Inspection
              </span>
              <button
                onClick={() => setInspectRow(null)}
                className="p-1 text-[#808080] hover:text-white rounded hover:bg-[#383838]"
              >
                <X size={14} />
              </button>
            </div>
            <pre className="p-4 max-h-96 overflow-auto font-mono text-xs text-[#d4d4d4] bg-[#141414] leading-relaxed select-text whitespace-pre-wrap">
              {JSON.stringify(inspectRow, null, 2)}
            </pre>
            <div className="flex justify-end p-3 bg-[#252526] border-t border-[#3c3c3c]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectRow, null, 2))
                  setInspectRow(null)
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-medium transition-colors"
              >
                Copy Row JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CellFormatter({ value }: { value: any }) {
  if (value === null || value === undefined) {
    return <span className="text-[#666666] italic">null</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        {value ? 'true' : 'false'}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span className="text-[#b5cea8]">{value}</span>
  }
  if (typeof value === 'object') {
    return (
      <span className="text-[#9cdcfe] text-[10px] bg-[#2a2a2b] px-1.5 py-0.5 rounded">
        {Array.isArray(value) ? `[${value.length} items]` : '{...}'}
      </span>
    )
  }
  return <span>{String(value)}</span>
}
