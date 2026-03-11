import { Suspense, lazy } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { tools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'

const ToolFallback = lazy(() => import('../components/ui/tools/ToolFallback'))
const ToolComingSoon = lazy(() => import('../components/ui/tools/ToolComingSoon'))

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ToolPage() {
  const { pathname } = useLocation();
  // const { slug = '' } = useParams()
  const slug = pathname.split('/').pop() ?? ''
  const meta = tools.find(t => t.slug === slug)
  usePageTitle(meta?.name)
  if (!meta) return <Navigate to="/tools" replace />
  if (meta.commingSoon) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <SEO title={meta.name} description={meta.description} slug={meta.slug} />
        <ToolComingSoon toolName={meta.name} eta={meta.eta ?? 'TBA'} description={meta.description} features={meta.about?.features ?? []} />
      </main>
    )
  }

  const ToolComponent = meta.toolComponent
  if (!ToolComponent) return <Navigate to="/tools" replace />
  
  // Same-category tools first, then fill with others — max 6
  const others = [
    ...tools.filter(t => t.slug !== slug && t.category === meta.category),
    ...tools.filter(t => t.slug !== slug && t.category !== meta.category),
  ].slice(0, 6)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <SEO title={meta.name} description={meta.description} slug={meta.slug} />

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono animate-fade-in">
        <Link to="/" className="text-subtle hover:text-dim transition-colors">home</Link>
        <span className="text-muted">/</span>
        <Link to="/tools" className="text-subtle hover:text-dim transition-colors">tools</Link>
        <span className="text-muted">/</span>
        <span className="text-dim">{slug}</span>
      </nav>

      {/* ── Tool ─────────────────────────────────────────────────────────── */}
      <div className="animate-slide-up">
        <Suspense fallback={<ToolFallback />}>
          <ToolComponent />
        </Suspense>
      </div>

      {/* ── About this tool ──────────────────────────────────────────────── */}
      {meta.about && (
        <section className="mt-16 pt-10 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">
            <div>
              <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-1">About</p>
              <h2 className="font-display text-2xl text-bright leading-none">
                WHAT IS<br />{meta.name.toUpperCase()}?
              </h2>
            </div>

            <div className="space-y-8">
              <p className="text-sm font-sans text-dim leading-relaxed max-w-xl">
                {meta.about.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-3">When to use it</p>
                  <ul className="space-y-2">
                    {meta.about.useCases.map((u, i) => (
                      <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                        <span className="text-muted font-mono mt-0.5 flex-shrink-0">→</span>
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-3">Features</p>
                  <ul className="space-y-2">
                    {meta.about.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                        <span className="text-muted font-mono mt-0.5 flex-shrink-0">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {meta.about.tip && (
                <div className="border border-border rounded px-4 py-3 bg-surface">
                  <span className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mr-2">Tip</span>
                  <span className="text-xs font-sans text-dim">{meta.about.tip}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Other Tools ──────────────────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase">
              Other Tools
            </p>
            <Link
              to="/tools"
              className="text-[10px] font-mono text-muted hover:text-subtle transition-colors"
            >
              View all {tools.length} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {others.map(tool => (
              <Link
                key={tool.slug}
                to={`/${tool.slug}`}
                className="card flex flex-col gap-1.5 hover:border-subtle hover:-translate-y-0.5 group p-4"
              >
                <span className="tag self-start">{tool.tag}</span>
                <span className="text-bright text-xs font-sans font-medium mt-1 group-hover:text-black transition-colors leading-tight">
                  {tool.name}
                </span>
                <span className="text-[10px] font-mono text-muted group-hover:text-subtle transition-colors">
                  /{tool.slug}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}