import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import { tools, categoryLabels, getFeaturedTools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { getRecentChangelog } from '../utils/changelog'

// Show first 6 tools as featured
const featuredTools = getFeaturedTools()

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
  { icon: '⬡', label: 'No tracking' },
  { icon: '⬡', label: '100% browser' },
  { icon: '⬡', label: 'Always free' },
]

// Network proof steps shown in the DevTools challenge section
const DEVTOOLS_STEPS = [
  {
    key: 'F12',
    action: 'Open DevTools',
    detail: 'Press F12 or right-click → Inspect',
  },
  {
    key: '→',
    action: 'Go to Network tab',
    detail: 'Filter by "Fetch/XHR" or "All"',
  },
  {
    key: '→',
    action: 'Use any tool',
    detail: 'Paste a JWT, format some JSON, anything',
  },
  {
    key: '→',
    action: 'Watch the silence',
    detail: 'Zero outbound requests. Nothing phoning home.',
  },
]

export default function Home() {
  usePageTitle('Home')

  const recentChanges = getRecentChangelog(3)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6">
      <SEO
        title="Developer Utility Toolbox"
        description="A curated set of everyday utilities for developers. No ads. No tracking. Everything runs in your browser."
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">
            toolbox4devs.com
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end mb-10">
          <h1 className="font-display text-[clamp(3.5rem,12vw,8.5rem)] text-bright leading-[0.9] animate-slide-up tracking-tight">
            TOOL<br />
            <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>BOX</span>
            <span className="text-bright">4DEVS</span>
          </h1>

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

        <div className="flex flex-col sm:flex-row sm:items-end gap-6 animate-slide-up stagger-2">
          <p className="text-dim font-sans text-base leading-relaxed max-w-sm">
            A curated set of everyday utilities for developers.
            Fast, clean, and completely client-side.
          </p>
          <div className="flex items-center gap-4 sm:ml-auto flex-shrink-0">
            <Link to="/tools" className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap">
              Browse All Tools →
            </Link>
            <span className="text-xs font-mono text-subtle whitespace-nowrap">
              {tools.length} tools
            </span>
          </div>
        </div>

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
            <Link key={cat} to={`/tools/${cat}`} className="flex items-center gap-2 group">
              <span className="text-[10px] font-mono text-muted tabular-nums">{String(count).padStart(2, '0')}</span>
              <span className="text-xs font-mono text-subtle group-hover:text-dim transition-colors">
                {categoryLabels[cat as keyof typeof categoryLabels] ?? cat}
              </span>
            </Link>
          ))}
          <Link to="/tools" className="text-xs font-mono text-muted hover:text-subtle transition-colors ml-auto">
            all categories →
          </Link>
        </div>
      </div>

      {/* ── Featured Tools ────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Featured</p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none">POPULAR TOOLS</h2>
          </div>
          <Link to="/tools" className="text-xs font-mono text-subtle hover:text-dim transition-colors hidden sm:block">
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
          <Link to="/tools" className="text-xs font-mono text-subtle hover:text-dim transition-colors">
            View all {tools.length} tools →
          </Link>
        </div>
      </section>

      {/* ── Changelog preview ─────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">What's new</p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none mb-4">
              CHANGE<br />LOG
            </h2>
            <p className="text-xs font-mono text-subtle leading-relaxed max-w-[180px]">
              This project ships regularly. Here's what landed recently.
            </p>
            <Link
              to="/changelog"
              className="inline-block mt-6 text-xs font-mono text-subtle hover:text-dim transition-colors"
            >
              Full changelog →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentChanges.map(entry => (
              <div key={entry.title + entry.date} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {/* Date */}
                <div className="flex-shrink-0 w-24 pt-0.5">
                  <span className="text-[10px] font-mono text-muted tabular-nums">{entry.date}</span>
                </div>
                {/* Badge + content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-mono border px-1.5 py-0.5 uppercase tracking-wider ${entry.style}`}>
                      {entry.type}
                    </span>
                    <span className="text-xs font-mono text-bright">{entry.title}</span>
                  </div>
                  <p className="text-[11px] font-sans text-subtle leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── No Tracking — Verify it yourself ─────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Prove it</p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none mb-4">
              DON'T<br />TRUST US
            </h2>
            <p className="text-xs font-mono text-subtle leading-relaxed max-w-[180px]">
              We say we don't track you. Here's how to verify that claim yourself in under 60 seconds.
            </p>
          </div>

          <div>
            <div className="border border-border">
              <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <span className="text-[10px] font-mono text-muted ml-2 tracking-wider">
                  DevTools → Network tab
                </span>
              </div>

              <div className="p-5 space-y-0 divide-y divide-border">
                {DEVTOOLS_STEPS.map((step, i) => (
                  <div key={step.action} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex-shrink-0 w-6 h-6 border border-border flex items-center justify-center mt-0.5">
                      <span className="text-[9px] font-mono text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-bright mb-0.5">{step.action}</div>
                      <div className="text-[11px] font-sans text-subtle">{step.detail}</div>
                    </div>
                    {step.key !== '→' && (
                      <kbd className="flex-shrink-0 px-2 py-0.5 border border-border text-[10px] font-mono text-muted self-start mt-0.5">
                        {step.key}
                      </kbd>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-4 bg-[rgba(255,255,255,0.015)]">
                <div className="text-[10px] font-mono text-muted mb-2 tracking-wider uppercase">Expected output</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-5 border border-border relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] font-mono text-muted italic">— no external requests —</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-subtle flex-shrink-0">0 / 0 requests</span>
                </div>
                <p className="text-[10px] font-mono text-muted mt-2.5 leading-relaxed">
                  All requests you see will be to <span className="text-subtle">toolbox4devs.com</span> — your own files.
                  No analytics endpoints. No third-party scripts. No beacon calls.
                </p>
              </div>
            </div>

            <p className="text-[10px] font-mono text-muted mt-3">
              Still skeptical? Open DevTools on any tool page and inspect the source yourself.
              No minified third-party bundles. No hidden scripts.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why ToolBox4Devs ──────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Why</p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none">
              BUILT FOR<br />DEVS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Privacy first',
                body: 'Every tool runs entirely in your browser. Your data never leaves your machine — paste your secrets safely.',
              },
              {
                num: '02',
                title: 'No friction',
                body: "No login. No sign-up. No paywall. Open the tool, use it, close it. That's the whole flow.",
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

      {/* ── Suggest a tool CTA ────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Community</p>
            <h2 className="font-display text-3xl sm:text-4xl text-bright leading-none">
              MISSING<br />A TOOL?
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <p className="text-sm font-sans text-dim leading-relaxed max-w-sm">
              Got a tool you reach for daily that's not here yet? Send a message —
              this toolbox is built around what developers actually use.
            </p>
            <a
              href="mailto:suggest@toolbox4devs.com?subject=Tool%20suggestion%20for%20ToolBox4Devs"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-subtle text-xs font-mono text-dim hover:text-bright transition-colors whitespace-nowrap flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Send a suggestion →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer row ────────────────────────────────────────────────────── */}
      <div className="border-t border-border py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs font-mono text-subtle">
          toolbox4devs.com — built with care for developers who value clean tools.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/tools" className="text-xs font-mono text-subtle hover:text-dim transition-colors">All Tools</Link>
          <Link to="/changelog" className="text-xs font-mono text-subtle hover:text-dim transition-colors">Changelog</Link>
          <Link to="/privacy" className="text-xs font-mono text-subtle hover:text-dim transition-colors">Privacy</Link>
          <Link to="/about" className="text-xs font-mono text-subtle hover:text-dim transition-colors">About</Link>
        </div>
      </div>
    </main>
  )
}