import React, { useState } from 'react'
import {
  FileText,
  Calendar,
  HardDrive,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Columns,
  Hash,
  Binary
} from 'lucide-react'

export interface FileDetails {
  name: string
  size: number
  type: string
  lastModified: number
  lineEnding: 'CRLF (Windows)' | 'LF (Unix/macOS)' | 'Mixed / Unknown'
  detectedDelimiter: string
  totalColumns: number
  columnTypeBreakdown: {
    number: number
    text: number
    date: number
    boolean: number
  }
  averageRowBytes: number
  estimatedTotalRows: number
  hasQuotes: boolean
}

interface FileMetadataPanelProps {
  details: FileDetails
}

function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getDelimiterName(delim: string): string {
  switch (delim) {
    case ',': return 'Comma (,) • ASCII 44 / 0x2C'
    case '\t': return 'Tab (\\t) • ASCII 9 / 0x09'
    case '|': return 'Pipe (|) • ASCII 124 / 0x7C'
    case ';': return 'Semicolon (;) • ASCII 59 / 0x3B'
    case ' ': return 'Space ( ) • ASCII 32 / 0x20'
    default: return `"${delim}" • Delimiter`
  }
}

export default function FileMetadataPanel({ details }: FileMetadataPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const extension = details.name.includes('.')
    ? details.name.split('.').pop()?.toUpperCase()
    : 'RAW'

  const formattedDate = details.lastModified
    ? new Date(details.lastModified).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : 'Unknown'

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-surface/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-bright">
                File Details & Data Profile
              </h4>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-background text-accent border border-border">
                {extension}
              </span>
            </div>
            <p className="text-xs text-subtle font-mono mt-0.5">
              {details.name} • {formatBytes(details.size)} ({details.size.toLocaleString()} bytes)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-dim">
          <span className="hidden sm:inline">{isExpanded ? 'Hide Details' : 'View Full Profile'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Metadata Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-border bg-background/50 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* File Name & Path */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>File Name</span>
              </div>
              <div className="text-bright font-semibold truncate" title={details.name}>
                {details.name}
              </div>
              <div className="text-[10px] text-dim">
                MIME: {details.type || 'text/plain or application/octet-stream'}
              </div>
            </div>

            {/* Exact Size */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exact File Size</span>
              </div>
              <div className="text-bright font-semibold">
                {formatBytes(details.size)}
              </div>
              <div className="text-[10px] text-dim">
                {details.size.toLocaleString()} raw bytes
              </div>
            </div>

            {/* Last Modified */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Last Modified</span>
              </div>
              <div className="text-bright font-semibold truncate">
                {formattedDate}
              </div>
              <div className="text-[10px] text-dim">
                Local filesystem timestamp
              </div>
            </div>

            {/* Delimiter & Format */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>Delimiter & Separator</span>
              </div>
              <div className="text-bright font-semibold">
                {getDelimiterName(details.detectedDelimiter)}
              </div>
              <div className="text-[10px] text-dim">
                Quotes: {details.hasQuotes ? 'RFC 4180 Quotes Detected' : 'Standard / Unquoted'}
              </div>
            </div>

            {/* Line Endings & Encoding */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <Binary className="w-3.5 h-3.5 text-purple-400" />
                <span>Line Endings</span>
              </div>
              <div className="text-bright font-semibold">
                {details.lineEnding}
              </div>
              <div className="text-[10px] text-dim">
                Encoding: UTF-8 / ASCII (Streaming Slices)
              </div>
            </div>

            {/* Average Row Metrics */}
            <div className="bg-surface p-3 rounded-lg border border-border/80 space-y-1">
              <div className="flex items-center gap-1.5 text-subtle text-[11px]">
                <Hash className="w-3.5 h-3.5 text-rose-400" />
                <span>Data Density</span>
              </div>
              <div className="text-bright font-semibold">
                ~{Math.round(details.averageRowBytes)} bytes / row
              </div>
              <div className="text-[10px] text-dim">
                Total Rows: {details.estimatedTotalRows.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Column Type Distribution Bar */}
          <div className="bg-surface p-3.5 rounded-lg border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-bright font-semibold">
                <Columns className="w-3.5 h-3.5 text-accent" />
                <span>Column Types Distribution ({details.totalColumns} Total Columns)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-dim">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> {details.columnTypeBreakdown.number} Number
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> {details.columnTypeBreakdown.text} Text
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> {details.columnTypeBreakdown.date} Date
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> {details.columnTypeBreakdown.boolean} Boolean
                </span>
              </div>
            </div>

            {/* Distribution Visual Progress Bar */}
            {details.totalColumns > 0 && (
              <div className="w-full h-2 rounded-full bg-background overflow-hidden flex">
                <div 
                  className="bg-emerald-400 h-full transition-all"
                  style={{ width: `${(details.columnTypeBreakdown.number / details.totalColumns) * 100}%` }}
                  title={`${details.columnTypeBreakdown.number} Numbers`}
                />
                <div 
                  className="bg-sky-400 h-full transition-all"
                  style={{ width: `${(details.columnTypeBreakdown.text / details.totalColumns) * 100}%` }}
                  title={`${details.columnTypeBreakdown.text} Text`}
                />
                <div 
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${(details.columnTypeBreakdown.date / details.totalColumns) * 100}%` }}
                  title={`${details.columnTypeBreakdown.date} Dates`}
                />
                <div 
                  className="bg-purple-400 h-full transition-all"
                  style={{ width: `${(details.columnTypeBreakdown.boolean / details.totalColumns) * 100}%` }}
                  title={`${details.columnTypeBreakdown.boolean} Booleans`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
