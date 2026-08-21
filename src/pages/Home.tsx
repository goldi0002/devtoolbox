import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import { tools, categoryLabels } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { Search, ShieldCheck, Zap, Lock, Sparkles, ArrowRight, Clock } from 'lucide-react'


const categoryCounts = tools.reduce<Record<string, number>>((acc, t) => {
  acc[t.category] = (acc[t.category] ?? 0) + 1
  return acc
}, {})

const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

const PERKS = [
  { icon: ShieldCheck, label: 'No ads or tracking' },
  { icon: Zap, label: 'Runs in your browser' },
  { icon: Lock, label: 'No server roundtrips' },
]

export default function Home() {
  usePageTitle('Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [recentSlugs, setRecentSlugs] = useState<string[]>([])
  const [copiedUuid, setCopiedUuid] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('devutils_recent_tools')
      if (stored) {
        setRecentSlugs(JSON.parse(stored))
      }
    } catch {
      // ignore malformed or unavailable localStorage data
    }
  }, [])

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredTools = useMemo(() => tools.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchesSearch = !normalizedSearch ||
      t.name.toLowerCase().includes(normalizedSearch) ||
      t.description.toLowerCase().includes(normalizedSearch) ||
      t.slug.toLowerCase().includes(normalizedSearch) ||
      t.keywords?.some(keyword => keyword.toLowerCase().includes(normalizedSearch))
    return matchesCategory && matchesSearch
  }), [normalizedSearch, selectedCategory])

  const recentToolsList = recentSlugs
    .map(slug => tools.find(t => t.slug === slug))
    .filter((t): t is typeof tools[0] => Boolean(t))
    .slice(0, 4)

  const visibleTools = normalizedSearch || selectedCategory !== 'all' ? filteredTools : tools

  const homeFaqs = [
    {
      question: 'What is ToolBox4Devs?',
      answer: 'ToolBox4Devs is a suite of 51+ fast, private, 100% browser-based developer utilities including JSON formatters, JWT decoders, Base64 encoders, UUID generators, and text tools.'
    },
    {
      question: 'Is my data sent to any server when using ToolBox4Devs?',
      answer: 'No. Every single tool runs 100% client-side in your local browser JavaScript engine. No text, tokens, API keys, JSON payloads, or secrets ever leave your device.'
    },
    {
      question: 'Are all developer tools on ToolBox4Devs free?',
      answer: 'Yes, 100% free with no account required, no paywalls, and no advertisements.'
    }
  ]

  return (
    <main className="bg-bg">
      <SEO
        title="ToolBox4Devs — Fast, Private, 100% Client-Side Developer Tools"
        description="51+ fast, private developer utilities running 100% in your browser. Formatters, decoders, encoders, UUID generators, JWT inspectors, and text utilities. Zero ads, zero tracking."
        keywords={["developer tools", "json formatter", "jwt decoder", "base64 encoder", "uuid generator", "regex tester", "yaml to json", "cron parser", "free developer tools", "offline dev tools"]}
        faqs={homeFaqs}
      />

      <section className="border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-dim shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {tools.length} developer utilities · 100% client-side
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-bright sm:text-6xl">
              Fast, private developer tools for everyday work.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-dim sm:text-lg">
              Format, encode, decode, inspect, and generate data directly in your browser. No accounts,
              no ads, no tracking, and no server uploads.
            </p>
          </div>

          <div className="mt-8 max-w-3xl animate-slide-up stagger-2">
            <label htmlFor="home-tool-search" className="sr-only">Search developer tools</label>
            <div className="group relative flex items-center rounded-2xl border border-border bg-surface/80 shadow-soft transition-all duration-200 focus-within:border-accent focus-within:bg-bg focus-within:shadow-lift">
              <Search className="absolute left-4 text-subtle transition-colors group-focus-within:text-accent" size={20} />
              <input
                id="home-tool-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search JSON, Base64, JWT, UUID, cron..."
                className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-24 text-sm text-bright placeholder:text-subtle focus:outline-none sm:text-base"
                autoComplete="off"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <span className="hidden rounded-full bg-muted/30 px-2 py-1 text-[10px] font-mono text-subtle sm:inline-flex">
                  {filteredTools.length} results
                </span>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="rounded-full px-2.5 py-1 text-xs font-mono text-dim transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    Clear
                  </button>
                ) : (
                  <kbd className="hidden rounded border border-border px-2 py-1 text-[10px] font-mono text-subtle sm:inline-block">⌘K</kbd>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-dim animate-slide-up stagger-3">
            {PERKS.map(p => {
              const Icon = p.icon
              return (
                <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                  <Icon size={14} className="text-accent" />
                  {p.label}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <section className="grid gap-3 rounded-2xl border border-border bg-surface/60 p-3 shadow-soft sm:grid-cols-3">
          <button
            onClick={() => {
              const uuid = crypto.randomUUID()
              navigator.clipboard.writeText(uuid)
              setCopiedUuid(true)
              setTimeout(() => setCopiedUuid(false), 2000)
            }}
            className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 text-left text-sm font-medium text-bright transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
          >
            <span>{copiedUuid ? 'Copied UUID v4' : 'Generate UUID v4'}</span>
            <Sparkles size={16} className="text-accent" />
          </button>
          <Link to="/json-formatter" className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 text-sm font-medium text-bright transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft">
            Format JSON <ArrowRight size={16} className="text-accent" />
          </Link>
          <Link to="/base-64" className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 text-sm font-medium text-bright transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft">
            Base64 Tool <ArrowRight size={16} className="text-accent" />
          </Link>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Browse by category</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-bright">All tools</h2>
            </div>
            <Link to="/tools" className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-bright">
              Full Tool Index <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-mono font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-accent text-accent-fg shadow-soft'
                  : 'border border-border bg-surface text-dim hover:border-accent hover:text-bright'
              }`}
            >
              All ({tools.length})
            </button>
            {topCategories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-mono font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-accent text-accent-fg shadow-soft'
                    : 'border border-border bg-surface text-dim hover:border-accent hover:text-bright'
                }`}
              >
                {categoryLabels[cat as keyof typeof categoryLabels] ?? cat} ({count})
              </button>
            ))}
          </div>

          {recentToolsList.length > 0 && !normalizedSearch && selectedCategory === 'all' && (
            <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-mono font-medium text-dim">
                <Clock size={14} className="text-accent" />
                Recently used tools
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                {recentToolsList.map(t => (
                  <Link key={t.slug} to={`/${t.slug}`} className="flex items-center justify-between rounded-xl border border-border bg-bg px-3 py-2.5 text-xs font-medium text-bright transition-all hover:border-accent hover:shadow-soft">
                    <span className="truncate">{t.name}</span>
                    <ArrowRight size={12} className="ml-2 shrink-0 text-accent" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTools.map((tool, i) => (
              <ToolCard key={tool.slug} slug={tool.slug} title={tool.name} description={tool.description} tag={tool.tag} index={i} />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="mb-3 text-sm text-dim">No tools match your filter “{searchQuery}”.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                className="text-sm font-medium text-accent hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        <section className="mt-12 border-t border-border pt-10">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: '100% client-side privacy',
                body: 'Your code, API keys, JSON strings, and secrets never leave your device. Parsing, hashing, and encoding happens in your browser.'
              },
              {
                icon: Zap,
                title: 'Fast and offline ready',
                body: 'No network latency or server bottlenecks. Tools execute locally and stay useful for focused developer workflows.'
              },
              {
                icon: Lock,
                title: 'No ads, trackers, or bloat',
                body: 'No telemetry, popups, cookie banners, or clutter. Just clean developer utilities for high-productivity work.'
              }
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-border bg-surface/60 p-5 shadow-soft">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-bright">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-dim">{item.body}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
