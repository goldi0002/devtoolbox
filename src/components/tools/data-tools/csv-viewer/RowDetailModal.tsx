import React, { useState, useMemo } from 'react'
import {
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  FileCode,
  FileSpreadsheet,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react'

interface RowDetailModalProps {
  isOpen: boolean
  onClose: () => void
  rowIndex?: number // 0-based index within current page
  globalRowNumber: number
  totalRows: number
  headers: string[]
  rowData: string[]
  columnTypes: ('number' | 'boolean' | 'date' | 'text')[]
  delimiter: string
  onNavigatePrevious?: () => void
  onNavigateNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export default function RowDetailModal({
  isOpen,
  onClose,
  globalRowNumber,
  totalRows,
  headers,
  rowData,
  columnTypes,
  delimiter,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious,
  hasNext
}: RowDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hideEmpty, setHideEmpty] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'csv' | null>(null)

  const filteredFields = useMemo(() => {
    return headers.map((header, idx) => {
      const val = rowData[idx] !== undefined ? String(rowData[idx]) : ''
      const type = columnTypes[idx] || 'text'
      return {
        header,
        index: idx,
        value: val,
        type,
        isEmpty: val.trim() === ''
      }
    }).filter(field => {
      if (hideEmpty && field.isEmpty) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return field.header.toLowerCase().includes(q) || field.value.toLowerCase().includes(q)
    })
  }, [headers, rowData, columnTypes, searchQuery, hideEmpty])

  if (!isOpen) return null

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleCopyJson = () => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = rowData[i] !== undefined ? String(rowData[i]) : ''
    })
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    setCopiedFormat('json')
    setTimeout(() => setCopiedFormat(null), 1500)
  }

  const handleCopyCsv = () => {
    const delim = delimiter === '\t' ? '\t' : delimiter
    const line = rowData.map(val => {
      const str = String(val ?? '')
      return str.includes(delim) || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(delim)
    navigator.clipboard.writeText(line)
    setCopiedFormat('csv')
    setTimeout(() => setCopiedFormat(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3 bg-surface/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-bright">
                  Row Detail Inspector
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  #{globalRowNumber.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-subtle font-mono mt-0.5">
                Inspecting row {globalRowNumber} of {totalRows.toLocaleString()} • {headers.length} total columns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Row Navigation */}
            <div className="flex items-center bg-background rounded-lg border border-border p-0.5">
              <button
                onClick={onNavigatePrevious}
                disabled={!hasPrevious}
                className="p-1.5 rounded text-dim hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Row in Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateNext}
                disabled={!hasNext}
                className="p-1.5 rounded text-dim hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Row in Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-dim hover:text-bright hover:bg-background border border-transparent hover:border-border transition-colors"
              title="Close inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 sm:px-5 py-3 border-b border-border bg-background/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search column name or value */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search field names or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-mono bg-surface border border-border rounded-lg pl-9 pr-7 py-1.5 text-bright focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-bright"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Hide Empty Toggle */}
            <button
              onClick={() => setHideEmpty(!hideEmpty)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors font-mono ${
                hideEmpty
                  ? 'bg-accent/10 border-accent/40 text-accent font-medium'
                  : 'bg-surface border-border text-dim hover:text-bright'
              }`}
            >
              {hideEmpty ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideEmpty ? 'Non-Empty Only' : 'Show All Fields'}</span>
            </button>

            {/* Copy Row As JSON */}
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors font-mono"
            >
              {copiedFormat === 'json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied JSON!</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            {/* Copy Row As Delimited Text */}
            <button
              onClick={handleCopyCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors font-mono"
            >
              {copiedFormat === 'csv' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied Row!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy Row</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Body Fields List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-border/40">
          {filteredFields.length > 0 ? (
            filteredFields.map((field) => {
              const isCopied = copiedKey === `field-${field.index}`
              return (
                <div
                  key={field.index}
                  className="pt-2.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 sm:gap-4 group hover:bg-surface/60 p-2 rounded-lg transition-colors"
                >
                  {/* Column Meta */}
                  <div className="sm:w-1/3 min-w-[180px] shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-subtle">
                        #{field.index + 1}
                      </span>
                      <span className="font-mono text-xs font-semibold text-bright break-words">
                        {field.header}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-background text-subtle border border-border/60">
                        {field.type}
                      </span>
                    </div>
                  </div>

                  {/* Cell Value & Copy */}
                  <div className="sm:w-2/3 w-full flex items-start justify-between gap-3">
                    <div className="flex-1 font-mono text-xs text-bright/90 bg-background/80 px-3 py-2 rounded-lg border border-border/70 break-all select-text whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {field.value !== '' ? (
                        field.value
                      ) : (
                        <span className="text-subtle italic">(empty / null)</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopySingle(field.value, `field-${field.index}`)}
                      className="p-2 rounded-lg bg-surface border border-border hover:border-accent text-dim hover:text-bright transition-colors shrink-0"
                      title="Copy field value"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-dim text-xs font-mono">
              <p className="text-bright font-medium">No matching fields found</p>
              <p className="text-subtle mt-1 text-[11px]">
                Try adjusting your search query or disable "Non-Empty Only".
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-surface flex items-center justify-between text-[11px] font-mono text-subtle">
          <span>
            Showing {filteredFields.length} of {headers.length} fields
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-background border border-border hover:border-accent text-bright transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
