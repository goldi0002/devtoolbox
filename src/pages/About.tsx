import { usePageTitle } from "../hooks/usePageTitle"
import { useSEO } from "../hooks/useSEO"
const stack = [
  { name: 'React 18', desc: 'UI framework with hooks and fast rendering' },
  { name: 'TypeScript', desc: 'Full type safety across the codebase' },
  { name: 'Vite', desc: 'Lightning-fast bundler and dev server' },
  { name: 'TailwindCSS', desc: 'Utility-first CSS with a custom design system' },
  { name: 'React Router v6', desc: 'Client-side routing without page reloads' },
  { name: 'diff', desc: 'Text comparison library for the Diff tool' },
  { name: 'uuid', desc: 'RFC-compliant UUID v4 generation' },
]

const principles = [
  { label: 'No backend', desc: 'Everything runs locally in your browser. Nothing leaves your machine.' },
  { label: 'No tracking', desc: 'Zero analytics, no cookies, no data collection of any kind.' },
  { label: 'No ads', desc: 'Clean, distraction-free interface focused entirely on utility.' },
]

export default function About() {
  const seo = useSEO({
    title:       'About',
    description: 'DevToolbox is a privacy-first, ad-free set of developer utilities that run entirely in your browser.',
    slug:        'about',
  });
  usePageTitle('About')
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
      {seo}
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-mono text-subtle tracking-widest uppercase mb-2">/ about</p>
        <h1 className="font-display text-4xl sm:text-5xl text-bright mb-6">DEVTOOLBOX</h1>
        <p className="text-dim font-sans leading-relaxed text-base">
          A minimal, privacy-first collection of browser-based utilities for developers.
          No sign-up. No setup. Open the page and start working.
        </p>
      </div>

      {/* Principles */}
      <section className="mb-12">
        <h2 className="text-xs font-mono text-subtle tracking-widest uppercase mb-4">Principles</h2>
        <div className="space-y-3">
          {principles.map(p => (
            <div key={p.label} className="flex gap-4 py-3 border-b border-border last:border-0">
              <span className="font-mono text-sm text-bright min-w-[100px] flex-shrink-0">{p.label}</span>
              <span className="font-sans text-sm text-dim leading-relaxed">{p.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="mb-12">
        <h2 className="text-xs font-mono text-subtle tracking-widest uppercase mb-4">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stack.map(item => (
            <div key={item.name} className="card hover:border-subtle transition-colors">
              <div className="text-sm font-mono text-bright mb-1">{item.name}</div>
              <div className="text-xs font-sans text-dim">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t border-border">
        <p className="text-xs font-mono text-subtle">
          Built with care for developers who value clean tools.
        </p>
      </div>
    </main>
  )
}