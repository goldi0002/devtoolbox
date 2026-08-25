import { Suspense, lazy, useEffect, useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { tools } from '../tools/registry'
import ErrorBoundary from '../components/ErrorBoundary'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO, FAQItem, HowToStep } from '../hooks/useSEO'
import { useToolPreferences } from '../hooks/useToolPreferences'
import { ShieldCheck, Zap, Lock, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react'

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

  const steps = useMemo<HowToStep[]>(() => {
    if (!meta) return []
    return [
      {
        name: 'Input your data',
        text: `Paste or type your input directly into the ${meta.name} workspace.`
      },
      {
        name: 'Configure parameters & options',
        text: 'Adjust formatting, encoding mode, schema settings, or options in real time.'
      },
      {
        name: 'Inspect live result',
        text: 'Review the instant, zero-latency computation generated entirely in browser memory.'
      },
      {
        name: 'Copy or export output',
        text: 'Use the one-click copy button to copy the transformed output to your clipboard.'
      }
    ]
  }, [meta])

  const faqs = useMemo<FAQItem[]>(() => {
    if (!meta) return []
    const items: FAQItem[] = [
      {
        question: `What is ${meta.name}?`,
        answer: meta.about?.summary || meta.description,
      },
      {
        question: `Is ${meta.name} private and safe for sensitive data?`,
        answer: `Yes. Like all tools on ToolBox4Devs, ${meta.name} runs 100% client-side inside your browser JavaScript runtime. No input data, API keys, JSON payloads, passwords, or secrets are ever sent to any server or external API.`,
      },
      {
        question: `How does ${meta.name} work?`,
        answer: `All computations and transformations execute synchronously within your local browser environment using standard Web APIs, Web Crypto, and JavaScript. You can verify this by checking the DevTools Network tab while using the tool.`,
      },
      {
        question: `Is ${meta.name} free to use?`,
        answer: `Yes, ${meta.name} is 100% free with no registration, no daily usage limits, and no advertising.`,
      },
      {
        question: `Can I use ${meta.name} offline?`,
        answer: `Yes. ToolBox4Devs is an installable Progressive Web App (PWA). Once cached in your browser, all utilities run completely offline without an internet connection.`,
      }
    ]

    if (meta.about?.useCases && meta.about.useCases.length > 0) {
      items.push({
        question: `What are common use cases for ${meta.name}?`,
        answer: `Popular scenarios include: ${meta.about.useCases.join('. ')}.`,
      })
    }

    if (meta.about?.features && meta.about.features.length > 0) {
      items.push({
        question: `What features are included in ${meta.name}?`,
        answer: `Key capabilities include: ${meta.about.features.join(', ')}.`,
      })
    }

    return items
  }, [meta])

  if (!meta) return <Navigate to="/tools" replace />
  if (meta.status === 'coming-soon') {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <SEO
          title={meta.seo?.title || `${meta.name} — Free Online Client-Side Tool`}
          description={meta.seo?.description || meta.description}
          slug={meta.slug}
          category={meta.category}
          keywords={[...meta.keywords, ...(meta.seo?.extraKeywords || [])]}
          faqs={faqs}
          features={meta.about?.features || []}
          steps={steps}
          toolName={meta.name}
        />
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
      <SEO
        title={meta.seo?.title || `${meta.name} — Free Online Client-Side Tool`}
        description={meta.seo?.description || meta.description}
        slug={meta.slug}
        category={meta.category}
        keywords={[...meta.keywords, ...(meta.seo?.extraKeywords || [])]}
        faqs={faqs}
        features={meta.about?.features || []}
        steps={steps}
        toolName={meta.name}
      />

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-8 text-xs font-mono animate-fade-in">
        <Link to="/" className="text-subtle hover:text-accent transition-colors">home</Link>
        <span className="text-muted">/</span>
        <Link to="/tools" className="text-subtle hover:text-accent transition-colors">tools</Link>
        <span className="text-muted">/</span>
        <Link to={`/tools/${meta.category}`} className="text-subtle hover:text-accent transition-colors">
          {meta.category.replace('-tools', '')}
        </Link>
        <span className="text-muted">/</span>
        <span className="text-dim font-medium">{slug}</span>
      </nav>

      {/* ── Workspace Header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 surface-panel px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="tag">{meta.tag}</span>
          <div>
            <h1 className="text-base sm:text-lg font-sans font-semibold text-bright">{meta.name}</h1>
            <p className="text-xs text-dim">100% In-Browser Execution · Zero External Calls · Private & Secure</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite(meta.slug)}
            className={`chip ${favoriteSet.has(meta.slug) ? 'chip-active' : ''}`}
            aria-pressed={favoriteSet.has(meta.slug)}
          >
            {favoriteSet.has(meta.slug) ? '★ Favorited' : '☆ Add favorite'}
          </button>
        </div>
      </div>

      {/* ── Tool Interactive Workspace ──────────────────────────────────── */}
      <div className="animate-slide-up">
        <ErrorBoundary key={slug} label={meta.name}>
          <Suspense fallback={<ToolFallback />}>
            <ToolComponent />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* ── How to Use Guide (Optimized for HowTo Schema & SERP Guide) ───── */}
      <section aria-labelledby="guide-heading" className="mt-14 pt-10 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <div>
            <p className="eyebrow mb-1">Quick Guide</p>
            <h2 id="guide-heading" className="font-display text-2xl text-bright leading-none mb-3">
              HOW TO USE<br />{meta.name.toUpperCase()}
            </h2>
            <p className="text-xs text-subtle font-mono">
              Simple 4-step workflow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-surface/50 border border-border flex gap-3.5">
                <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-xs font-semibold font-sans text-bright mb-1">{step.name}</h3>
                  <p className="text-xs font-sans text-dim leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About this tool & Specifications ────────────────────────────── */}
      {meta.about && (
        <section aria-labelledby="about-heading" className="mt-14 pt-10 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">

            {/* ── Left label ─────────────────────────────────────────────── */}
            <div>
              <p className="eyebrow mb-1">Specification</p>
              <h2 id="about-heading" className="font-display text-2xl text-bright leading-none mb-4">
                WHAT IS<br />{meta.name.toUpperCase()}?
              </h2>

              {/* Security Badges */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-mono text-dim">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>100% Client-Side</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-dim">
                  <Zap size={14} className="text-amber-400 shrink-0" />
                  <span>Zero Latency</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-dim">
                  <Lock size={14} className="text-indigo-400 shrink-0" />
                  <span>Zero Data Logs</span>
                </div>
              </div>
            </div>

            {/* ── Right content ───────────────────────────────────────────── */}
            <div className="space-y-8">

              {/* Summary */}
              <p className="text-sm font-sans text-dim leading-relaxed max-w-2xl">
                {meta.about.summary}
              </p>

              {/* Use cases + Features */}
              {(meta.about.useCases?.length || meta.about.features?.length) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                  {meta.about.useCases?.length > 0 && (
                    <div>
                      <h3 className="eyebrow mb-3">When to use it</h3>
                      <ul className="space-y-2">
                        {meta.about.useCases.map((u, i) => (
                          <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                            <span className="text-accent font-mono mt-0.5 flex-shrink-0">→</span>
                            <span>{u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meta.about.features?.length > 0 && (
                    <div>
                      <h3 className="eyebrow mb-3">Key Features</h3>
                      <ul className="space-y-2">
                        {meta.about.features.map((f, i) => (
                          <li key={i} className="flex gap-2 text-xs font-sans text-dim">
                            <span className="text-muted font-mono mt-0.5 flex-shrink-0">·</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

              {/* Notes */}
              {meta.about?.notes && meta.about.notes?.length > 0 && (
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden bg-surface/30">
                  <div className="px-4 py-2.5">
                    <span className="eyebrow">Technical Notes</span>
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
                  <span className="eyebrow mr-2">Developer Tip</span>
                  <span className="text-xs font-sans text-dim">{meta.about.tip}</span>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── Privacy & Security Comparison Box ───────────────────────────── */}
      <section className="mt-14 pt-10 border-t border-border">
        <div className="rounded-xl border border-border bg-surface/40 p-6 sm:p-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-accent" />
              <p className="eyebrow">Privacy & Security Guarantee</p>
            </div>
            <h2 className="font-display text-2xl text-bright leading-tight mb-3">
              WHY IN-BROWSER PROCESSING MATTERS FOR DEVELOPERS
            </h2>
            <p className="text-xs sm:text-sm font-sans text-dim leading-relaxed mb-4">
              Many online formatters and decoders send your code, JSON payloads, auth tokens, and database schemas to backend servers where they can be cached, logged, or intercepted. ToolBox4Devs guarantees that all processing for <strong>{meta.name}</strong> runs entirely in your browser's JavaScript V8 engine.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-subtle">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Server Roundtrips</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Telemetry Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>PWA Offline Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ & Answer Engine Optimization (AEO) Section ──────────────── */}
      <section aria-labelledby="faq-heading" className="mt-14 pt-10 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={14} className="text-accent" />
              <p className="eyebrow">Frequently Asked</p>
            </div>
            <h2 id="faq-heading" className="font-display text-2xl text-bright leading-none">
              QUESTIONS &<br />ANSWERS
            </h2>
            <p className="text-xs text-subtle mt-3 font-mono">
              Indexed for search engines and AI assistants
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border border-border bg-surface/40 p-4 transition-all duration-200 open:bg-surface/80"
              >
                <summary className="flex cursor-pointer items-center justify-between font-sans text-sm font-medium text-bright list-none">
                  <span>{faq.question}</span>
                  <span className="ml-2 font-mono text-xs text-subtle transition-transform duration-200 group-open:rotate-90">
                    →
                  </span>
                </summary>
                <p className="mt-3 text-xs font-sans text-dim leading-relaxed border-t border-border/60 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Related Tools ─────────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-5">
            <p className="eyebrow">Other Developer Utilities</p>
            <Link
              to="/tools"
              className="text-[10px] font-mono text-muted hover:text-subtle transition-colors flex items-center gap-1"
            >
              View all {tools.length} <ArrowRight size={11} />
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

