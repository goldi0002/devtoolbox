import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { tools } from '../tools/registry'
import { WEB_DEVELOPER_INFO, WEB_PRINCIPLES } from '../utils/webinfo'

const stack = [
  { name: 'React 18', desc: 'UI framework with hooks and fast rendering' },
  { name: 'TypeScript', desc: 'Full type safety across the codebase' },
  { name: 'Vite', desc: 'Lightning-fast bundler and dev server' },
  { name: 'TailwindCSS', desc: 'Utility-first CSS with a custom design system' },
  { name: 'React Router v6', desc: 'Client-side routing without page reloads' },
  { name: 'Prettier', desc: 'Code formatting for HTML tools' },
  { name: 'diff', desc: 'Text comparison library for the Diff tool' },
  { name: 'uuid', desc: 'RFC-compliant UUID v4 generation' },
]

export default function About() {
  usePageTitle('About')
  const pageDescription = `ToolBox4Devs is a privacy-first, ad-free set of developer utilities that run entirely in your browser.`

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="About"
        description={pageDescription}
        slug="about"
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
              <span className="text-bright font-semibold">ToolBox4Devs</span> is a minimal, privacy-first collection of browser-based utilities
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
            {WEB_PRINCIPLES.map(p => (
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
              ToolBox4Devs exists to fix that. A single, clean, fast place where every tool
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

      {/* ── Developer ──────────────────────────────────────────────────────── */}
      <section className="border-t border-border pt-16 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <div>
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">The human behind it</p>
            <h2 className="font-display text-2xl text-bright leading-none">BUILT BY<br />A DEV</h2>
          </div>

          <div className="max-w-xl">
            {/* Name & role */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-display text-xl text-bright">{WEB_DEVELOPER_INFO.NAME}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <p className="text-[10px] font-mono text-subtle tracking-wide">{WEB_DEVELOPER_INFO.ROLE}</p>
            </div>

            {/* Bio */}
            <p className="text-sm font-sans text-dim leading-relaxed mb-8">
              {WEB_DEVELOPER_INFO.BIO}
            </p>

            {/* Contact links */}
            <div className="flex flex-wrap gap-3">
              <a
                href={WEB_DEVELOPER_INFO.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-subtle text-xs font-mono text-dim hover:text-bright transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>

              <a style={{ pointerEvents: 'none', opacity: 0.5 }}
                href={WEB_DEVELOPER_INFO.EMAIL}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-subtle text-xs font-mono text-dim hover:text-bright transition-colors" aria-disabled="true"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Say hello
              </a>

              <a
                href={WEB_DEVELOPER_INFO.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-subtle text-xs font-mono text-dim hover:text-bright transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter / X
              </a>
            </div>
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