import { useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getRecipeBySlug, DEV_RECIPES } from '../data/recipes'
import { tools } from '../tools/registry'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO, HowToStep } from '../hooks/useSEO'
import DevFlowStudio from '../components/pipeline/DevFlowStudio'
import {
  Workflow,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react'

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>()
  const recipe = useMemo(() => (slug ? getRecipeBySlug(slug) : undefined), [slug])

  usePageTitle(recipe?.shortTitle ?? 'Developer Recipe')

  const steps = useMemo<HowToStep[]>(() => {
    if (!recipe) return []
    return recipe.steps.map((st, i) => ({
      name: `Step ${i + 1}: ${st.operationId}`,
      text: `Execute ${st.operationId} on current intermediate output payload.`
    }))
  }, [recipe])

  if (!recipe) {
    return <Navigate to="/recipes" replace />
  }

  const relatedTools = recipe.relatedToolSlugs
    .map(s => tools.find(t => t.slug === s))
    .filter((t): t is typeof tools[0] => Boolean(t))

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <SEO
        title={recipe.metaTitle}
        description={recipe.metaDescription}
        slug={`recipes/${recipe.slug}`}
        keywords={recipe.targetKeywords}
        category="developer-recipe"
        faqs={recipe.faqs}
        steps={steps}
        type="software"
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted mb-6">
        <Link to="/" className="hover:text-bright transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/recipes" className="hover:text-bright transition-colors">Recipes</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-bright truncate">{recipe.shortTitle}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-accent tracking-wider font-semibold">
          <Workflow className="w-4 h-4" />
          <span>{recipe.category} Pipeline Recipe</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bright text-balance">
          {recipe.title}
        </h1>
        <p className="text-sm text-muted max-w-3xl leading-relaxed">
          {recipe.metaDescription}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero server requests</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Runs 100% in local memory</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4 text-accent" />
            <span>{recipe.steps.length} sequential operations</span>
          </div>
        </div>
      </div>

      {/* Live Interactive Studio Pre-configured with Recipe */}
      <div className="mb-12">
        <DevFlowStudio initialRecipe={recipe} initialInput={recipe.sampleInput} />
      </div>

      {/* Problem & Solution Technical Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-xl border border-border bg-surface flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-bright">The Developer Challenge</h2>
          <p className="text-xs text-muted leading-relaxed">
            {recipe.problemSummary}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-surface flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">The DevFlow Solution</h2>
          <p className="text-xs text-muted leading-relaxed">
            {recipe.solutionSummary}
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      {recipe.faqs && recipe.faqs.length > 0 && (
        <section className="mb-12 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-bold text-bright">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {recipe.faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-surface flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold text-bright">{faq.question}</h3>
                <p className="text-xs text-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Individual Tools */}
      {relatedTools.length > 0 && (
        <section className="flex flex-col gap-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-bright">Complementary Standalone Tools</h2>
            <Link to="/tools" className="text-xs text-accent hover:underline flex items-center gap-1">
              <span>View all tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {relatedTools.map(tool => (
              <Link
                key={tool.slug}
                to={`/${tool.slug}`}
                className="p-3.5 rounded-lg border border-border bg-surface hover:border-accent/60 transition-colors flex flex-col gap-1"
              >
                <span className="text-xs font-medium text-bright">{tool.name}</span>
                <span className="text-[11px] text-muted line-clamp-2">{tool.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
