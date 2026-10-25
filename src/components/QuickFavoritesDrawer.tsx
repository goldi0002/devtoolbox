import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, X, Trash2, ArrowUpRight, Search, Sparkles } from 'lucide-react'
import { tools } from '../tools/registry'
import type { ToolMeta } from '../tools/tool-meta'
import { useToolPreferences } from '../hooks/useToolPreferences'

interface QuickFavoritesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function filterTools(list: ToolMeta[], search: string): ToolMeta[] {
  if (!search.trim()) return list
  const q = search.toLowerCase()
  return list.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.keywords?.some(k => k.toLowerCase().includes(q))
  )
}

export default function QuickFavoritesDrawer({ isOpen, onClose }: QuickFavoritesDrawerProps) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recents'>('all')
  const { favorites, favoriteSet, recentTools, toggleFavorite, clearRecentTools, removeRecentTool } = useToolPreferences()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setSearch('')
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const favoriteToolMetas = useMemo(() => {
    return favorites
      .map(slug => tools.find(t => t.slug === slug))
      .filter((t): t is ToolMeta => Boolean(t))
  }, [favorites])

  const recentToolMetas = useMemo(() => {
    return recentTools
      .map(slug => tools.find(t => t.slug === slug))
      .filter((t): t is ToolMeta => Boolean(t))
  }, [recentTools])

  const filteredFavorites = useMemo(
    () => filterTools(favoriteToolMetas, search),
    [favoriteToolMetas, search]
  )
  const filteredRecents = useMemo(
    () => filterTools(recentToolMetas, search),
    [recentToolMetas, search]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" aria-labelledby="favorites-drawer-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <aside className="w-screen max-w-md pointer-events-auto bg-surface/95 border-l border-border shadow-2xl backdrop-blur-xl flex flex-col h-full animate-slide-left">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
                <Star className="w-4 h-4 fill-accent" />
              </div>
              <div>
                <h2 id="favorites-drawer-title" className="text-sm font-semibold font-sans text-bright tracking-tight">
                  Favorites & Recent Tools
                </h2>
                <p className="text-[11px] font-mono text-subtle">
                  Instant drawer · <kbd className="px-1 py-0.5 border border-border text-[9px] rounded">Shift+F</kbd>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-subtle hover:text-bright hover:bg-surface-elevated transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="p-4 border-b border-border/80 space-y-3 bg-surface/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter pinned or recent tools..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-bg/80 border border-border rounded-lg text-bright placeholder:text-muted focus:outline-none focus:border-accent font-sans transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted hover:text-bright"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-bg/60 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'all'
                    ? 'bg-surface text-bright shadow-sm border border-border'
                    : 'text-subtle hover:text-bright'
                }`}
              >
                All ({favoriteToolMetas.length + recentToolMetas.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'favorites'
                    ? 'bg-surface text-bright shadow-sm border border-border'
                    : 'text-subtle hover:text-bright'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Pinned ({favoriteToolMetas.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recents')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'recents'
                    ? 'bg-surface text-bright shadow-sm border border-border'
                    : 'text-subtle hover:text-bright'
                }`}
              >
                <Clock className="w-3 h-3 text-sky-400" />
                <span>Recents ({recentToolMetas.length})</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-border/40 space-y-4">

            {/* Pinned Favorites Section */}
            {(activeTab === 'all' || activeTab === 'favorites') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-dim">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Pinned Favorites ({filteredFavorites.length})</span>
                  </div>
                </div>

                {filteredFavorites.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-border/70 text-center my-1 bg-surface/30">
                    <Star className="w-5 h-5 mx-auto text-muted mb-1.5" />
                    <p className="text-xs text-subtle font-sans">
                      {search ? 'No pinned tools match your search.' : 'No tools pinned yet.'}
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      Click the star icon on any tool card or tool header to pin it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredFavorites.map(tool => (
                      <div
                        key={tool.slug}
                        className="group flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-surface/50 hover:bg-surface hover:border-accent/50 transition-all"
                      >
                        <Link
                          to={`/${tool.slug}`}
                          onClick={onClose}
                          className="flex-1 min-w-0 flex items-center gap-2.5"
                        >
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-subtle group-hover:text-accent border border-border/50 shrink-0">
                            {tool.tag}
                          </span>
                          <div className="truncate">
                            <h4 className="text-xs font-medium text-bright group-hover:text-accent truncate">
                              {tool.name}
                            </h4>
                            <p className="text-[10px] text-muted truncate">/{tool.slug}</p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(tool.slug)}
                            className="p-1 rounded text-amber-400 hover:bg-surface-elevated transition-colors"
                            title="Unpin tool"
                            aria-label={`Unpin ${tool.name}`}
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </button>
                          <Link
                            to={`/${tool.slug}`}
                            onClick={onClose}
                            className="p-1 rounded text-subtle hover:text-bright hover:bg-surface-elevated transition-colors"
                            title="Open tool"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Tools Section */}
            {(activeTab === 'all' || activeTab === 'recents') && (
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-dim">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Recent Sessions ({filteredRecents.length})</span>
                  </div>
                  {recentToolMetas.length > 0 && (
                    <button
                      type="button"
                      onClick={clearRecentTools}
                      className="text-[10px] font-mono text-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {filteredRecents.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-border/70 text-center my-1 bg-surface/30">
                    <Clock className="w-5 h-5 mx-auto text-muted mb-1.5" />
                    <p className="text-xs text-subtle font-sans">
                      {search ? 'No recent tools match your search.' : 'No recent tools yet.'}
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                      Tools you open will automatically appear in your session history.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredRecents.map(tool => (
                      <div
                        key={tool.slug}
                        className="group flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-surface/50 hover:bg-surface hover:border-accent/50 transition-all"
                      >
                        <Link
                          to={`/${tool.slug}`}
                          onClick={onClose}
                          className="flex-1 min-w-0 flex items-center gap-2.5"
                        >
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-subtle group-hover:text-accent border border-border/50 shrink-0">
                            {tool.tag}
                          </span>
                          <div className="truncate">
                            <h4 className="text-xs font-medium text-bright group-hover:text-accent truncate">
                              {tool.name}
                            </h4>
                            <p className="text-[10px] text-muted truncate">/{tool.slug}</p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(tool.slug)}
                            className={`p-1 rounded transition-colors ${
                              favoriteSet.has(tool.slug)
                                ? 'text-amber-400 hover:bg-surface-elevated'
                                : 'text-subtle hover:text-amber-400 hover:bg-surface-elevated'
                            }`}
                            title={favoriteSet.has(tool.slug) ? 'Unpin tool' : 'Pin tool'}
                            aria-label={`${favoriteSet.has(tool.slug) ? 'Unpin' : 'Pin'} ${tool.name}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${favoriteSet.has(tool.slug) ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRecentTool(tool.slug)}
                            className="p-1 rounded text-subtle hover:text-red-400 hover:bg-surface-elevated transition-colors"
                            title="Remove from recents"
                            aria-label={`Remove ${tool.name} from recents`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <Link
                            to={`/${tool.slug}`}
                            onClick={onClose}
                            className="p-1 rounded text-subtle hover:text-bright hover:bg-surface-elevated transition-colors"
                            title="Open tool"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-5 py-3 border-t border-border bg-surface/80 flex items-center justify-between text-[11px] font-mono text-muted">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              100% Client-Side Memory
            </span>
            <span>Total Tools: {tools.length}</span>
          </div>

        </aside>
      </div>
    </div>
  )
}
