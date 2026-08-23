import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import ErrorBoundary from '../components/ErrorBoundary'
import { tools, categoryLabels, getFeaturedTools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { Search, ShieldCheck, Zap, Lock, Sparkles, ArrowRight, Clock, Star, LayoutGrid } from 'lucide-react'

// Show first 6 tools as featured
const featuredTools = getFeaturedTools()

// Category counts for the stats strip
const categoryCounts = tools.reduce<Record<string, number>>((acc, t) => {
  acc[t.category] = (acc[t.category] ?? 0) + 1
  return acc
}, {})

const topCategories = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])

const PERKS = [
  { icon: ShieldCheck, label: 'No Ads & No Tracking' },
  { icon: Zap, label: '100% In-Browser Memory' },
  { icon: Lock, label: 'Zero Server Roundtrips' },
  { icon: Sparkles, label: 'Free & Open Source' },
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
      // ignore
    }
  }, [])

  const filteredTools = tools.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const recentToolsList = recentSlugs
    .map(slug => tools.find(t => t.slug === slug))
    .filter((t): t is typeof tools[0] => Boolean(t))
    .slice(0, 4)

  const homeFaqs = [
    {
      question: "What is ToolBox4Devs?",
      answer: `ToolBox4Devs is a suite of ${tools.length}+ fast, private, 100% browser-based developer utilities including JSON formatters, JWT decoders, Base64 encoders, UUID generators, Docker tools, and text utilities.`
    },
    {
      question: "Is my data sent to any server when using ToolBox4Devs?",
      answer: "No. Every single tool runs 100% client-side in your local browser JavaScript engine. No text, tokens, API keys, JSON payloads, or secrets ever leave your device."
    },
    {
      question: "Are all developer tools on ToolBox4Devs free?",
      answer: "Yes, 100% free with no account required, no paywalls, and no advertisements."
    }
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <SEO
        title="ToolBox4Devs — Private Client-Side Developer Tools"
        description={`Access ${tools.length}+ fast, private client-side developer tools running 100% in your browser. Formatters, decoders, encoders, and generators with zero tracking.`}
        keywords={["developer tools", "json formatter", "jwt decoder", "base64 encoder", "uuid generator", "regex tester", "yaml to json", "cron parser", "free developer tools", "offline dev tools", "cidr calculator", "bcrypt generator"]}
        faqs={homeFaqs}
      />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
        {/* Glowing backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          {tools.length} Developer Utilities • 100% Client-Side Execution
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-bright mb-4 font-sans">
          Essential Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Modern Developers</span>
        </h1>

        <p className="max-w-2xl mx-auto text-dim text-base sm:text-lg leading-relaxed mb-8">
          Formatters, encoders, generators, and inspectors running directly in your browser memory.
          Never phones home, never leaks secrets.
        </p>

        {/* Live Hero Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-subtle" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. JSON, Base64, JWT, Hash, Regex)..."
              className="w-full pl-12 pr-20 py-3.5 bg-surface border border-border rounded-xl text-bright placeholder:text-subtle text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-lg transition-all"
            />
            <div className="absolute right-3 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-subtle hover:text-bright px-2 py-1 rounded bg-muted/40"
                >
                  Clear
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono text-subtle bg-muted/50 border border-border/80 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Quick Micro-Utility Dock */}
        <div className="max-w-2xl mx-auto mb-8 p-3 bg-surface/60 backdrop-blur border border-border/80 rounded-xl shadow-xs">
          <div className="text-[11px] font-mono text-subtle mb-2 text-left px-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <Sparkles size={12} />
              Quick Micro-Actions
            </span>
            <span>Instant Client Runtime</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                const uuid = crypto.randomUUID()
                navigator.clipboard.writeText(uuid)
                setCopiedUuid(true)
                setTimeout(() => setCopiedUuid(false), 2000)
              }}
              className="px-3 py-2 text-xs font-mono bg-muted/40 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-border/60 rounded-lg text-bright transition-all text-left flex items-center justify-between group"
            >
              <span>{copiedUuid ? '✓ Copied UUID v4!' : '+ Generate UUID v4'}</span>
              <span className="text-[10px] text-indigo-400 group-hover:opacity-100 transition-opacity">
                {copiedUuid ? 'Copied' : 'Copy'}
              </span>
            </button>

            <Link
              to="/json-formatter"
              className="px-3 py-2 text-xs font-mono bg-muted/40 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-border/60 rounded-lg text-bright transition-all text-left flex items-center justify-between group"
            >
              <span>Format JSON</span>
              <ArrowRight size={12} className="text-subtle group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link
              to="/base-64"
              className="px-3 py-2 text-xs font-mono bg-muted/40 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-border/60 rounded-lg text-bright transition-all text-left flex items-center justify-between group col-span-2 sm:col-span-1"
            >
              <span>Base64 Tool</span>
              <ArrowRight size={12} className="text-subtle group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Perks Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-subtle">
          {PERKS.map(p => {
            const Icon = p.icon
            return (
              <div key={p.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border/60">
                <Icon size={14} className="text-indigo-400" />
                <span>{p.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Category Filter Bar ────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="eyebrow">Browse by Category</h2>
            <span className="text-[10px] font-mono text-subtle">({tools.length} total)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-xs font-mono px-3 py-1.5 rounded-full border border-accent/40 bg-accent-soft text-accent hover:bg-accent hover:text-accent-fg transition-all flex items-center gap-1.5">
              <LayoutGrid size={13} /> Dashboard
            </Link>
            <Link to="/tools" className="text-xs font-mono text-accent hover:underline flex items-center gap-1 transition-colors">
              Full Tool Index <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="relative pb-3 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-accent text-accent-fg shadow-soft font-semibold'
                  : 'bg-surface hover:bg-surface/80 text-dim hover:text-bright border border-border'
              }`}
            >
              All Tools ({tools.length})
            </button>
            {topCategories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-full transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-accent text-accent-fg shadow-soft font-semibold'
                    : 'bg-surface hover:bg-surface/80 text-dim hover:text-bright border border-border'
                }`}
              >
                <span>{categoryLabels[cat as keyof typeof categoryLabels] ?? cat}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tools Bar (if available) */}
        {recentToolsList.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <ErrorBoundary label="Recent tools">
          <div className="mb-8 p-4 bg-surface border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-dim font-medium">
              <Clock size={14} className="text-indigo-400" />
              <span>Recently Used Tools</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentToolsList.map(t => (
                <Link
                  key={t.slug}
                  to={`/${t.slug}`}
                  className="p-2.5 rounded-lg bg-muted/30 border border-border/60 hover:border-indigo-500/50 hover:bg-muted/60 transition-all flex items-center justify-between group"
                >
                  <span className="text-xs font-medium text-bright truncate">{t.name}</span>
                  <ArrowRight size={12} className="text-subtle group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
          </ErrorBoundary>
        )}

        {/* Tool Cards Grid */}
        <ErrorBoundary label="Tool listing">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredTools.map((tool, i) => (
              <ToolCard
                key={tool.slug}
                slug={tool.slug}
                title={tool.name}
                description={tool.description}
                tag={tool.tag}
                index={i}
              />
            ))}
          </div>
        </ErrorBoundary>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 bg-surface border border-border rounded-2xl">
            <p className="text-sm text-dim mb-2">No tools match your filter "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs font-mono text-indigo-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* ── Security & Client-Side Proof ──────────────────────────────────── */}
      <section className="border-t border-border pt-12 pb-12 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-bold text-bright mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs text-dim leading-relaxed">
                Your code, API keys, JSON strings, and secrets never leave your device. All parsing, hashing, and encoding happens entirely inside your browser JS runtime.
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Zap size={22} />
              </div>
              <h3 className="text-base font-bold text-bright mb-2">Zero Latency & Offline Ready</h3>
              <p className="text-xs text-dim leading-relaxed">
                No network latency or server bottlenecks. Every transformation executes synchronously at native WebAssembly and JS V8 speeds.
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface border border-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <Lock size={22} />
              </div>
              <h3 className="text-base font-bold text-bright mb-2">No Ads, Trackers, or Bloat</h3>
              <p className="text-xs text-dim leading-relaxed">
                Zero telemetry, no popups, no cookie banners, and no clutter. Just clean, developer-focused utilities designed for high productivity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
