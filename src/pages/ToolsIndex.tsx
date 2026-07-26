import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ToolMeta } from '../tools/tool-meta'
import { tools, categoryLabels } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'

const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))] as const

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ToolsIndex() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()

  // Derive from URL — not from useState so back/forward navigation works
  const activeCategory = category && categories.includes(category as any)
    ? category
    : 'all'

  const [search, setSearch] = useState('')
  const { favoriteSet, favorites, recentTools, toggleFavorite } = useToolPreferences()

  // Clear search when URL category changes (browser back/forward)
  useEffect(() => {
    setSearch('')
  }, [category])

  const pageTitle = activeCategory !== 'all'
    ? `${categoryLabels[activeCategory as ToolMeta['category']]} Tools`
    : 'All Tools'

  usePageTitle(pageTitle)

  const handleCategoryChange = (cat: string) => {
    setSearch('')
    navigate(cat === 'all' ? '/tools' : `/tools/${cat}`, { replace: true })
  }

  const filtered = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.includes(q))
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const favoriteTools = useMemo(() => favorites.map(slug => tools.find(tool => tool.slug === slug)).filter((tool): tool is ToolMeta => Boolean(tool)), [favorites])
  const recentToolCards = useMemo(() => recentTools.map(slug => tools.find(tool => tool.slug === slug)).filter((tool): tool is ToolMeta => Boolean(tool)), [recentTools])

  const showingAll = filtered.length === tools.length

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <SEO
        title={pageTitle}
        description={`${tools.length} free browser-based developer tools. JSON formatter, JWT decoder, UUID generator and more. No ads, no tracking.`}
        slug={activeCategory === 'all' ? 'tools' : `tools/${activeCategory}`}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="mb-12 animate-fade-in">
        <p className="eyebrow mb-4">Toolbox</p>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[clamp(2.75rem,8vw,5rem)] text-bright leading-[0.9] tracking-tight">
              ALL <span className="text-accent">TOOLS</span>
            </h1>
            <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-dim">
              Search {tools.length} browser-based utilities, filter by category, and star the ones you
              reach for daily.
            </p>
          </div>

          <div className="flex items-end gap-8 pb-1">
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none tabular-nums">
                {String(tools.length).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1">total tools</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none tabular-nums">
                {String(categories.length - 1).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1">categories</div>
            </div>
          </div>
        </div>
      </section>

      {activeCategory === 'all' && !search && (favoriteTools.length > 0 || recentToolCards.length > 0) && (
        <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2 animate-slide-up stagger-1" aria-label="Personal tool shortcuts">
          {[{ title: 'Favorites', items: favoriteTools, empty: 'Star tools to pin them here.' }, { title: 'Recently used', items: recentToolCards, empty: 'Open a tool to build your recent list.' }].map(group => (
            <div key={group.title} className="surface-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="eyebrow">{group.title}</h2>
                <span className="text-[10px] font-mono text-muted">Local</span>
              </div>
              {group.items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.items.slice(0, 6).map(tool => (
                    <Link key={tool.slug} to={`/${tool.slug}`} className="chip bg-bg">
                      {tool.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-subtle">{group.empty}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Search + Filter ────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 mb-10 border-y border-border bg-bg/85 px-4 sm:px-6 py-4 backdrop-blur-xl animate-slide-up stagger-1">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle font-mono text-xs select-none">
              ⌕
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="input-base pl-7 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-dim
                           font-mono text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={activeCategory === cat && !search}
                className={`chip whitespace-nowrap shrink-0 ${activeCategory === cat && !search ? 'chip-active' : ''}`}
              >
                {cat === 'all'
                  ? `All (${tools.length})`
                  : categoryLabels[cat as ToolMeta['category']]
                }
              </button>
            ))}
          </div>

          {/* Result count */}
          {!showingAll && (
            <span className="text-xs font-mono text-subtle sm:ml-auto whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Tools grid ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface/40 py-24 text-center">
          <p className="text-sm font-mono text-dim mb-2">No tools found</p>
          <p className="text-xs font-mono text-subtle mb-6">No results for "{search}"</p>
          <button
            onClick={() => { setSearch(''); handleCategoryChange('all') }}
            className="text-xs font-mono text-subtle hover:text-dim transition-colors underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {activeCategory === 'all' && !search ? (
            // Grouped by category
            <div className="space-y-12">
              {(categories.filter(c => c !== 'all') as string[]).map(cat => {
                const catTools = tools.filter(t => t.category === cat)
                if (!catTools.length) return null
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="eyebrow">
                        {categoryLabels[cat as ToolMeta['category']]}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] font-mono text-muted">{catTools.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {catTools.map((tool, i) => (
                        <ToolGridCard key={tool.slug} tool={tool} index={i} isFavorite={favoriteSet.has(tool.slug)} onToggleFavorite={toggleFavorite} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Flat grid when filtered or searching
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((tool, i) => (
                <ToolGridCard key={tool.slug} tool={tool} index={i} isFavorite={favoriteSet.has(tool.slug)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <p className="mt-16 pt-8 border-t border-border text-xs font-mono text-subtle">
        More tools coming soon ·
        <span className="ml-1 text-muted">every utility runs client-side, no data leaves your browser.</span>
      </p>
    </main>
  )
}

// ─── Tool Card ───────────────────────────────────────────────────────────────

function ToolGridCard({ tool, index, isFavorite, onToggleFavorite }: { tool: ToolMeta; index: number; isFavorite: boolean; onToggleFavorite: (slug: string) => void }) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6']
  const delay = delays[index % delays.length]
  if (tool.status === 'coming-soon') {
    return (
      <div
        className={`card flex flex-col gap-3 opacity-50 cursor-not-allowed animate-slide-up ${delay}`}
      >
        <div className="flex items-center justify-between">
          <span className="tag">{tool.tag}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">soon</span>
        </div>
        <div className="flex-1">
          <h3 className="text-bright font-sans font-semibold text-sm mb-1">{tool.name}</h3>
          <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
        </div>

        <div className="pt-2 border-t border-border">
          <span className="text-[10px] font-mono text-subtle">
            /{tool.slug}
          </span>
        </div>
      </div>
    )
  }
  return (
    <Link
      to={`/${tool.slug}`}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border
                  bg-surface/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent
                  hover:shadow-lift animate-slide-up opacity-0 ${delay}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between">
        <span className="tag">{tool.tag}</span>
        <button
          type="button"
          onClick={event => { event.preventDefault(); onToggleFavorite(tool.slug) }}
          className={`rounded-full text-sm transition-colors hover:text-accent ${isFavorite ? 'text-accent' : 'text-muted'}`}
          aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div className="flex-1">
        <h3 className="mb-1 font-sans text-sm font-semibold text-bright transition-colors group-hover:text-accent">{tool.name}</h3>
        <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[10px] font-mono text-subtle group-hover:text-dim transition-colors">
          /{tool.slug}
        </span>
        <span className="text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">→</span>
      </div>
    </Link>
  )
}