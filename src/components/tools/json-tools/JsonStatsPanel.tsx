import React from 'react'
import { JsonStats } from '../../../utils/jsonEngine'
import { BarChart3, Key, Layers, Box, ListTree, FileCode2, Zap, ArrowDown } from 'lucide-react'

interface JsonStatsPanelProps {
  stats: JsonStats
}

export default function JsonStatsPanel({ stats }: JsonStatsPanelProps) {
  const compressionRatio = stats.rawSizeBytes > 0 && stats.minifiedSizeBytes > 0
    ? Math.max(0, Math.round((1 - (stats.minifiedSizeBytes / stats.formattedSizeBytes)) * 100))
    : 0

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-border overflow-hidden font-mono text-xs shadow-lg">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2 text-[#cccccc] font-medium">
          <BarChart3 size={14} className="text-indigo-400" />
          <span>JSON Structure & Memory Analytics</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px]">
          <Zap size={11} />
          <span>Parsed in {stats.parseTimeMs}ms</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg">
            <div className="flex items-center gap-1.5 text-[#808080] text-[11px] mb-1">
              <Key size={12} className="text-sky-400" />
              <span>Total Keys</span>
            </div>
            <div className="text-base font-bold text-white">
              {stats.totalKeys.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg">
            <div className="flex items-center gap-1.5 text-[#808080] text-[11px] mb-1">
              <Layers size={12} className="text-amber-400" />
              <span>Max Depth</span>
            </div>
            <div className="text-base font-bold text-white">
              {stats.depth} <span className="text-[11px] font-normal text-[#808080]">levels</span>
            </div>
          </div>

          <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg">
            <div className="flex items-center gap-1.5 text-[#808080] text-[11px] mb-1">
              <Box size={12} className="text-purple-400" />
              <span>Objects & Arrays</span>
            </div>
            <div className="text-base font-bold text-white">
              {(stats.totalObjects + stats.totalArrays).toLocaleString()}
              <span className="text-[11px] font-normal text-[#808080] ml-1">
                ({stats.totalObjects} obj / {stats.totalArrays} arr)
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg">
            <div className="flex items-center gap-1.5 text-[#808080] text-[11px] mb-1">
              <FileCode2 size={12} className="text-emerald-400" />
              <span>Lines & Primitives</span>
            </div>
            <div className="text-base font-bold text-white">
              {stats.lineCount.toLocaleString()} <span className="text-[11px] font-normal text-[#808080]">lines</span>
            </div>
          </div>
        </div>

        {/* Primitive Types Breakdown */}
        <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg space-y-2">
          <div className="text-[11px] text-[#a0a0a0] font-medium flex items-center justify-between">
            <span>Data Type Distribution</span>
            <span>{stats.totalPrimitives.toLocaleString()} total primitives</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="px-2.5 py-1.5 bg-[#1e1e1e] rounded border border-[#333333] flex items-center justify-between">
              <span className="text-[#ce9178] text-[11px]">Strings</span>
              <span className="font-semibold text-white">{stats.stringCount}</span>
            </div>
            <div className="px-2.5 py-1.5 bg-[#1e1e1e] rounded border border-[#333333] flex items-center justify-between">
              <span className="text-[#b5cea8] text-[11px]">Numbers</span>
              <span className="font-semibold text-white">{stats.numberCount}</span>
            </div>
            <div className="px-2.5 py-1.5 bg-[#1e1e1e] rounded border border-[#333333] flex items-center justify-between">
              <span className="text-[#569cd6] text-[11px]">Booleans</span>
              <span className="font-semibold text-white">{stats.booleanCount}</span>
            </div>
            <div className="px-2.5 py-1.5 bg-[#1e1e1e] rounded border border-[#333333] flex items-center justify-between">
              <span className="text-[#808080] text-[11px]">Nulls</span>
              <span className="font-semibold text-white">{stats.nullCount}</span>
            </div>
          </div>
        </div>

        {/* Size & Minification Comparison */}
        <div className="p-3 bg-[#252526] border border-[#333333] rounded-lg">
          <div className="text-[11px] text-[#a0a0a0] font-medium mb-2.5 flex items-center justify-between">
            <span>Payload Size Comparison</span>
            {compressionRatio > 0 && (
              <span className="text-emerald-400 flex items-center gap-1">
                <ArrowDown size={11} />
                Minification saves {compressionRatio}% payload bandwidth
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-[#1e1e1e] rounded border border-[#333333]">
              <div className="text-[10px] text-[#707070]">Raw Input</div>
              <div className="text-xs font-semibold text-white mt-0.5">{formatSize(stats.rawSizeBytes)}</div>
            </div>
            <div className="p-2 bg-[#1e1e1e] rounded border border-[#333333]">
              <div className="text-[10px] text-[#707070]">Formatted (2 Spaces)</div>
              <div className="text-xs font-semibold text-sky-400 mt-0.5">{formatSize(stats.formattedSizeBytes)}</div>
            </div>
            <div className="p-2 bg-[#1e1e1e] rounded border border-emerald-500/30 bg-emerald-500/5">
              <div className="text-[10px] text-emerald-400/80">Minified (1 Line)</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">{formatSize(stats.minifiedSizeBytes)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
