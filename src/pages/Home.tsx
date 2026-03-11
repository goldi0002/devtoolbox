import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import { tools, categoryLabels } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'

// Show first 6 tools as featured
const featuredTools = tools.slice(0, 6)

// Category counts for the stats strip
const categoryCounts = tools.reduce<Record<string, number>>((acc, t) => {
  acc[t.category] = (acc[t.category] ?? 0) + 1
  return acc
}, {})

const topCategories = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 4)

// Perks row
const PERKS = [
  { icon: '⬡', label: 'No ads' },
  { icon: '⬡', label: 'No personal data' },
  { icon: '⬡', label: '100% browser' },
  { icon: '⬡', label: 'Always free' },
]

export default function Home() {
  usePageTitle('Home')

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6">
      <SEO
        title="Developer Utility Toolbox"
        description="A curated set of everyday utilities for developers. No ads. No personal data. Everything runs in your browser."
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden">

        {/* Background grid decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top label */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">
            toolbox4devs.com
          </span>
        </div>

        {/* Main headline — two-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end mb-10">
          <h1 className="font-display text-[clamp(3.5rem,12vw,8.5rem)] text-bright leading-[0.9] animate-slide-up tracking-tight">
            TOOL<br />
            <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>
              BOX
            </span>
            <span className="text-bright">4DEVS</span>
          </h1>

          {/* Right — vertical descriptor */}
          <div className="hidden lg:flex flex-col justify-end pb-2 gap-6 animate-fade-in stagger-2">
            <div className="w-px h-24 bg-border self-center" />
            <div className="flex flex-col gap-1">
              {PERKS.map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="text-muted text-[10px]">{p.icon}</span>
                  <span className="text-xs font-mono text-subtle">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-row: description + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 animate-slide-up stagger-2">
          <p className="text-dim font-sans text-base leading-relaxed max-w-sm">
            A curated set of everyday utilities for developers.
            Fast, clean, and completely client-side.
          </p>

          <div className="flex items-center gap-4 sm:ml-auto flex-shrink-0">
            <Link
              to="/tools"
              className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap"
            >
              Browse All Tools →
            </Link>
            <span className="text-xs font-mono text-subtle whitespace-nowrap">
              {tools.length} tools
            </span>
          </div>
        </div>

        {/* Mobile perks row */}
        <div className="flex gap-4 mt-8 flex-wrap lg:hidden animate-fade-in stagger-3">
          {PERKS.map(p => (
            <span key={p.label} className="text-xs font-mono text-subtle flex items-center gap-1.5">
              <span className="text-muted">·</span>{p.label}
            </span>
          ))}
        </div>
      </section>
      
      {/* ── Category strip ────────────────────────────────────────────────── */}
      <div className="border-t border-b border-border py-4 mb-16 animate-fade-in stagger-3">
        <div className="flex flex-wrap gap-x-8 gap-y-2 justify-between">
          {topCategories.map(([cat, count]) => (
            <Link
              key={cat}
              to={`/tools/${cat}`}
              className="flex items-center gap-2 group"
            >
              <span className="text-[10px] font-mono text-muted tabular-nums">{String(count).padStart(2, '0')}</span>
              <span className="text-xs font-mono text-subtle group-hover:text-dim transition-colors">
                {categoryLabels[cat as keyof typeof categoryLabels] ?? cat}
              </span>
            </Link>
          ))}
          <Link
            to="/tools"
            className="text-xs font-mono text-muted hover:text-subtle transition-colors ml-auto"
          >
            all categories →
          </Link>
        </div>
      </div>

      {/* ── Featured Tools ────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">
              Featured
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none">
              POPULAR TOOLS
            </h2>
          </div>
          <Link
            to="/tools"
            className="text-xs font-mono text-subtle hover:text-dim transition-colors hidden sm:block"
          >
            View all {tools.length} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.map((tool, i) => (
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

        <div className="mt-4 sm:hidden">
          <Link
            to="/tools"
            className="text-xs font-mono text-subtle hover:text-dim transition-colors"
          >
            View all {tools.length} tools →
          </Link>
        </div>
      </section>

      {/* ── Why DevToolbox ────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">
              Why
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none">
              BUILT FOR<br />DEVS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Privacy first',
                body: 'Every tool runs entirely in your browser. Your data never leaves your machine.',
              },
              {
                num: '02',
                title: 'No friction',
                body: 'No login. No sign-up. No paywall. Open the tool, use it, close it.',
              },
              {
                num: '03',
                title: 'Always growing',
                body: `${tools.length} tools today. New ones added regularly based on what developers actually need.`,
              },
            ].map(item => (
              <div key={item.num} className="group">
                <span className="text-[10px] font-mono text-muted mb-3 block">{item.num}</span>
                <h3 className="text-sm font-sans font-semibold text-bright mb-2">{item.title}</h3>
                <p className="text-xs font-sans text-subtle leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer row ────────────────────────────────────────────────────── */}
      <div className="border-t border-border py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs font-mono text-subtle">
          toolbox4devs.com — built with care for developers who value clean tools.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/tools" className="text-xs font-mono text-subtle hover:text-dim transition-colors">
            All Tools
          </Link>
          <Link to="/about" className="text-xs font-mono text-subtle hover:text-dim transition-colors">
            About
          </Link>
        </div>
      </div>
    </main>
  )
}