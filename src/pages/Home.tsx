import { Link } from 'react-router-dom'
import ToolCard from '../components/ToolCard'
import { tools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'

const previewTools = tools.slice(0, 5)

export default function Home() {
  usePageTitle("Home")
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <SEO title="Developer Utility Toolbox" description="A curated set of everyday utilities for developers. No ads. No tracking. Everything runs in your browser." />
      <section className="mb-20">
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <div className="h-px flex-1 bg-border max-w-[40px]" />
          <span className="text-xs font-mono text-subtle tracking-widest uppercase">Developer Utility Hub</span>
        </div>
        <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl text-bright leading-none mb-6 animate-slide-up">
          DEVELOPER<br />
          <span className="text-subtle">UTILITY</span><br />
          TOOLBOX
        </h1>
        <div className="max-w-lg mt-8 animate-slide-up stagger-2">
          <p className="text-dim font-sans text-base leading-relaxed mb-8">
            A curated set of everyday utilities for developers.
            No ads. No tracking. Everything runs in your browser.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/tools" className="btn-primary text-sm px-6 py-2.5">Browse All Tools →</Link>
            <span className="text-xs font-mono text-subtle">{tools.length} tools · more coming</span>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4 mb-10 animate-fade-in stagger-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-mono text-subtle tracking-widest uppercase">Featured Tools</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewTools.map((tool, i) => (
          <ToolCard key={tool.slug} slug={tool.slug} title={tool.name} description={tool.description} tag={tool.tag} index={i} />
        ))}
        <Link
          to="/tools"
          className="card flex flex-col items-center justify-center text-center min-h-[120px] gap-2
                     hover:border-subtle hover:-translate-y-0.5 animate-slide-up stagger-6 opacity-0 group"
        >
          <span className="text-xl text-muted group-hover:text-subtle transition-colors">⊞</span>
          <span className="text-xs font-mono text-subtle group-hover:text-dim transition-colors">View all {tools.length} tools →</span>
        </Link>
      </section>

      <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs font-mono text-subtle">Built with care for developers who value clean tools.</p>
        <Link to="/about" className="text-xs font-mono text-subtle hover:text-dim transition-colors">About this project →</Link>
      </div>
    </main>
  )
}
