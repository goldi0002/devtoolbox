import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryLabels, tools } from '../tools/registry'
import { useToolPreferences } from '../hooks/useToolPreferences'
import { generateUlids, generateUuidV7s } from '../utils/sortableId'
import ToolIcon from './ui/ToolIcon'
import { Check, Clock, Copy, Hash, LayoutGrid, Workflow } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface QuickActionItem {
  id: string
  title: string
  subtitle: string
  keywords: string[]
  run: () => string | void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null)
  const { favoriteSet, recentTools } = useToolPreferences()

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedIndex(0)
    setCopiedActionId(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  const quickActions = useMemo<QuickActionItem[]>(
    () => [
      {
        id: 'copy-uuid-v4',
        title: 'Copy fresh UUID v4',
        subtitle: 'Generate cryptographic UUID v4 into clipboard',
        keywords: ['uuid', 'guid', 'random', 'id', 'copy'],
        run: () => {
          const val = crypto.randomUUID()
          navigator.clipboard?.writeText(val)
          return val
        },
      },
      {
        id: 'copy-ulid',
        title: 'Copy fresh ULID',
        subtitle: 'Generate time-sortable 26-char ULID into clipboard',
        keywords: ['ulid', 'sortable', 'id', 'copy'],
        run: () => {
          const val = generateUlids(1)[0]
          navigator.clipboard?.writeText(val)
          return val
        },
      },
      {
        id: 'copy-uuid-v7',
        title: 'Copy fresh UUID v7',
        subtitle: 'Generate RFC 9562 time-ordered UUID v7 into clipboard',
        keywords: ['uuidv7', 'uuid', 'v7', 'rfc', 'copy'],
        run: () => {
          const val = generateUuidV7s(1)[0]
          navigator.clipboard?.writeText(val)
          return val
        },
      },
      {
        id: 'copy-timestamp',
        title: 'Copy Unix Timestamp (seconds)',
        subtitle: 'Copy current epoch seconds to clipboard',
        keywords: ['unix', 'epoch', 'timestamp', 'time', 'now', 'copy'],
        run: () => {
          const val = String(Math.floor(Date.now() / 1000))
          navigator.clipboard?.writeText(val)
          return val
        },
      },
    ],
    []
  )

  const matchingQuickActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return quickActions.slice(0, 2)
    return quickActions.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.keywords.some(k => k.includes(q))
    )
  }, [query, quickActions])

  const scoredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools
      .map(tool => {
        const searchable = [tool.name, tool.description, tool.tag, tool.category, ...tool.keywords].join(' ').toLowerCase()
        const exactName = tool.name.toLowerCase().startsWith(q) ? 20 : 0
        const favoriteBoost = favoriteSet.has(tool.slug) ? 4 : 0
        const recentBoost = recentTools.includes(tool.slug) ? 3 : 0
        const matches = !q || searchable.includes(q)
        return { tool, score: exactName + favoriteBoost + recentBoost + (matches ? 1 : 0), matches }
      })
      .filter(item => item.matches)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
      .slice(0, 8)
  }, [favoriteSet, query, recentTools])

  // Selectable items:
  // 0: Browse all tools
  // 1: Open Pipeline Studio
  // 2..(2 + matchingQuickActions.length - 1): Quick Actions
  // remaining: scoredTools
  const staticCount = 2
  const quickStartIdx = staticCount
  const toolStartIdx = staticCount + matchingQuickActions.length
  const totalItems = toolStartIdx + scoredTools.length

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const triggerQuickAction = (action: QuickActionItem) => {
    action.run()
    setCopiedActionId(action.id)
    window.setTimeout(() => {
      setCopiedActionId(prev => (prev === action.id ? null : prev))
    }, 1400)
  }

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        if (selectedIndex === 0) {
          onClose()
          navigate('/tools')
        } else if (selectedIndex === 1) {
          onClose()
          navigate('/pipeline-studio')
        } else if (selectedIndex >= quickStartIdx && selectedIndex < toolStartIdx) {
          const action = matchingQuickActions[selectedIndex - quickStartIdx]
          if (action) triggerQuickAction(action)
        } else {
          const targetTool = scoredTools[selectedIndex - toolStartIdx]?.tool
          if (targetTool) {
            onClose()
            navigate(`/${targetTool.slug}`)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [matchingQuickActions, navigate, onClose, open, quickStartIdx, scoredTools, selectedIndex, toolStartIdx, totalItems])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button className="absolute inset-0 bg-bg/70 backdrop-blur-md" onClick={onClose} aria-label="Close command palette" />
      <div className="relative mx-auto mt-20 w-[min(92vw,44rem)] overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 border-b border-border bg-surface/70 px-4 py-3">
          <span className="text-sm text-subtle" aria-hidden="true">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search 100+ tools, or run quick actions (uuid, ulid, epoch)..."
            className="w-full bg-transparent text-sm text-bright outline-none placeholder:text-subtle"
            aria-label="Search commands"
          />
          <kbd className="rounded border border-border px-2 py-1 text-[10px] font-mono text-muted">Esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          <button
            onClick={() => {
              onClose()
              navigate('/tools')
            }}
            onMouseEnter={() => setSelectedIndex(0)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
              selectedIndex === 0 ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-surface border border-border text-subtle">
                <LayoutGrid size={15} />
              </div>
              <span>
                <span className="block text-sm font-medium text-bright">Browse all {tools.length} tools</span>
                <span className="block text-xs text-subtle">Open the complete categorized toolbox</span>
              </span>
            </div>
            <span className="text-xs font-mono text-muted">/tools</span>
          </button>

          <button
            onClick={() => {
              onClose()
              navigate('/pipeline-studio')
            }}
            onMouseEnter={() => setSelectedIndex(1)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
              selectedIndex === 1 ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-surface border border-border text-accent">
                <Workflow size={15} />
              </div>
              <span>
                <span className="block text-sm font-medium text-bright">DevFlow Pipeline Studio</span>
                <span className="block text-xs text-subtle">Chain JSON, YAML, Base64, JWT, Hex, and Regex steps</span>
              </span>
            </div>
            <span className="text-xs font-mono text-muted">/pipeline-studio</span>
          </button>

          {matchingQuickActions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/60">
              <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-subtle">
                Instant Copy Actions
              </div>
              {matchingQuickActions.map((action, idx) => {
                const itemIdx = quickStartIdx + idx
                const isCopied = copiedActionId === action.id
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => triggerQuickAction(action)}
                    onMouseEnter={() => setSelectedIndex(itemIdx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      selectedIndex === itemIdx ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-surface border border-border text-dim">
                        {action.id.includes('timestamp') ? <Clock size={14} /> : <Hash size={14} />}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-bright truncate">{action.title}</span>
                        <span className="block text-xs text-subtle truncate">{action.subtitle}</span>
                      </div>
                    </div>
                    <span className="ml-3 flex items-center gap-1 text-xs font-mono text-accent shrink-0">
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Run</span>
                        </>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-border/60">
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-subtle">
              Tools
            </div>
            {scoredTools.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-bright">No matching tools</p>
                <p className="mt-1 text-xs text-subtle">Try OpenAPI, Regex Railroad, TOTP, cURL, JSON, SQL, or JWT.</p>
              </div>
            ) : (
              scoredTools.map(({ tool }, idx) => {
                const itemIndex = toolStartIdx + idx
                const isSelected = selectedIndex === itemIndex
                return (
                  <Link
                    key={tool.slug}
                    to={`/${tool.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                      isSelected ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ToolIcon slug={tool.slug} category={tool.category} name={tool.icon} withBadge badgeSize="sm" size={14} />
                      <div className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium text-bright">
                          <span className="truncate">{tool.name}</span>
                          {favoriteSet.has(tool.slug) && <span className="text-amber-400" aria-label="Favorite">★</span>}
                          {tool.isNew && <span className="text-[10px] font-mono text-accent">New</span>}
                        </span>
                        <span className="block truncate text-xs text-subtle">
                          {categoryLabels[tool.category]} · {tool.description}
                        </span>
                      </div>
                    </div>
                    <span className="ml-4 shrink-0 text-xs font-mono text-muted">/{tool.slug}</span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
