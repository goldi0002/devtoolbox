import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tools, categoryLabels, type ToolMeta } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'

const categories = ['all', ...Array.from(new Set(tools.map(t => t.category)))] as const

export default function ToolsIndex() {
  usePageTitle('Tools')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

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

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <p className="text-xs font-mono text-subtle tracking-widest uppercase mb-2">/ tools</p>
        <h1 className="font-display text-5xl sm:text-6xl text-bright mb-4">ALL TOOLS</h1>
        <p className="text-dim font-sans text-sm max-w-md">
          {tools.length} tools available. Each one runs entirely in your browser.
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-slide-up stagger-1">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-xs font-mono">⌕</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="input-base pl-7"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-mono rounded border transition-all duration-150
                ${activeCategory === cat
                  ? 'bg-bright text-bg border-bright'
                  : 'text-dim border-border hover:border-subtle hover:text-light'
                }`}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat as ToolMeta['category']]}
            </button>
          ))}
        </div>
      </div>

      {/* Tools grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-dim font-mono text-sm">
          No tools found for "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tool, i) => (
            <ToolGridCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      )}

      <p className="mt-12 text-xs font-mono text-subtle text-center">
        More tools coming soon —
        <span className="ml-1 text-dim">every utility runs client-side, no data leaves your browser.</span>
      </p>
    </main>
  )
}

function ToolGridCard({ tool, index }: { tool: ToolMeta; index: number }) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6']
  const delay = delays[index % delays.length]

  return (
    <Link
      to={`/${tool.slug}`}
      className={`group card flex flex-col gap-3 hover:border-subtle hover:-translate-y-0.5
                  hover:shadow-sm animate-slide-up opacity-0 ${delay}`}
    >
      <div className="flex items-center justify-between">
        <span className="tag">{tool.tag}</span>
        <span className="text-muted group-hover:text-subtle transition-colors duration-200 font-mono text-sm">→</span>
      </div>
      <div>
        <h3 className="text-bright font-sans font-medium text-sm mb-1">{tool.name}</h3>
        <p className="text-dim text-xs leading-relaxed font-sans">{tool.description}</p>
      </div>
      <div className="mt-auto pt-2 border-t border-border">
        <span className="text-xs font-mono text-subtle group-hover:text-dim transition-colors">
          /{tool.slug}
        </span>
      </div>
    </Link>
  )
}
