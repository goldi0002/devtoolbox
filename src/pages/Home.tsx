import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import ToolIcon from '../components/ui/ToolIcon'
import ErrorBoundary from '../components/ErrorBoundary'
import { tools, categoryLabels } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { Search, ShieldCheck, Zap, Lock, Sparkles, ArrowRight, Clock, LayoutGrid, Workflow, Copy, Check, Hash, Terminal, Cpu } from 'lucide-react'

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
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedBase64, setCopiedBase64] = useState(false)

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="ToolBox4Devs — Private Client-Side Developer Tools"
        description={`Access ${tools.length}+ fast, private client-side developer tools running 100% in your browser. Formatters, decoders, encoders, and generators with zero tracking.`}
        keywords={["developer tools", "json formatter", "jwt decoder", "base64 encoder", "uuid generator", "regex tester", "yaml to json", "cron parser", "free developer tools", "offline dev tools", "cidr calculator", "bcrypt generator"]}
        faqs={homeFaqs}
      />

      {/* ── Modern Glassmorphic Hero Section ───────────────────────────────── */}
      <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-20 text-center">
        {/* Refined subtle gradient backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md text-indigo-400 text-xs font-mono font-medium mb-8 shadow-sm">
          <Cpu size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
          <span>{tools.length} High-Performance Utilities • 100% Local V8 Memory</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-bright mb-6 font-sans leading-[1.1]">
          The Private Toolkit for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
            Modern Engineers
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-dim text-base sm:text-lg leading-relaxed mb-10">
          Lightning-fast formatters, encoders, cryptographic generators, and inspectors running directly in your browser memory. Zero tracking, zero server calls.
        </p>

        {/* Live Command Palette & Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-8">
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all">
            <Search className="absolute left-4 text-indigo-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools instantly (e.g. JSON, Base64, JWT, Hash, Regex)..."
              className="w-full pl-12 pr-28 py-4 bg-transparent text-bright placeholder:text-subtle text-sm font-medium focus:outline-none"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-subtle hover:text-bright px-3 py-1 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  Clear
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-xl">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Quick Utilities Dock */}
        <div className="max-w-3xl mx-auto mb-12 p-5 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-xl">
          <div className="text-xs font-mono text-subtle mb-3.5 text-left px-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles size={14} className="animate-bounce" />
              Instant Client Quick Dock
            </span>
            <span className="text-[11px] text-muted">Click to execute instantly in browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quick UUID v4 */}
            <button
              onClick={() => {
                const uuid = crypto.randomUUID()
                navigator.clipboard.writeText(uuid)
                setCopiedUuid(true)
                setTimeout(() => setCopiedUuid(false), 2000)
              }}
              className="p-3.5 text-xs font-mono bg-surface/90 dark:bg-slate-800/80 hover:bg-indigo-600/15 hover:border-indigo-500/60 border border-border/80 rounded-xl text-bright transition-all text-left flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Terminal size={15} />
                </div>
                <div className="truncate">
                  <div className="font-bold truncate text-bright">Generate UUID v4</div>
                  <div className="text-[10px] text-subtle truncate">{copiedUuid ? 'Copied to clipboard!' : 'Copy random v4'}</div>
                </div>
              </div>
              {copiedUuid ? <Check size={15} className="text-emerald-400 shrink-0" /> : <Copy size={15} className="text-subtle group-hover:text-indigo-400 transition-colors shrink-0" />}
            </button>

            {/* Quick SHA-256 Hash */}
            <button
              onClick={async () => {
                const text = "dev-toolbox-sample-" + Date.now()
                const msgBuffer = new TextEncoder().encode(text)
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
                const hashArray = Array.from(new Uint8Array(hashBuffer))
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
                navigator.clipboard.writeText(hashHex)
                setCopiedHash(true)
                setTimeout(() => setCopiedHash(false), 2000)
              }}
              className="p-3.5 text-xs font-mono bg-surface/90 dark:bg-slate-800/80 hover:bg-purple-600/15 hover:border-purple-500/60 border border-border/80 rounded-xl text-bright transition-all text-left flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <Hash size={15} />
                </div>
                <div className="truncate">
                  <div className="font-bold truncate text-bright">Generate SHA-256</div>
                  <div className="text-[10px] text-subtle truncate">{copiedHash ? 'Hash copied!' : 'Copy sample hash'}</div>
                </div>
              </div>
              {copiedHash ? <Check size={15} className="text-emerald-400 shrink-0" /> : <Copy size={15} className="text-subtle group-hover:text-purple-400 transition-colors shrink-0" />}
            </button>

            {/* Quick Base64 Encode */}
            <button
              onClick={() => {
                const sample = "ToolBox4Devs-" + new Date().toISOString()
                const encoded = btoa(sample)
                navigator.clipboard.writeText(encoded)
                setCopiedBase64(true)
                setTimeout(() => setCopiedBase64(false), 2000)
              }}
              className="p-3.5 text-xs font-mono bg-surface/90 dark:bg-slate-800/80 hover:bg-pink-600/15 hover:border-pink-500/60 border border-border/80 rounded-xl text-bright transition-all text-left flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30 group-hover:scale-110 transition-transform">
                  <Sparkles size={15} />
                </div>
                <div className="truncate">
                  <div className="font-bold truncate text-bright">Sample Base64</div>
                  <div className="text-[10px] text-subtle truncate">{copiedBase64 ? 'Base64 copied!' : 'Encode & copy'}</div>
                </div>
              </div>
              {copiedBase64 ? <Check size={15} className="text-emerald-400 shrink-0" /> : <Copy size={15} className="text-subtle group-hover:text-pink-400 transition-colors shrink-0" />}
            </button>
          </div>
        </div>

        {/* Perks Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-dim">
          {PERKS.map(p => {
            const Icon = p.icon
            return (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/80 shadow-xs">
                <Icon size={15} className="text-indigo-400" />
                <span className="font-medium">{p.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── DevFlow Pipeline Studio Spotlight Banner ───────────────────────── */}
      <section className="mb-14 p-6 sm:p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-surface/90 to-purple-950/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold tracking-wider">
              <Workflow size={15} />
              <span>THE KILLER DIFFERENTIATOR</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">100% In-Browser Memory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-bright tracking-tight">
              DevFlow Pipeline Studio — Chain Developer Tools Together
            </h2>
            <p className="text-xs sm:text-sm text-dim leading-relaxed font-sans">
              Tired of copying and pasting across multiple browser tabs? Connect Base64 decoding, JSON formatting, JWT inspection, regex filtering, and SHA-256 hashing into a seamless zero-latency workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/recipes"
              className="px-5 py-3 text-xs font-mono font-semibold rounded-2xl border border-border bg-surface hover:bg-muted text-bright transition-all shadow-sm"
            >
              Explore Recipes
            </Link>
            <Link
              to="/pipeline-studio"
              className="flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Sparkles size={14} />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ────────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="eyebrow text-indigo-400 font-bold">Browse by Category</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">({tools.length} total)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-xs font-mono px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-1.5 font-semibold shadow-xs">
              <LayoutGrid size={14} /> Dashboard
            </Link>
            <Link to="/tools" className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1 font-semibold transition-colors">
              Full Tool Index <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="relative pb-4 border-b border-border/80">
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 flex-nowrap no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 text-xs font-mono font-bold rounded-2xl transition-all duration-300 whitespace-nowrap shrink-0 inline-flex items-center gap-2 shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 scale-105'
                  : 'bg-surface/80 hover:bg-surface text-dim hover:text-bright border border-border/80'
              }`}
            >
              <span className="leading-none">All Tools</span>
              <span className="text-[10px] opacity-80 px-2 py-0.5 rounded-full bg-black/20 inline-flex items-center justify-center leading-none">({tools.length})</span>
            </button>
            {topCategories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 text-xs font-mono font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap shrink-0 inline-flex items-center gap-2 shadow-xs ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 scale-105'
                    : 'bg-surface/80 hover:bg-surface text-dim hover:text-bright border border-border/80'
                }`}
              >
                <span className="leading-none">{categoryLabels[cat as keyof typeof categoryLabels] ?? cat}</span>
                <span className="text-[10px] opacity-80 px-2 py-0.5 rounded-full bg-black/20 inline-flex items-center justify-center leading-none">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tools Bar (if available) */}
        {recentToolsList.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <ErrorBoundary label="Recent tools">
          <div className="mb-10 mt-8 p-5 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border/80 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-3.5 text-xs font-mono text-dim font-bold">
              <Clock size={15} className="text-indigo-400" />
              <span>Recently Used Tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {recentToolsList.map(t => (
                <Link
                  key={t.slug}
                  to={`/${t.slug}`}
                  className="p-3.5 rounded-xl bg-surface/90 dark:bg-slate-800/80 border border-border/80 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all flex items-center justify-between group gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ToolIcon slug={t.slug} category={t.category} name={t.icon} size={16} className="text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-bright truncate">{t.name}</span>
                  </div>
                  <ArrowRight size={13} className="text-subtle group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
          </ErrorBoundary>
        )}

        {/* Tool Cards Grid */}
        <ErrorBoundary label="Tool listing">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredTools.map((tool, i) => (
              <ToolCard
                key={tool.slug}
                slug={tool.slug}
                title={tool.name}
                description={tool.description}
                tag={tool.tag}
                category={tool.category}
                icon={tool.icon}
                index={i}
              />
            ))}
          </div>
        </ErrorBoundary>

        {filteredTools.length === 0 && (
          <div className="text-center py-20 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border rounded-3xl shadow-xl mt-8">
            <p className="text-sm font-sans font-medium text-dim mb-2">No tools match your filter "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-xs font-mono text-indigo-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* ── Security & Client-Side Proof ──────────────────────────────────── */}
      <section className="border-t border-border/80 pt-14 pb-12 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-7 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border/80 rounded-2xl flex flex-col justify-between shadow-lg hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/30">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-bright mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs text-dim leading-relaxed font-sans">
                Your code, API keys, JSON strings, and secrets never leave your device. All parsing, hashing, and encoding happens entirely inside your browser JS runtime.
              </p>
            </div>
          </div>

          <div className="p-7 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border/80 rounded-2xl flex flex-col justify-between shadow-lg hover:border-purple-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/30">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-bright mb-2">Zero Latency & Offline Ready</h3>
              <p className="text-xs text-dim leading-relaxed font-sans">
                No network latency or server bottlenecks. Every transformation executes synchronously at native WebAssembly and JS V8 speeds.
              </p>
            </div>
          </div>

          <div className="p-7 bg-surface/70 dark:bg-slate-900/60 backdrop-blur-xl border border-border/80 rounded-2xl flex flex-col justify-between shadow-lg hover:border-pink-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-5 border border-pink-500/30">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-bright mb-2">No Ads, Trackers, or Bloat</h3>
              <p className="text-xs text-dim leading-relaxed font-sans">
                Zero telemetry, no popups, no cookie banners, and no clutter. Just clean, developer-focused utilities designed for high productivity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
