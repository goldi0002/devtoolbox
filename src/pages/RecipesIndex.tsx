import { Link } from 'react-router-dom'
import { DEV_RECIPES } from '../data/recipes'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { Sparkles, ArrowRight, ShieldCheck, Zap, Workflow, Layers, Terminal } from 'lucide-react'

export default function RecipesIndex() {
  usePageTitle('Developer Workflow Recipes')

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <SEO
        title="Developer Workflow Recipes & Pipelines — ToolBox4Devs"
        description="Curated multi-tool recipes to debug webhooks, inspect JWT auth tokens, clean server logs, and unpack base64 JSON client-side in browser memory."
        slug="recipes"
        keywords={[
          'developer workflow recipes',
          'webhook payload inspector',
          'jwt auth token verifier',
          'base64 to json pipeline',
          'server log cleaner',
          'sql identifier sanitizer'
        ]}
      />

      {/* Hero */}
      <div className="flex flex-col gap-4 mb-10 text-center sm:text-left">
        <div className="flex items-center gap-2 self-center sm:self-start text-xs font-semibold uppercase tracking-wider text-accent">
          <Workflow className="w-4 h-4" />
          <span>DevFlow Workflow Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-bright text-balance">
          Developer Workflow Recipes
        </h1>
        <p className="text-base text-muted max-w-2xl text-balance">
          Stop manually hopping between multiple tabs. These pre-configured, multi-step pipelines chain common full-stack and backend transformations together in 100% private browser memory.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Zero-latency synchronous execution</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side memory (Zero server transmission)</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-accent" />
            <span>Fully customizable step chains</span>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {DEV_RECIPES.map((recipe) => (
          <Link
            key={recipe.slug}
            to={`/recipes/${recipe.slug}`}
            className="group flex flex-col justify-between p-6 rounded-xl border border-border bg-surface hover:border-accent/60 hover:shadow-md transition-all"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  {recipe.category} workflow
                </span>
                <span className="text-xs text-muted font-mono">
                  {recipe.steps.length} chained steps
                </span>
              </div>

              <h2 className="text-lg font-bold text-bright group-hover:text-accent transition-colors">
                {recipe.title}
              </h2>

              <p className="text-xs text-muted leading-relaxed">
                {recipe.metaDescription}
              </p>

              {/* Steps overview */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {recipe.steps.map((st, i) => (
                  <span
                    key={st.id}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/40 text-bright border border-border/60"
                  >
                    {i + 1}. {st.operationId}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/60 text-xs font-medium text-bright group-hover:text-accent transition-colors">
              <span>Open live recipe canvas</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Custom Pipeline CTA Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-border bg-gradient-to-r from-surface to-muted/20">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-bright">Build Your Own Multi-Tool Pipeline</h3>
          <p className="text-xs text-muted max-w-xl">
            Need a custom sequence? Open the DevFlow Studio canvas to assemble your own combination of encoding, JSON parsing, regex extraction, and hashing steps.
          </p>
        </div>
        <Link
          to="/pipeline-studio"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent/90 transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Pipeline Studio</span>
        </Link>
      </div>
    </main>
  )
}
