import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tools, categoryLabels } from '../tools/registry'
import type { ToolMeta } from '../tools/tool-meta'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'
import {
  Search,
  Star,
  Clock,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Bookmark,
} from 'lucide-react'

const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))]

// Category icons and color accents for the overview cards
const categoryMeta: Record<string, { icon: string; color: string; gradient: string }> = {
  'json-tools':        { icon: '{ }',  color: 'text-amber-400',  gradient: 'from-amber-500/20 to-amber-600/5' },
  'encode-tools':      { icon: '🔒',  color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  'text-tools':        { icon: 'Aa',   color: 'text-sky-400',    gradient: 'from-sky-500/20 to-sky-600/5' },
  'generate-tools':    { icon: '⚡',   color: 'text-violet-400', gradient: 'from-violet-500/20 to-violet-600/5' },
  'auth-tools':        { icon: '🔑',  color: 'text-rose-400',   gradient: 'from-rose-500/20 to-rose-600/5' },
  'web-tools':         { icon: '🌐',  color: 'text-cyan-400',   gradient: 'from-cyan-500/20 to-cyan-600/5' },
  'data-tools':        { icon: '📊',  color: 'text-orange-400',  gradient: 'from-orange-500/20 to-orange-600/5' },
  'crypto-tools':      { icon: '🛡️', color: 'text-red-400',     gradient: 'from-red-500/20 to-red-600/5' },
  'analyze-tools':     { icon: '🔍',  color: 'text-indigo-400',  gradient: 'from-indigo-500/20 to-indigo-600/5' },
}

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
    { label: 'Total Tools', value: tools.length, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Categories', value: categories.length - 1, icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Favorites', value: favorites.length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Recently Used', value: recentTools.length, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  const showFavoritesRecents = favoriteTools.length > 0 || recentToolCards.length > 0
  const showAllTools = activeCategory === 'all' && !search

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SEO
        title="Dashboard — Manage All Your Tools"
        description="Central dashboard to browse, search, star, and manage all ToolBox4Devs developer utilities in one place."
        slug="dashboard"
        keywords={['dashboard', 'manage tools', 'tool manager', 'developer tools dashboard']}
      />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative mb-10 pt-4 pb-10 text-center sm:text-left animate-fade-in">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-indigo-400 text-[11px] font-mono font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Command Center
            </div>

            <h1 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.9] tracking-tight">
              <span className="text-bright">TOOL</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                DASHBOARD
              </span>
            </h1>

            <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-dim">
              Browse, search, and organize all {tools.length} developer utilities. Star your favorites, track recent usage, and jump straight to work.
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/tools"
              className="btn-ghost !py-2 !px-3.5 !text-xs !gap-1.5"
            >
              <LayoutGrid size={14} />
              Full Directory
              <ArrowUpRight size={12} className="text-subtle" />
            </Link>
            <Link
              to="/"
              className="btn-primary !py-2 !px-3.5 !text-xs !gap-1.5"
            >
              <Sparkles size={14} />
              Home
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="surface-panel p-4 group hover:border-border/80 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-display text-2xl text-bright leading-none tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-subtle mt-1.5">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Favorites & Recents ──────────────────────────────────────────── */}
      {showFavoritesRecents && (
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up stagger-1">
          {/* Favorites Panel */}
          <div className="surface-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Star size={14} className="text-amber-400" />
                </div>
                <h2 className="text-xs font-mono text-dim font-semibold tracking-wide uppercase">Favorites</h2>
              </div>
              <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded-full bg-surface border border-border">
                {favoriteTools.length} starred
              </span>
            </div>

            {favoriteTools.length > 0 ? (
              <div className="space-y-2">
                {favoriteTools.map(tool => (
                  <div key={tool.slug} className="group flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-bg/40 transition-all duration-150">
                    <Link to={`/${tool.slug}`} className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-accent-soft flex items-center justify-center shrink-0 text-[10px] font-mono text-accent font-bold">
                        {tool.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-sans font-medium text-bright truncate group-hover:text-accent transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted truncate">
                          /{tool.slug}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleFavorite(tool.slug)}
                      className="text-amber-400/60 hover:text-amber-400 text-sm px-1 transition-all hover:scale-110 shrink-0"
                      aria-label={`Remove ${tool.name} from favorites`}
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <Bookmark size={16} className="text-amber-400/50" />
                </div>
                <p className="text-xs text-subtle font-sans">No favorites yet</p>
                <p className="text-[10px] text-muted font-mono mt-1">Star tools from the list below to pin them here</p>
              </div>
            )}
          </div>

          {/* Recents Panel */}
          <div className="surface-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <Clock size={14} className="text-emerald-400" />
                </div>
                <h2 className="text-xs font-mono text-dim font-semibold tracking-wide uppercase">Recently Used</h2>
              </div>
              <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded-full bg-surface border border-border">
                {recentToolCards.length} tools
              </span>
            </div>

            {recentToolCards.length > 0 ? (
              <div className="space-y-2">
                {recentToolCards.map((tool, i) => (
                  <Link
                    key={tool.slug}
                    to={`/${tool.slug}`}
                    className="group flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-bg/40 transition-all duration-150"
                  >
                    <div className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono text-muted font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-sans font-medium text-bright truncate group-hover:text-accent transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-[10px] font-mono text-muted truncate">
                        {categoryLabels[tool.category]}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Clock size={16} className="text-emerald-400/50" />
                </div>
                <p className="text-xs text-subtle font-sans">No recent tools</p>
                <p className="text-[10px] text-muted font-mono mt-1">Open a tool to build your activity history</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Category Overview (when not filtered) ────────────────────────── */}
      {showAllTools && (
        <section className="mb-10 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono text-dim font-semibold tracking-wide uppercase">Browse by Category</h2>
              <span className="text-[10px] font-mono text-muted">({categories.length - 1} categories)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(categories.filter(c => c !== 'all') as string[]).map(cat => {
              const meta = categoryMeta[cat] || { icon: '📦', color: 'text-dim', gradient: 'from-gray-500/20 to-gray-600/5' }
              const count = categoryCounts[cat] ?? 0
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`group relative p-4 rounded-xl border border-border bg-surface/50 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="text-lg mb-2">{meta.icon}</div>
                    <div className="text-xs font-sans font-semibold text-bright truncate">{categoryLabels[cat as keyof typeof categoryLabels]}</div>
                    <div className="text-[10px] font-mono text-muted mt-1">{count} tool{count !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Search + Filter Bar ───────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 mb-6 border-y border-border bg-bg/90 px-4 sm:px-6 py-3.5 backdrop-blur-xl animate-slide-up stagger-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="input-base pl-9 w-full"
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

          {search || activeCategory !== 'all' ? (
            <span className="text-xs font-mono text-subtle sm:ml-auto whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Tools Grid ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/40 py-20 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
            <Search size={18} className="text-muted" />
          </div>
          <p className="text-sm font-sans text-dim mb-1">No tools found</p>
          <p className="text-xs font-mono text-muted mb-4">No results match "{search}"</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all') }}
            className="btn-ghost !text-xs !py-1.5 !px-3"
          >
            Clear filters
          </button>
        </div>
      ) : showAllTools ? (
        // Grouped by category when showing all
        <div className="space-y-10">
          {(categories.filter(c => c !== 'all') as string[]).map(cat => {
            const catTools = tools.filter(t => t.category === cat)
            if (!catTools.length) return null
            const meta = categoryMeta[cat] || { icon: '📦', color: 'text-dim', gradient: 'from-gray-500/20 to-gray-600/5' }
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-dim font-semibold tracking-wide uppercase">
                    {categoryLabels[cat as ToolMeta['category']]}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-mono text-muted">{catTools.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catTools.map((tool, i) => (
                    <DashboardToolCard
                      key={tool.slug}
                      tool={tool}
                      index={i}
                      isFavorite={favoriteSet.has(tool.slug)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Flat grid when searching/filtering
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool, i) => (
            <DashboardToolCard
              key={tool.slug}
              tool={tool}
              index={i}
              isFavorite={favoriteSet.has(tool.slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="mt-10 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-subtle">
            {favorites.length} starred · {tools.length} total tools · all managed locally in your browser
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>100% Client-Side</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
              <Zap size={12} className="text-amber-400" />
              <span>Zero Latency</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Dashboard Tool Card ──────────────────────────────────────────────────────

function DashboardToolCard({ tool, index, isFavorite, onToggleFavorite }: {
  tool: ToolMeta
  index: number
  isFavorite: boolean
  onToggleFavorite: (slug: string) => void
}) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6']
  const delay = delays[index % delays.length]

  if (tool.status === 'coming-soon') {
    return (
      <div className="card flex flex-col gap-3 opacity-50 cursor-not-allowed animate-slide-up">
        <div className="flex items-center justify-between">
          <span className="tag">{tool.tag}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">soon</span>
        </div>
        <div className="flex-1">
          <h3 className="text-bright font-sans font-semibold text-sm mb-1">{tool.name}</h3>
          <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
        </div>
        <div className="pt-2 border-t border-border">
          <span className="text-[10px] font-mono text-subtle">/{tool.slug}</span>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={`/${tool.slug}`}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border
                  bg-surface/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50
                  hover:shadow-lift animate-slide-up opacity-0 ${delay}`}
    >
      {/* Top accent line on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="flex items-center justify-between">
        <span className="tag">{tool.tag}</span>
        <button
          type="button"
          onClick={event => { event.preventDefault(); onToggleFavorite(tool.slug) }}
          className={`rounded-full text-sm transition-all hover:scale-110 ${
            isFavorite ? 'text-amber-400' : 'text-muted hover:text-amber-400/60'
          }`}
          aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="flex-1">
        <h3 className="mb-1 font-sans text-sm font-semibold text-bright transition-colors group-hover:text-accent">
          {tool.name}
        </h3>
        <p className="text-dim text-xs leading-relaxed font-sans line-clamp-2">{tool.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span className="text-[10px] font-mono text-muted group-hover:text-subtle transition-colors">
          /{tool.slug}
        </span>
        <ChevronRight size={13} className="text-subtle group-hover:text-accent transition-all group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
