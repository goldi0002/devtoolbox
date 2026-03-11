import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { tools, categoryLabels, type ToolMeta } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'

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
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">
            toolbox4devs.com
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(3rem,10vw,6rem)] text-bright leading-[0.9] tracking-tight">
            ALL<br />
            <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>
              TOOLS
            </span>
          </h1>

          <div className="flex items-end gap-8 pb-1">
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none">
                {String(tools.length).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1">total tools</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-bright leading-none">
                {String(categories.length - 1).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-subtle mt-1">categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search + Filter ────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-8 mb-10 animate-slide-up stagger-1">
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
              className="input-base pl-7 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-dim
                           font-mono text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs font-mono rounded border transition-all duration-150
                  ${activeCategory === cat && !search
                    ? 'bg-bright text-bg border-bright'
                    : 'text-dim border-border hover:border-subtle hover:text-light'
                  }`}
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
        <div className="border border-border rounded py-24 text-center">
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
                      <span className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase">
                        {categoryLabels[cat as ToolMeta['category']]}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] font-mono text-muted">{catTools.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {catTools.map((tool, i) => (
                        <ToolGridCard key={tool.slug} tool={tool} index={i} />
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
                <ToolGridCard key={tool.slug} tool={tool} index={i} />
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

function ToolGridCard({ tool, index }: { tool: ToolMeta; index: number }) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6']
  const delay = delays[index % delays.length]
  if (tool.commingSoon) {
    return (
      <div
        className={`card flex flex-col gap-3 opacity-50 cursor-not-allowed animate-slide-up ${delay}`}
      >
        <div className="flex items-center justify-between">
          <span className="tag">{tool.tag}</span>
          <span className="text-muted font-mono text-sm">→</span>
        </div>
        <div className="flex-1">
          <h3 className="text-bright font-sans font-medium text-sm mb-1">{tool.name}</h3>
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
      className={`group card flex flex-col gap-3 hover:border-subtle hover:-translate-y-0.5
                  hover:shadow-sm animate-slide-up opacity-0 ${delay}`}
    >
      <div className="flex items-center justify-between">
        <span className="tag">{tool.tag}</span>
        <span className="text-muted group-hover:text-subtle transition-colors font-mono text-sm">→</span>
      </div>
      <div className="flex-1">
        <h3 className="text-bright font-sans font-medium text-sm mb-1">{tool.name}</h3>
        <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
      </div>

      <div className="pt-2 border-t border-border">
        <span className="text-[10px] font-mono text-subtle group-hover:text-dim transition-colors">
          /{tool.slug}
        </span>
      </div>
    </Link>
  )
}