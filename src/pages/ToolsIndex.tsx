import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ToolMeta } from '../tools/tool-meta'
import { tools, categoryLabels } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'
import ToolIcon from '../components/ui/ToolIcon'
import { Search, Star, ArrowRight, Sparkles, LayoutGrid } from 'lucide-react'

const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))] as const

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ToolsIndex() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || searchParams.get('queue') || ''

  // Derive from URL — not from useState so back/forward navigation works
  const activeCategory = category && categories.includes(category as any)
    ? category
    : 'all'

  const [search, setSearch] = useState(urlQuery)
  const { favoriteSet, favorites, recentTools, toggleFavorite } = useToolPreferences()

  // Sync state if URL search query changes (e.g. from OpenSearch or browser history navigation)
  useEffect(() => {
    setSearch(urlQuery)
  }, [urlQuery])

  const categorySeoTitles: Record<string, string> = {
    'all': 'Developer Tools Directory — 57+ Free Online Utilities',
    'json-tools': 'JSON Tools — Free Online JSON Formatters, Validators & Converters',
    'encode-tools': 'Encoder & Decoder Tools — Base64, URL & HTML Entities',
    'text-tools': 'Text Tools & Utilities — Text Diff, Case Converter, Regex & Sorter',
    'generate-tools': 'Online Generators — UUID v4, Passwords, Dockerfiles & Placeholders',
    'auth-tools': 'Authentication Tools — JWT Decoders & Basic Auth Generators',
    'web-tools': 'Web Development Tools — HTTP Status, WCAG Contrast & Formatters',
    'data-tools': 'Data & Conversion Tools — CIDR, SemVer, SQL, CSV & Time',
    'crypto-tools': 'Cryptography & Security Tools — SHA-256, Bcrypt, HMAC & RSA',
    'analyze-tools': 'Code & Text Analysis Tools — Word Counter & Local AI'
  }

  const categoryDescriptions: Record<string, string> = {
    'all': 'Explore 57+ free, browser-based developer utilities. JSON formatters, JWT decoders, UUID generators, cryptography tools, and text helpers. 100% private, zero server calls.',
    'json-tools': 'Free online JSON formatters, validators, schema generators, and minifiers. Beautify raw JSON and fix syntax errors with 100% in-browser privacy.',
    'encode-tools': 'Instant encoder and decoder utilities including Base64, URL encoding, HTML entities, and string escapers. Fast, private, and zero latency.',
    'text-tools': 'Developer text utilities for side-by-side diffing, regex testing, case conversion, line sorting, and markdown editing.',
    'generate-tools': 'Generate random UUID v4s, secure cryptographic passwords, Dockerfiles, SVG placeholders, and mock text directly in your browser.',
    'auth-tools': 'Decode JSON Web Tokens (JWT), inspect claims, check token expiration, and generate HTTP Basic Auth authorization headers securely.',
    'web-tools': 'Essential web developer utilities: WCAG color contrast checker, HTTP status lookup, cURL command converter, and HTML/XML formatters.',
    'data-tools': 'Data manipulation tools: CIDR subnet calculator, SemVer tester, JSON to SQL schema generator, and CSV converters.',
    'crypto-tools': 'Cryptographic hashing tools: SHA-256 hash calculator, Bcrypt generator, HMAC generator, and RSA keypair generator running in browser Web Crypto.',
    'analyze-tools': 'In-browser text and code analysis tools including word counter, character statistics, and private local text analyzer.'
  }

  const pageTitle = activeCategory !== 'all'
    ? (categorySeoTitles[activeCategory] || `${categoryLabels[activeCategory as ToolMeta['category']]} Tools`)
    : search
      ? `Search results for "${search}"`
      : 'Developer Tools Directory'

  usePageTitle(activeCategory !== 'all' ? `${categoryLabels[activeCategory as ToolMeta['category']]} Tools` : 'All Tools')

  const handleSearchChange = (newQuery: string) => {
    setSearch(newQuery)
    const newParams = new URLSearchParams(searchParams)
    if (newQuery.trim()) {
      newParams.set('q', newQuery)
      newParams.delete('query')
      newParams.delete('search')
      newParams.delete('queue')
    } else {
      newParams.delete('q')
      newParams.delete('query')
      newParams.delete('search')
      newParams.delete('queue')
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleCategoryChange = (cat: string) => {
    const targetPath = cat === 'all' ? '/tools' : `/tools/${cat}`
    const qStr = search ? `?q=${encodeURIComponent(search)}` : ''
    navigate(`${targetPath}${qStr}`, { replace: true })
  }

  const clearSearch = () => {
    handleSearchChange('')
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

  const categoryKeywords = useMemo(() => {
    if (activeCategory === 'all') {
      return ['developer tools directory', 'online utilities', 'developer toolbox', 'browser developer tools', 'all developer utilities']
    }
    const catTools = tools.filter(t => t.category === activeCategory)
    return [
      `${categoryLabels[activeCategory as ToolMeta['category']]} tools`,
      ...catTools.map(t => t.name.toLowerCase()),
      ...catTools.flatMap(t => t.keywords).slice(0, 10)
    ]
  }, [activeCategory])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <SEO
        title={pageTitle}
        description={categoryDescriptions[activeCategory] || `Explore free, client-side ${categoryLabels[activeCategory as ToolMeta['category']]} utilities. Run entirely in your browser memory with zero tracking.`}
        slug={activeCategory === 'all' ? 'tools' : `tools/${activeCategory}`}
        keywords={categoryKeywords}
        category={activeCategory !== 'all' ? activeCategory : undefined}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="relative mb-12 pt-4 pb-8 text-center sm:text-left animate-fade-in">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium mb-5 shadow-xs">
              <Sparkles size={13} className="animate-pulse" />
              <span>{tools.length} Browser Utilities • Zero Server Calls</span>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.9] tracking-tight">
              <span className="text-bright">ALL</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
                TOOLS
              </span>
            </h1>

            <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-dim">
              Search {tools.length} browser-based utilities, filter by category, and star the ones you
              reach for daily.
            </p>
          </div>

          <div className="flex items-end gap-8 pb-1">
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none tabular-nums font-bold">
                {String(tools.length).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1 uppercase tracking-wider">total tools</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none tabular-nums font-bold">
                {String(categories.length - 1).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1 uppercase tracking-wider">categories</div>
            </div>
          </div>
        </div>
      </section>

      {activeCategory === 'all' && !search && (favoriteTools.length > 0 || recentToolCards.length > 0) && (
        <section className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-2 animate-slide-up stagger-1" aria-label="Personal tool shortcuts">
          {[{ title: 'Favorites', items: favoriteTools, empty: 'Star tools to pin them here.' }, { title: 'Recently used', items: recentToolCards, empty: 'Open a tool to build your recent list.' }].map(group => (
            <div key={group.title} className="p-5 rounded-2xl bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border/80 shadow-lg">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="eyebrow text-indigo-400 font-bold">{group.title}</h2>
                <span className="text-[10px] font-mono text-muted px-2 py-0.5 rounded bg-muted/40">Local</span>
              </div>
              {group.items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.items.slice(0, 6).map(tool => (
                    <Link key={tool.slug} to={`/${tool.slug}`} className="px-3.5 py-1.5 rounded-xl border border-border/80 bg-surface/90 hover:bg-indigo-500/10 hover:border-indigo-500/50 text-xs font-mono text-bright transition-all shadow-xs">
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
      <div className="sticky top-20 z-30 mb-10 border border-border/80 rounded-2xl bg-surface/85 dark:bg-slate-900/85 px-5 py-4 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="w-full pl-10 pr-10 py-2.5 bg-surface/90 dark:bg-slate-900/90 border border-border/80 rounded-xl text-sm text-bright placeholder:text-subtle focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
            />
            {search && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-bright font-mono text-xs transition-colors p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto flex-nowrap no-scrollbar max-w-full py-2">
            {categories.map(cat => {
              const count = cat === 'all' ? tools.length : tools.filter(t => t.category === cat).length
              const label = cat === 'all' ? 'All' : categoryLabels[cat as ToolMeta['category']]
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  aria-pressed={activeCategory === cat && !search}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 whitespace-nowrap shrink-0 inline-flex items-center gap-2 border ${
                    activeCategory === cat && !search
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/20'
                      : 'bg-surface/80 hover:bg-surface text-dim hover:text-bright border-border/80'
                  }`}
                >
                  <span className="leading-none">{label}</span>
                  <span className="text-[10px] opacity-80 px-1.5 py-0.5 rounded-full bg-black/20 inline-flex items-center justify-center leading-none">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Result count */}
          {!showingAll && (
            <span className="text-xs font-mono text-indigo-400 font-semibold sm:ml-auto whitespace-nowrap px-3 py-1 rounded-full bg-indigo-500/10">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Tools grid ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface/60 backdrop-blur-xl py-24 text-center shadow-xl">
          <p className="text-sm font-mono text-dim mb-2">No tools found</p>
          <p className="text-xs font-mono text-subtle mb-6">No results for "{search}"</p>
          <button
            onClick={() => { clearSearch(); handleCategoryChange('all') }}
            className="text-xs font-mono text-indigo-400 hover:underline font-semibold"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {activeCategory === 'all' && !search ? (
            // Grouped by category
            <div className="space-y-14">
              {(categories.filter(c => c !== 'all') as string[]).map(cat => {
                const catTools = tools.filter(t => t.category === cat)
                if (!catTools.length) return null
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="eyebrow text-indigo-400 font-bold tracking-widest uppercase">
                        {categoryLabels[cat as ToolMeta['category']]}
                      </span>
                      <div className="h-px flex-1 bg-border/80" />
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-muted/60 text-subtle font-semibold">{catTools.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((tool, i) => (
                <ToolGridCard key={tool.slug} tool={tool} index={i} isFavorite={favoriteSet.has(tool.slug)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <p className="mt-20 pt-8 border-t border-border/80 text-xs font-mono text-subtle flex items-center justify-between flex-wrap gap-2">
        <span>More tools coming soon</span>
        <span className="text-indigo-400 font-semibold">100% client-side memory, zero data leaves your browser.</span>
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
        className={`card flex flex-col gap-3 opacity-50 cursor-not-allowed animate-slide-up rounded-2xl p-5 bg-surface/40 border-border/60 ${delay}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <ToolIcon slug={tool.slug} category={tool.category} name={tool.icon} withBadge={false} size={16} />
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-muted/60 text-subtle">{tool.tag}</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle shrink-0">soon</span>
        </div>
        <div className="flex-1">
          <h3 className="text-bright font-sans font-bold text-sm mb-1">{tool.name}</h3>
          <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
        </div>

        <div className="pt-3 border-t border-border/60">
          <span className="text-[11px] font-mono text-subtle">
            /{tool.slug}
          </span>
        </div>
      </div>
    )
  }
  return (
    <Link
      to={`/${tool.slug}`}
      className={`group relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-border/80
                  bg-surface/70 dark:bg-slate-900/65 backdrop-blur-xl p-5 transition-all duration-300
                  hover:-translate-y-1.5 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10
                  animate-slide-up opacity-0 ${delay}`}
    >
      {/* Top gradient glow bar */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 group-hover:scale-110 transition-transform">
            <ToolIcon slug={tool.slug} category={tool.category} name={tool.icon} withBadge={false} size={15} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-muted/60 text-indigo-400 border border-border/60 truncate">
            {tool.tag}
          </span>
        </div>
        <button
          type="button"
          onClick={event => { event.preventDefault(); onToggleFavorite(tool.slug) }}
          className={`p-1.5 rounded-lg transition-all ${isFavorite ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 'text-subtle/50 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-muted'}`}
          aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Unpin tool' : 'Pin tool'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>
      <div className="flex-1">
        <h3 className="mb-1.5 font-sans text-sm font-bold text-bright transition-colors group-hover:text-indigo-400">{tool.name}</h3>
        <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-auto">
        <span className="text-[11px] font-mono text-muted group-hover:text-subtle transition-colors">
          /{tool.slug}
        </span>
        <span className="text-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-400">→</span>
      </div>
    </Link>
  )
}