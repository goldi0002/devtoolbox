import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoryLabels, tools } from '../tools/registry'
import { useToolPreferences } from '../hooks/useToolPreferences'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const { favoriteSet, recentTools } = useToolPreferences()

  useEffect(() => {
    if (!open) return
    setQuery('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

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

  if (!open) return null

  const goToTools = () => {
    onClose()
    navigate('/tools')
  }

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
            placeholder="Search tools, actions, and categories..."
            className="w-full bg-transparent text-sm text-bright outline-none placeholder:text-subtle"
            aria-label="Search commands"
          />
          <kbd className="rounded border border-border px-2 py-1 text-[10px] font-mono text-muted">Esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          <button onClick={goToTools} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-surface focus:bg-surface focus:outline-none">
            <span>
              <span className="block text-sm font-medium text-bright">Browse all tools</span>
              <span className="block text-xs text-subtle">Open the complete categorized toolbox</span>
            </span>
            <span className="text-xs font-mono text-muted">/tools</span>
          </button>
          {scoredTools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm font-medium text-bright">No matching tools</p>
              <p className="mt-1 text-xs text-subtle">Try JSON, JWT, color, hash, timestamp, or formatter.</p>
            </div>
          ) : scoredTools.map(({ tool }) => (
            <Link key={tool.slug} to={`/${tool.slug}`} onClick={onClose} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface focus:bg-surface focus:outline-none">
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-bright">
                  {tool.name}
                  {favoriteSet.has(tool.slug) && <span className="text-amber-400" aria-label="Favorite">★</span>}
                </span>
                <span className="block truncate text-xs text-subtle">{categoryLabels[tool.category]} · {tool.description}</span>
              </span>
              <span className="ml-4 shrink-0 text-xs font-mono text-muted">/{tool.slug}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
