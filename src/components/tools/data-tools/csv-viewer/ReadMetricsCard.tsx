import React from 'react'
import {
  Timer,
  Zap,
  Gauge,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react'

export interface ReadMetrics {
  initialInspectionTimeMs: number
  totalIndexingTimeMs: number
  pageReadTimeMs: number
  bytesPerSecond: number
  totalBytesProcessed: number
  totalRowsIndexed: number
}

interface ReadMetricsCardProps {
  metrics: ReadMetrics
  isIndexing: boolean
  indexingProgress?: number
  currentPage?: number
  rowsPerPage?: number
  totalFileSize?: number
}

function formatDuration(ms: number): string {
  if (ms < 1) return '< 1 ms'
  if (ms < 1000) return `${ms.toFixed(1)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 MB/s'
  const mbPerSec = bytesPerSec / (1024 * 1024)
  if (mbPerSec < 1024) {
    return `${mbPerSec.toFixed(1)} MB/s`
  }
  return `${(mbPerSec / 1024).toFixed(2)} GB/s`
}

export default function ReadMetricsCard({
  metrics,
  isIndexing,
  indexingProgress = 100,
  currentPage = 1,
  rowsPerPage = 100
}: ReadMetricsCardProps) {
  const rowsPerSec = metrics.totalIndexingTimeMs > 0
    ? Math.round((metrics.totalRowsIndexed / (metrics.totalIndexingTimeMs / 1000)))
    : 0
  return (
    <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-bright">
          <Timer className="w-4 h-4 text-accent" />
          <span>Read & Parse Performance Timings</span>
        </div>
        <div className="flex items-center gap-2">
          {isIndexing ? (
            <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Stream Parsing ({indexingProgress}%)
            </span>
          ) : (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stream Complete
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Stream Indexing Time */}
        <div className="bg-background/80 p-3 rounded-lg border border-border/70">
          <div className="flex items-center gap-1.5 text-subtle text-[11px] font-mono mb-1">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Total Index Duration</span>
          </div>
          <div className="font-mono text-sm font-bold text-bright">
            {formatDuration(metrics.totalIndexingTimeMs)}
          </div>
          <div className="text-[10px] font-mono text-dim mt-0.5">
            {metrics.totalRowsIndexed > 0 ? `${metrics.totalRowsIndexed.toLocaleString()} rows scanned` : 'Scanning stream...'}
          </div>
        </div>

        {/* Metric 2: Stream Throughput Speed */}
        <div className="bg-background/80 p-3 rounded-lg border border-border/70">
          <div className="flex items-center gap-1.5 text-subtle text-[11px] font-mono mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Read Throughput</span>
          </div>
          <div className="font-mono text-sm font-bold text-emerald-400">
            {formatSpeed(metrics.bytesPerSecond)}
          </div>
          <div className="text-[10px] font-mono text-dim mt-0.5">
            100% in-browser memory
          </div>
        </div>

        {/* Metric 3: Page Slice Fetch Latency */}
        <div className="bg-background/80 p-3 rounded-lg border border-border/70">
          <div className="flex items-center gap-1.5 text-subtle text-[11px] font-mono mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Page {currentPage} Slice Time</span>
          </div>
          <div className="font-mono text-sm font-bold text-bright">
            {formatDuration(metrics.pageReadTimeMs)}
          </div>
          <div className="text-[10px] font-mono text-dim mt-0.5">
            {rowsPerPage} rows parsed & rendered
          </div>
        </div>

        {/* Metric 4: Initial Pre-scan & Delimiter Inspect */}
        <div className="bg-background/80 p-3 rounded-lg border border-border/70">
          <div className="flex items-center gap-1.5 text-subtle text-[11px] font-mono mb-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Header & Delim Detect</span>
          </div>
          <div className="font-mono text-sm font-bold text-bright">
            {formatDuration(metrics.initialInspectionTimeMs)}
          </div>
          <div className="text-[10px] font-mono text-dim mt-0.5">
            First 256 KB chunk
          </div>
        </div>
      </div>
    </div>
  )
}
