import React, { useState, useMemo, useCallback } from 'react'
import { ChevronRight, ChevronDown, Copy, Check, Search, Layers, Braces, ListFilter } from 'lucide-react'

interface JsonTreeViewProps {
  data: any
  maxInitialDepth?: number
}

export default function JsonTreeView({ data, maxInitialDepth = 2 }: JsonTreeViewProps) {
  const [expandDepth, setExpandDepth] = useState<number>(maxInitialDepth)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const handleCopy = (text: string, path: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 1800)
  }

  const isPrimitive = data === null || typeof data !== 'object'

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] rounded-xl border border-border overflow-hidden font-mono text-xs shadow-lg">
      {/* Tree Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        {/* Left: Quick level expanders */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#858585] mr-1 flex items-center gap-1">
            <Layers size={13} className="text-indigo-400" />
            Expand:
          </span>
          {[
            { label: 'Collapse', depth: 0 },
            { label: 'L1', depth: 1 },
            { label: 'L2', depth: 2 },
            { label: 'L3', depth: 3 },
            { label: 'All', depth: 99 }
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => setExpandDepth(btn.depth)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                expandDepth === btn.depth
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-[#2d2d2d] hover:bg-[#383838] text-[#cccccc]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Right: Search in tree */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2 text-[#707070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search keys / values..."
              className="pl-6 pr-2 py-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[11px] text-[#e0e0e0] placeholder-[#606060] focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-[10px] text-[#808080] hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-3.5 overflow-auto max-h-[600px] min-h-[300px] select-text">
        {isPrimitive ? (
          <div className="p-2">
            <PrimitiveValue value={data} />
          </div>
        ) : (
          <TreeNode
            name="root"
            value={data}
            path="$"
            depth={0}
            targetExpandDepth={expandDepth}
            searchQuery={searchQuery}
            onCopy={handleCopy}
            copiedPath={copiedPath}
          />
        )}
      </div>

      {/* Tree Footer Status */}
      <div className="px-3.5 py-1.5 bg-[#252526] border-t border-[#3c3c3c] text-[11px] text-[#808080] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Braces size={12} className="text-sky-400" />
            Interactive Tree Explorer
          </span>
        </div>
        <div>
          <span>Hover node to copy JSONPath or raw value</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TreeNode Component
// ─────────────────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  name: string
  value: any
  path: string
  depth: number
  targetExpandDepth: number
  searchQuery: string
  onCopy: (text: string, path: string) => void
  copiedPath: string | null
}

const PAGE_SIZE = 100 // Virtual chunking for massive arrays / objects

function TreeNode({
  name,
  value,
  path,
  depth,
  targetExpandDepth,
  searchQuery,
  onCopy,
  copiedPath
}: TreeNodeProps) {
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null)
  const [page, setPage] = useState(1)

  // Auto-expand logic based on level button or search query
  const isExpanded = useMemo(() => {
    if (searchQuery.trim()) return true
    if (userExpanded !== null) return userExpanded
    return depth < targetExpandDepth
  }, [userExpanded, depth, targetExpandDepth, searchQuery])

  const keys = useMemo(() => {
    return isObject ? Object.keys(value) : []
  }, [isObject, value])

  const totalCount = keys.length

  // Filter keys if search query is active
  const filteredKeys = useMemo(() => {
    if (!isObject) return []
    if (!searchQuery.trim()) return keys
    const q = searchQuery.toLowerCase()
    return keys.filter(k => {
      const matchKey = k.toLowerCase().includes(q)
      const val = value[k]
      const matchVal = val !== null && typeof val !== 'object' && String(val).toLowerCase().includes(q)
      return matchKey || matchVal || (typeof val === 'object' && val !== null)
    })
  }, [isObject, keys, value, searchQuery])

  const visibleKeys = filteredKeys.slice(0, page * PAGE_SIZE)
  const hasMore = visibleKeys.length < filteredKeys.length

  const toggle = () => setUserExpanded(!isExpanded)

  if (!isObject) {
    return (
      <div className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-[#2a2d2e] rounded group transition-colors">
        <span className="text-[#9cdcfe] font-medium">{name}:</span>
        <PrimitiveValue value={value} />
        <NodeActions path={path} value={value} onCopy={onCopy} copiedPath={copiedPath} />
      </div>
    )
  }

  return (
    <div className="py-0.5 select-text">
      {/* Header Row */}
      <div className="flex items-center gap-1 py-0.5 px-1 hover:bg-[#2a2d2e] rounded cursor-pointer group transition-colors">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          className="p-0.5 text-[#858585] hover:text-white rounded"
        >
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        <span
          onClick={toggle}
          className="font-medium text-[#9cdcfe] hover:underline"
        >
          {name}
        </span>

        <span className="text-[#6a9955] text-[11px]">
          {isArray ? `Array(${totalCount})` : `Object {${totalCount}}`}
        </span>

        <NodeActions
          path={path}
          value={value}
          onCopy={onCopy}
          copiedPath={copiedPath}
        />
      </div>

      {/* Children Rows */}
      {isExpanded && (
        <div className="pl-4 border-l border-[#3c3c3c]/60 ml-2 space-y-0.5 mt-0.5">
          {visibleKeys.map(k => {
            const childValue = value[k]
            const childPath = isArray ? `${path}[${k}]` : `${path}.${k}`

            return (
              <TreeNode
                key={k}
                name={k}
                value={childValue}
                path={childPath}
                depth={depth + 1}
                targetExpandDepth={targetExpandDepth}
                searchQuery={searchQuery}
                onCopy={onCopy}
                copiedPath={copiedPath}
              />
            )
          })}

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="mt-1 px-2 py-1 bg-[#2d2d2d] hover:bg-[#383838] text-indigo-400 hover:text-indigo-300 rounded text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <ListFilter size={12} />
              Show more (+{Math.min(PAGE_SIZE, filteredKeys.length - visibleKeys.length)} of {filteredKeys.length} items)
            </button>
          )}

          {filteredKeys.length === 0 && searchQuery && (
            <div className="text-[#707070] text-[11px] py-1 italic">
              No matching properties in this node
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PrimitiveValue({ value }: { value: any }) {
  if (value === null) {
    return <span className="text-[#808080] italic">null</span>
  }
  if (value === undefined) {
    return <span className="text-[#808080] italic">undefined</span>
  }
  if (typeof value === 'boolean') {
    return <span className="text-[#569cd6] font-semibold">{value ? 'true' : 'false'}</span>
  }
  if (typeof value === 'number') {
    return <span className="text-[#b5cea8]">{value}</span>
  }
  if (typeof value === 'string') {
    return <span className="text-[#ce9178] break-all">"{value}"</span>
  }
  return <span>{String(value)}</span>
}

function NodeActions({
  path,
  value,
  onCopy,
  copiedPath
}: {
  path: string
  value: any
  onCopy: (text: string, path: string) => void
  copiedPath: string | null
}) {
  const isCopied = copiedPath === path

  return (
    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onCopy(path, path)
        }}
        title={`Copy JSONPath: ${path}`}
        className="px-1.5 py-0.5 rounded bg-[#333333] hover:bg-[#444444] text-[10px] text-[#cccccc] flex items-center gap-1 transition-colors"
      >
        {isCopied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
        <span>Path</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
          onCopy(text, `${path}_val`)
        }}
        title="Copy Raw Value"
        className="px-1.5 py-0.5 rounded bg-[#333333] hover:bg-[#444444] text-[10px] text-[#cccccc] flex items-center gap-1 transition-colors"
      >
        {copiedPath === `${path}_val` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
        <span>Value</span>
      </button>
    </div>
  )
}
