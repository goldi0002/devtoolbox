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

const HERO_STATS = [
  { value: String(tools.length), label: 'tools' },
  { value: '0', label: 'network calls' },
  { value: '∞', label: 'free usage' },
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
      <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 -z-10 h-72 w-72 accent-glow opacity-40 animate-accent-pulse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-bright) 1px, transparent 1px), linear-gradient(90deg, var(--color-bright) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at top left, #000 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top left, #000 20%, transparent 75%)',
          }}
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent-soft px-3 py-1 text-[11px] font-mono text-accent animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {tools.length} tools · runs 100% in your browser
        </span>

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <div>
            <h1 className="font-display text-[clamp(3rem,10vw,7rem)] text-bright leading-[0.9] tracking-tight animate-slide-up">
              TOOL<span className="text-accent">BOX</span><br />
              4DEVS
            </h1>

            <p className="mt-6 max-w-xl font-sans text-base sm:text-lg leading-relaxed text-dim animate-slide-up stagger-2">
              A curated set of everyday developer utilities — formatters, encoders, generators and
              inspectors. Fast, distraction-free, and completely client-side.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-slide-up stagger-3">
              <Link to="/tools" className="btn-primary px-6 py-2.5">
                Browse all tools →
              </Link>
              <Link to="/json-formatter" className="btn-ghost px-6 py-2.5">
                Try JSON formatter
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 animate-fade-in stagger-4">
              {PERKS.map(p => (
                <span key={p.label} className="flex items-center gap-2 text-xs font-mono text-subtle">
                  <span className="text-accent">{p.icon}</span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6 animate-fade-in stagger-3">
            <p className="eyebrow mb-4">By the numbers</p>
            <dl className="grid grid-cols-3 gap-4 mb-6">
              {HERO_STATS.map(stat => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl text-bright leading-none tabular-nums">{stat.value}</dd>
                  <p className="mt-1 text-[10px] font-mono text-subtle uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </dl>
            <p className="eyebrow mb-3">Jump to a category</p>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([cat, count]) => (
                <Link key={cat} to={`/tools/${cat}`} className="chip">
                  {categoryLabels[cat as keyof typeof categoryLabels] ?? cat}
                  <span className="text-[10px] text-muted tabular-nums">{count}</span>
                </Link>
              ))}
              <Link to="/tools" className="chip">all →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Tools ────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-14 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-1">Featured</p>
            <h2 className="section-heading">POPULAR TOOLS</h2>
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
            <p className="eyebrow mb-1">What's new</p>
            <h2 className="section-heading mb-4">
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
            <p className="eyebrow mb-1">Prove it</p>
            <h2 className="section-heading mb-4">
              DON'T<br />TRUST US
            </h2>
            <p className="text-xs font-mono text-subtle leading-relaxed max-w-[180px]">
              We say we don't track you. Here's how to verify that claim yourself in under 60 seconds.
            </p>
          </div>

          <div>
            <div className="rounded-lg border border-border overflow-hidden bg-surface/40">
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
            <p className="eyebrow mb-1">Why</p>
            <h2 className="section-heading">
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
              <div key={item.num} className="rounded-lg border border-border bg-surface/40 p-5 transition-colors hover:border-accent">
                <span className="mb-3 block font-mono text-[10px] text-accent">{item.num}</span>
                <h3 className="mb-2 font-sans text-sm font-semibold text-bright">{item.title}</h3>
                <p className="font-sans text-xs leading-relaxed text-dim">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Suggest a tool CTA ────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-1">Community</p>
            <h2 className="section-heading">
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
              className="btn-ghost px-5 py-2.5 font-mono text-xs whitespace-nowrap flex-shrink-0"
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

    </main>
  )
}