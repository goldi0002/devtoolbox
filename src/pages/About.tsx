import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { tools } from '../tools/registry'
import { WEB_INFO } from '../utils/web-info'
const stack = [
  { name: 'React 18',        desc: 'UI framework with hooks and fast rendering' },
  { name: 'TypeScript',      desc: 'Full type safety across the codebase' },
  { name: 'Vite',            desc: 'Lightning-fast bundler and dev server' },
  { name: 'TailwindCSS',     desc: 'Utility-first CSS with a custom design system' },
  { name: 'React Router v6', desc: 'Client-side routing without page reloads' },
  { name: 'Prettier',        desc: 'Code formatting for HTML tools' },
  { name: 'diff',            desc: 'Text comparison library for the Diff tool' },
  { name: 'uuid',            desc: 'RFC-compliant UUID v4 generation' },
]

const principles = [
  {
    num:   '01',
    label: 'No backend',
    desc:  'Every tool runs entirely in your browser. Your data never touches a server.',
  },
  {
    num:   '02',
    label: 'No personal data',
    desc:  'Anonymous usage analytics only — we track which tools are used, never what you paste into them.',
  },
  {
    num:   '03',
    label: 'No ads',
    desc:  'Clean, distraction-free interface focused entirely on the work.',
  },
  {
    num:   '04',
    label: 'No paywall',
    desc:  'Every tool is free. No account required, no trial, no upsell.',
  },
]
export default function About() {
  usePageTitle('About')
  const pageDescription = `${WEB_INFO.SITE_NAME} is a privacy-first, ad-free set of developer utilities that run entirely in your browser.`
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="About"
        description= {pageDescription}  slug="about"
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-border" />
          <span className="text-[10px] font-mono text-subtle tracking-[0.25em] uppercase">About</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <h1 className="font-display text-[clamp(3rem,10vw,7rem)] text-bright leading-[0.9] mb-8 tracking-tight">
              BUILT FOR<br />
              <span className="text-border" style={{ WebkitTextStroke: '1.5px #d4d4d4' }}>DEVS</span>
              <span className="text-bright">.</span>
            </h1>
            <p className="text-dim font-sans text-base leading-relaxed max-w-lg">
              {WEB_INFO.SITE_NAME} is a minimal, privacy-first collection of browser-based utilities
              for developers. No sign-up. No setup. Open the page and start working.
            </p>
          </div>

          {/* Stats column */}
          <div className="flex lg:flex-col gap-8 lg:gap-6 pb-2">
            {[
              { value: String(tools.length).padStart(2, '0'), label: 'tools' },
              { value: '0', label: 'trackers' },
              { value: '0', label: 'ads' },
            ].map(s => (
              <div key={s.label} className="text-right">
                <div className="font-display text-3xl text-bright leading-none">{s.value}</div>
                <div className="text-[10px] font-mono text-subtle mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">What we believe</p>
            <h2 className="font-display text-2xl text-bright leading-none">PRINCIPLES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {principles.map(p => (
              <div key={p.num}>
                <span className="text-[10px] font-mono text-muted mb-3 block">{p.num}</span>
                <h3 className="text-sm font-sans font-semibold text-bright mb-2">{p.label}</h3>
                <p className="text-xs font-sans text-subtle leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">The story</p>
            <h2 className="font-display text-2xl text-bright leading-none">WHY THIS<br />EXISTS</h2>
          </div>

          <div className="space-y-4 max-w-xl">
            <p className="text-sm font-sans text-dim leading-relaxed">
              Every developer has a dozen tabs open for tools they use daily — JSON formatters,
              JWT decoders, Base64 converters. Most of those sites are cluttered with ads,
              require an account, or quietly send your data to a server.
            </p>
            <p className="text-sm font-sans text-dim leading-relaxed">
              DevToolbox exists to fix that. A single, clean, fast place where every tool
              runs entirely client-side. Paste your JWT, format your JSON, generate your UUID —
              nothing leaves your machine.
            </p>
            <p className="text-sm font-sans text-dim leading-relaxed">
              It started as a personal project. Now it's a growing toolbox built in public,
              with new tools added regularly based on what developers actually need.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tech Stack — dev only ──────────────────────────────────────────── */}
      {import.meta.env.VITE_ENVIRONMENT === 'development' && (
        <section className="border-t border-border pt-16 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
            <div>
              <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">Under the hood</p>
              <h2 className="font-display text-2xl text-bright leading-none">TECH<br />STACK</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stack.map(item => (
                <div key={item.name} className="card hover:border-subtle transition-colors">
                  <div className="text-sm font-mono text-bright mb-1">{item.name}</div>
                  <div className="text-xs font-sans text-dim">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl text-bright mb-1">READY TO BUILD?</h2>
            <p className="text-xs font-mono text-subtle">{tools.length} tools available · no login required</p>
          </div>
          <Link to="/tools" className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap flex-shrink-0">
            Browse All Tools →
          </Link>
        </div>
      </section>

    </main>
  )
}