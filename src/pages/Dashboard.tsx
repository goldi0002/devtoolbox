import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tools, categoryLabels } from '../tools/registry'
import type { ToolMeta } from '../tools/tool-meta'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'
import { Search, Star, Clock, LayoutGrid, ArrowRight, Star as StarIcon } from 'lucide-react'

const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))]

export default function Dashboard() {
  usePageTitle('Dashboard')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { favoriteSet, favorites, recentTools, toggleFavorite } = useToolPreferences()

  const favoriteTools = useMemo(
    () => favorites.map(slug => tools.find(t => t.slug === slug)).filter((t): t is ToolMeta => Boolean(t)),
    [favorites]
  )
  const recentToolCards = useMemo(
    () => recentTools.map(slug => tools.find(t => t.slug === slug)).filter((t): t is ToolMeta => Boolean(t)),
    [recentTools]
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tools) counts[t.category] = (counts[t.category] ?? 0) + 1
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tools.filter(tool => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.includes(q))
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const stats = [
    { label: 'Total Tools', value: tools.length, icon: LayoutGrid },
    { label: 'Categories', value: categories.length - 1, icon: LayoutGrid },
    { label: 'Favorites', value: favorites.length, icon: Star },
    { label: 'Recently Used', value: recentTools.length, icon: Clock },
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SEO
        title="Dashboard — Manage All Your Tools"
        description="Central dashboard to browse, search, star, and manage all ToolBox4Devs developer utilities in one place."
        slug="dashboard"
        keywords={['dashboard', 'manage tools', 'tool manager', 'developer tools dashboard']}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="mb-8 animate-fade-in">
        <p className="eyebrow mb-3">Control Center</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-bright leading-none tracking-tight">
              TOOL <span className="text-accent">DASHBOARD</span>
            </h1>
            <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-dim">
              Manage all {tools.length} tools in one place — search, filter, star your favorites, and jump straight in.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="surface-panel p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <div className="font-display text-2xl text-bright leading-none tabular-nums">{stat.value}</div>
                <div className="text-[10px] font-mono text-subtle mt-1">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Favorites & Recents ──────────────────────────────────────────── */}
      {(favoriteTools.length > 0 || recentToolCards.length > 0) && (
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-1">
          {/* Favorites */}
          <div className="surface-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="eyebrow flex items-center gap-1.5">
                <Star size={12} className="text-accent" /> Favorites
              </h2>
              <span className="text-[10px] font-mono text-muted">{favoriteTools.length}</span>
            </div>
            {favoriteTools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {favoriteTools.map(tool => (
                  <div key={tool.slug} className="flex items-center gap-1 rounded-full border border-border bg-bg pr-1">
                    <Link to={`/${tool.slug}`} className="chip bg-transparent border-0 px-2.5 py-1">
                      {tool.name}
                    </Link>
                    <button
                      onClick={() => toggleFavorite(tool.slug)}
                      className="text-accent text-sm px-1 hover:scale-110 transition-transform"
                      aria-label={`Remove ${tool.name} from favorites`}
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-subtle">Star tools below to pin them here for quick access.</p>
            )}
          </div>

          {/* Recents */}
          <div className="surface-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="eyebrow flex items-center gap-1.5">
                <Clock size={12} className="text-accent" /> Recently Used
              </h2>
              <span className="text-[10px] font-mono text-muted">{recentToolCards.length}</span>
            </div>
            {recentToolCards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentToolCards.map(tool => (
                  <Link key={tool.slug} to={`/${tool.slug}`} className="chip bg-bg flex items-center gap-1">
                    {tool.name}
                    <ArrowRight size={11} className="text-subtle" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-subtle">Open a tool to build your recent list.</p>
            )}
          </div>
        </section>
      )}

      {/* ── Search + Filter ───────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 mb-6 border-y border-border bg-bg/85 px-4 sm:px-6 py-3 backdrop-blur-xl animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="input-base pl-8 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-dim font-mono text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`chip whitespace-nowrap shrink-0 ${activeCategory === cat ? 'chip-active' : ''}`}
              >
                {cat === 'all'
                  ? `All (${tools.length})`
                  : `${categoryLabels[cat as ToolMeta['category']]} (${categoryCounts[cat] ?? 0})`}
              </button>
            ))}
          </div>

          {!search && activeCategory === 'all' ? null : (
            <span className="text-xs font-mono text-subtle sm:ml-auto whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Tools Table ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface/40 py-20 text-center">
          <p className="text-sm font-mono text-dim mb-2">No tools found</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all') }}
            className="text-xs font-mono text-subtle hover:text-dim transition-colors underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface/40 overflow-hidden animate-slide-up">
          {/* Table header (desktop) */}
          <div className="hidden sm:grid grid-cols-[1fr_140px_100px_60px] gap-3 px-4 py-2.5 border-b border-border text-[10px] font-mono uppercase tracking-wider text-subtle">
            <span>Tool</span>
            <span>Category</span>
            <span>Slug</span>
            <span className="text-right">Star</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map(tool => (
              <div
                key={tool.slug}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_100px_60px] gap-3 px-4 py-3 items-center hover:bg-bg/60 transition-colors"
              >
                <div className="min-w-0">
                  <Link
                    to={`/${tool.slug}`}
                    className="text-sm font-sans font-medium text-bright hover:text-accent transition-colors truncate block"
                  >
                    {tool.name}
                  </Link>
                  <p className="text-xs text-dim font-sans truncate mt-0.5">{tool.description}</p>
                </div>

                <span className="hidden sm:block">
                  <span className="tag">{categoryLabels[tool.category]}</span>
                </span>

                <span className="hidden sm:block text-[10px] font-mono text-muted truncate">/{tool.slug}</span>

                <button
                  type="button"
                  onClick={() => toggleFavorite(tool.slug)}
                  className={`justify-self-end text-base transition-colors hover:scale-110 ${
                    favoriteSet.has(tool.slug) ? 'text-accent' : 'text-muted hover:text-subtle'
                  }`}
                  aria-label={favoriteSet.has(tool.slug) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                  aria-pressed={favoriteSet.has(tool.slug)}
                >
                  {favoriteSet.has(tool.slug) ? '★' : '☆'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 pt-6 border-t border-border text-xs font-mono text-subtle">
        {favorites.length} starred · {tools.length} total tools · all managed locally in your browser.
      </p>
    </main>
  )
}
