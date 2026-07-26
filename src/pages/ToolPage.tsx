import { Suspense, lazy, useEffect, useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { tools } from '../tools/registry'
import ErrorBoundary from '../components/ErrorBoundary'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'

const ToolFallback = lazy(() => import('../components/ui/tools/ToolFallback'))
const ToolComingSoon = lazy(() => import('../components/ui/tools/ToolComingSoon'))

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ToolPage() {
  const { pathname } = useLocation()
  const slug = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.at(-1) ?? ''
  }, [pathname])
  const meta = tools.find(t => t.slug === slug)
  const { favoriteSet, recordRecentTool, toggleFavorite } = useToolPreferences()
  usePageTitle(meta?.name)

  useEffect(() => {
    if (meta && meta.status !== 'coming-soon') recordRecentTool(meta.slug)
  }, [meta, recordRecentTool])
  if (!meta) return <Navigate to="/tools" replace />
  if (meta.status === 'coming-soon') {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <SEO title={meta.name} description={meta.description} slug={meta.slug} category={meta.category} keywords={meta.keywords || []} />
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SEO title={meta.name} description={meta.description} slug={meta.slug} category={meta.category} keywords={meta.keywords || []} />

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono animate-fade-in">
        <Link to="/" className="text-subtle hover:text-accent transition-colors">home</Link>
        <span className="text-muted">/</span>
        <Link to="/tools" className="text-subtle hover:text-accent transition-colors">tools</Link>
        <span className="text-muted">/</span>
        <span className="text-dim">{slug}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 surface-panel px-4 py-3 animate-fade-in">
        <div>
          <p className="eyebrow">Workspace</p>
          <p className="text-xs text-dim">Local-only utility · no account required</p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(meta.slug)}
          className={`chip ${favoriteSet.has(meta.slug) ? 'chip-active' : ''}`}
          aria-pressed={favoriteSet.has(meta.slug)}
        >
          {favoriteSet.has(meta.slug) ? '★ Favorited' : '☆ Add favorite'}
        </button>
      </div>

      {/* ── Tool ─────────────────────────────────────────────────────────── */}
      <div className="animate-slide-up">
        <ErrorBoundary key={slug} label={meta.name}>
          <Suspense fallback={<ToolFallback />}>
            <ToolComponent />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* ── About this tool ──────────────────────────────────────────────── */}
      {meta.about && (
        <section className="mt-16 pt-10 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">

            {/* ── Left label ─────────────────────────────────────────────── */}
            <div>
              <p className="eyebrow mb-1">About</p>
              <h2 className="font-display text-2xl text-bright leading-none">
                WHAT IS<br />{meta.name.toUpperCase()}?
              </h2>
            </div>

            {/* ── Right content ───────────────────────────────────────────── */}
            <div className="space-y-8">

              {/* Summary */}
              <p className="text-sm font-sans text-dim leading-relaxed max-w-xl">
                {meta.about.summary}
              </p>

              {/* Use cases + Features — only render cols that exist */}
              {(meta.about.useCases?.length || meta.about.features?.length) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                  {meta.about.useCases?.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">When to use it</p>
                      <ul className="space-y-2">
                        {meta.about.useCases.map((u, i) => (
                          <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                            <span className="text-accent font-mono mt-0.5 flex-shrink-0">→</span>
                            {u}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meta.about.features?.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Features</p>
                      <ul className="space-y-2">
                        {meta.about.features.map((f, i) => (
                          <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                            <span className="text-muted font-mono mt-0.5 flex-shrink-0">·</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

              {/* Notes */}
              {meta.about?.notes && meta.about.notes?.length > 0 && (
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  <div className="px-4 py-2.5">
                    <span className="eyebrow">Notes</span>
                  </div>
                  {meta.about.notes.map((note, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3">
                      <span className="text-[10px] font-mono text-muted flex-shrink-0 mt-px tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xs font-sans text-subtle leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tip */}
              {meta.about.tip && (
                <div className="rounded-lg border border-border bg-accent-soft px-4 py-3">
                  <span className="eyebrow mr-2">Tip</span>
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
            <p className="eyebrow">Other Tools</p>
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
                className="card group flex flex-col gap-1.5 p-4 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
              >
                <span className="tag self-start">{tool.tag}</span>
                <span className="text-bright text-xs font-sans font-medium mt-1 group-hover:text-accent transition-colors leading-tight">
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
