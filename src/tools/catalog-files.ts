/**
 * Builds the public tool catalog files from the tool registry.
 *
 * The registry (src/tools/registry.ts + src/tools/meta/*) is the single source
 * of truth. Run `npm run catalog` after adding or editing a tool; the output is
 * committed, `npm run build` regenerates it, and `catalogSync.test.ts` fails if
 * the committed files are stale.
 *
 * Pure string functions only (no fs), so this module is type-checked and
 * tested like the rest of src/. scripts/generate-catalog.mjs does the I/O.
 *
 * public/sitemap.xml is intentionally absent: vite-plugin-sitemap writes
 * dist/sitemap.xml at build time from the routes in vite.config.ts.
 */
import type { ToolMeta } from './tool-meta'
import type { DevRecipe } from '../data/recipes'

export const SITE_URL = 'https://www.toolbox4devs.com'

/** Files rewritten in full. */
export const GENERATED_FILES = [
  'src/tools/registry-node.ts',
  'public/tools.json',
  'public/llms.txt',
  'public/llms-full.txt',
] as const

/** Hand-written files where only the tool count is kept in sync. */
export const COUNT_FILES = ['index.html', 'public/manifest.json', 'public/opensearch.xml'] as const

export type GeneratedFile = (typeof GENERATED_FILES)[number]
export type CountFile = (typeof COUNT_FILES)[number]

export interface CatalogInput {
  tools: ToolMeta[]
  categoryLabels: Record<ToolMeta['category'], string>
  recipes: DevRecipe[]
}

const GENERATED_NOTICE = 'Generated from src/tools/registry.ts by `npm run catalog`. Do not edit by hand.'

const toolUrl = (slug: string) => `${SITE_URL}/${slug}`
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Categories that have tools, in the order categoryLabels declares them. */
function categoriesOf({ tools, categoryLabels }: CatalogInput): ToolMeta['category'][] {
  const used = new Set(tools.map(t => t.category))
  return (Object.keys(categoryLabels) as ToolMeta['category'][]).filter(c => used.has(c))
}

/** "Data" -> "Data Tools"; labels that are already plural ("Generators") stay as-is. */
function sectionTitle(label: string): string {
  return label.endsWith('s') ? label : `${label} Tools`
}

function registryNode({ tools }: CatalogInput): string {
  const width = Math.max(...tools.map(t => t.slug.length)) + 3
  const rows = tools
    .map(t => `  { slug: ${`'${t.slug}',`.padEnd(width)} category: '${t.category}' },`)
    .join('\n')
  return `// ${GENERATED_NOTICE}
// ⚠️ No React imports — safe for vite.config.ts (Node context).

const toolMeta = [
${rows}
] as const

export function getAllAvailableTools() {
  return toolMeta
}

export function getToolCategories() {
  const seen = new Set<string>()
  return toolMeta
    .filter(t => {
      if (seen.has(t.category)) return false
      seen.add(t.category)
      return true
    })
    .map(t => ({ category: t.category }))
}
`
}

function toolsJson(input: CatalogInput): string {
  const { tools, categoryLabels } = input
  const catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $comment: GENERATED_NOTICE,
    name: 'ToolBox4Devs Catalog',
    url: SITE_URL,
    description: 'Fast, private, 100% client-side developer utilities running directly in browser memory.',
    totalTools: tools.length,
    privacyPolicy: 'Zero outbound network requests during tool execution. 100% in-browser processing.',
    categories: categoriesOf(input).map(id => ({ id, name: categoryLabels[id] ?? id })),
    tools: tools.map(t => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      url: toolUrl(t.slug),
      description: t.description,
      ...(t.complexity ? { complexity: t.complexity } : {}),
      ...(t.status && t.status !== 'stable' ? { status: t.status } : {}),
      keywords: t.keywords,
      features: t.about.features,
      ...(t.about.tip ? { tip: t.about.tip } : {}),
    })),
  }
  return JSON.stringify(catalog, null, 2) + '\n'
}

function llmsTxt(input: CatalogInput): string {
  const { tools, categoryLabels, recipes } = input
  const sections = categoriesOf(input).map(category => {
    const items = tools
      .filter(t => t.category === category)
      .map(t => `- [${t.name}](${toolUrl(t.slug)}): ${t.description}`)
    return `### ${sectionTitle(categoryLabels[category] ?? category)}\n${items.join('\n')}`
  })
  const recipeItems = recipes.map(
    r => `- [${r.shortTitle}](${SITE_URL}/recipes/${r.slug}): ${r.metaDescription}`
  )

  return `# ToolBox4Devs (toolbox4devs.com)

> ToolBox4Devs is a suite of ${tools.length} fast, private, 100% browser-based developer utilities. Every tool runs client-side in the browser's JavaScript runtime with zero backend roundtrips, zero cookies, zero analytics trackers, and zero telemetry.

<!-- ${GENERATED_NOTICE} -->

## System Guarantees
- **100% Client-Side Privacy**: No text, tokens, API keys, JSON payloads, or data ever leaves the user's browser.
- **Offline Capable & Zero Latency**: Instant synchronous execution using Web APIs, Web Crypto, and JavaScript.
- **No Ads, Paywalls, or Accounts**: Free to use without authentication.

## Tools Directory

${sections.join('\n\n')}

### Developer Workflow Recipes
- [Developer Workflow Recipes Hub](${SITE_URL}/recipes): Multi-step preconfigured pipelines chaining formatters, encoders, token decoders, and filters client-side.
${recipeItems.join('\n')}

## Programmatic API / Agent Catalog
AI agents can consume the structured machine-readable catalog at:
\`${SITE_URL}/tools.json\`

Detailed technical documentation for LLMs:
\`${SITE_URL}/llms-full.txt\`
`
}

function llmsFullTxt({ tools, categoryLabels, recipes }: CatalogInput): string {
  const entries = tools.map((t, i) => {
    const lines = [
      `### ${i + 1}. ${t.name}`,
      `- URL: ${toolUrl(t.slug)}`,
      `- Category: ${categoryLabels[t.category] ?? t.category} (${t.category})`,
      t.complexity && `- Complexity: ${capitalize(t.complexity)}`,
      t.status && t.status !== 'stable' && `- Status: ${capitalize(t.status)}`,
      `- Description: ${t.description}`,
      `- Summary: ${t.about.summary.replace(/\s+/g, ' ').trim()}`,
      t.about.useCases.length > 0 && `- Use Cases: ${t.about.useCases.join('; ')}`,
      t.about.features.length > 0 && `- Features: ${t.about.features.join('; ')}`,
      t.about.tip && `- Tip: ${t.about.tip}`,
    ]
    return lines.filter(Boolean).join('\n')
  })
  const recipeLines = recipes.map(
    (r, i) => `  ${i + 1}. ${r.shortTitle} (${SITE_URL}/recipes/${r.slug}): ${r.metaDescription}`
  )

  return `# ToolBox4Devs — Full Technical Specification for AI Agents & Crawlers

Website: ${SITE_URL}
Architecture: 100% Client-Side React SPA / Static SSG
Data Transmission: 0 bytes outbound (all operations run in browser memory)
Pricing: 100% Free Open Source & Ad-Free
Total Tools: ${tools.length}

<!-- ${GENERATED_NOTICE} -->

---

## Tool Registry & Technical Specifications (All ${tools.length} Tools)

${entries.join('\n\n')}

## Developer Workflow Recipes
- Hub URL: ${SITE_URL}/recipes
- Description: Pre-assembled sequential multi-tool pipelines executing client-side with zero latency.
- Recipes:
${recipeLines.join('\n')}
`
}

/** Returns the full contents of every generated file. */
export function buildCatalogFiles(input: CatalogInput): Record<GeneratedFile, string> {
  return {
    'src/tools/registry-node.ts': registryNode(input),
    'public/tools.json': toolsJson(input),
    'public/llms.txt': llmsTxt(input),
    'public/llms-full.txt': llmsFullTxt(input),
  }
}

/** Patterns for the "N+ tools" phrases in hand-written files; group 1 is the number. */
const COUNT_PATTERNS: Record<CountFile, RegExp[]> = {
  'index.html': [/Access (\d+)\+ fast/g],
  'public/manifest.json': [/"(\d+)\+ fast, private/g, /catalog of (\d+)\+ utilities/g],
  'public/opensearch.xml': [/Search (\d+)\+ fast/g],
}

/**
 * Rewrites the tool count inside a hand-written file. Throws if an expected
 * phrase is missing, so a copy edit can't silently stop the sync.
 */
export function syncToolCount(file: CountFile, content: string, count: number): string {
  let result = content
  for (const pattern of COUNT_PATTERNS[file]) {
    if (!new RegExp(pattern.source).test(result)) {
      throw new Error(`${file}: expected a tool-count phrase matching ${pattern} (update COUNT_PATTERNS in src/tools/catalog-files.ts)`)
    }
    result = result.replace(pattern, (match, n: string) => match.replace(n, String(count)))
  }
  return result
}
