import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tools, categoryLabels } from '../tools/registry'
import type { ToolMeta } from '../tools/tool-meta'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'
import {
  Star,
  Clock,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Layers,
  Bookmark,
  Terminal,
  Code2,
} from 'lucide-react'

const categories = Array.from(new Set(tools.map(t => t.category)))

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
  const { favorites, recentTools, toggleFavorite } = useToolPreferences()

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

  const stats = [
    { label: 'Total Utilities', value: tools.length, icon: LayoutGrid, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Categories', value: categories.length, icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Starred Favorites', value: favorites.length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Recently Used', value: recentTools.length, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SEO
        title="Dashboard — Developer Command Center"
        description="Your central developer dashboard to manage favorite utilities, view recent activity, and access client-side developer tools."
        slug="dashboard"
        keywords={['dashboard', 'developer command center', 'tools manager']}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <section className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-subtle uppercase tracking-wider">Command Center</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-bright tracking-tight">
            Developer Dashboard
          </h1>
          <p className="text-sm font-sans text-dim mt-1">
            Manage your pinned utilities, track recent workspace activity, and launch developer tools.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/pipeline-studio" className="btn-ghost !text-xs !py-2 !px-3.5 !gap-1.5">
            <Terminal size={14} className="text-accent" />
            Pipelines
          </Link>
          <Link to="/tools" className="btn-primary !text-xs !py-2 !px-4 !gap-1.5">
            <LayoutGrid size={14} />
            Full Tool Directory
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </section>

      {/* ── Stats Overview ────────────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="surface-panel p-4 group hover:border-border/80 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-display text-2xl text-bright leading-none tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-mono text-subtle mt-1.5">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Main Widgets Grid (Favorites & Recents) ───────────────────────── */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-1">
        {/* Favorites Widget */}
        <div className="surface-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-sans font-semibold text-bright">Pinned Favorites</h2>
                  <p className="text-[11px] font-mono text-subtle">Your quick-access starred utilities</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface border border-border text-dim">
                {favoriteTools.length} starred
              </span>
            </div>

            {favoriteTools.length > 0 ? (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {favoriteTools.map(tool => (
                  <div
                    key={tool.slug}
                    className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-surface/40 hover:border-accent/40 hover:bg-surface transition-all duration-150"
                  >
                    <Link to={`/${tool.slug}`} className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                      <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center shrink-0 text-xs font-mono text-accent font-bold">
                        {tool.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-sans font-medium text-bright truncate group-hover:text-accent transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-[11px] font-mono text-subtle truncate">
                          {categoryLabels[tool.category]} · /{tool.slug}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleFavorite(tool.slug)}
                        className="p-1.5 rounded-lg text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all hover:scale-110"
                        title="Remove from favorites"
                        aria-label={`Remove ${tool.name} from favorites`}
                      >
                        ★
                      </button>
                      <Link
                        to={`/${tool.slug}`}
                        className="p-1.5 rounded-lg text-subtle hover:text-bright hover:bg-surface transition-colors"
                        title="Launch tool"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <Bookmark size={20} className="text-amber-400/60" />
                </div>
                <p className="text-sm font-sans font-medium text-dim">No favorites pinned yet</p>
                <p className="text-xs font-mono text-subtle mt-1 mb-4">Click the star icon on any tool card in the directory to pin it here.</p>
                <Link to="/tools" className="btn-secondary !text-xs !py-2 !px-4">
                  Browse Tools
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recently Used Widget */}
        <div className="surface-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Clock size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-sans font-semibold text-bright">Recent Activity</h2>
                  <p className="text-[11px] font-mono text-subtle">Recently launched utilities</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface border border-border text-dim">
                {recentToolCards.length} tools
              </span>
            </div>

            {recentToolCards.length > 0 ? (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                {recentToolCards.map((tool, i) => (
                  <Link
                    key={tool.slug}
                    to={`/${tool.slug}`}
                    className="group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-surface/40 hover:border-emerald-500/40 hover:bg-surface transition-all duration-150"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                      <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono text-subtle font-semibold">{i + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-sans font-medium text-bright truncate group-hover:text-emerald-400 transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-[11px] font-mono text-subtle truncate">
                          {categoryLabels[tool.category]}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-subtle group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Clock size={20} className="text-emerald-400/60" />
                </div>
                <p className="text-sm font-sans font-medium text-dim">No recent activity</p>
                <p className="text-xs font-mono text-subtle mt-1 mb-4">Launch any utility from the tool directory to build your history.</p>
                <Link to="/tools" className="btn-secondary !text-xs !py-2 !px-4">
                  Explore Directory
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick Category Navigation ─────────────────────────────────────── */}
      <section className="surface-panel p-6 mb-10 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Code2 size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-sans font-semibold text-bright">Categories Quick Launch</h2>
              <p className="text-[11px] font-mono text-subtle">Jump directly to specific tool categories</p>
            </div>
          </div>
          <Link to="/tools" className="text-xs font-mono text-accent hover:underline flex items-center gap-1">
            View all {tools.length} tools <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map(cat => {
            const meta = categoryMeta[cat] || { icon: '📦', color: 'text-dim', gradient: 'from-gray-500/20 to-gray-600/5' }
            const count = categoryCounts[cat] ?? 0
            return (
              <Link
                key={cat}
                to={`/tools/${cat}`}
                className="group relative p-4 rounded-xl border border-border bg-surface/50 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="text-lg mb-2">{meta.icon}</div>
                  <div className="text-xs font-sans font-semibold text-bright truncate group-hover:text-accent transition-colors">
                    {categoryLabels[cat as keyof typeof categoryLabels]}
                  </div>
                  <div className="text-[11px] font-mono text-subtle mt-1">{count} utilities</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Footer Info Strip ─────────────────────────────────────────────── */}
      <footer className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-subtle">
        <span>{tools.length} total utilities · {favorites.length} starred favorites</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> 100% Client-Side</span>
          <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-400" /> Zero Latency</span>
        </div>
      </footer>
    </main>
  )
}
