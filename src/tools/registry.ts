import { ToolMeta } from "./tool-meta"
import { JSON_FORMATTER_META } from "./meta/json-formatter"
import { JSON_MODEL_META } from "./meta/json-model"
import { BASE_64_META } from "./meta/base-64"
import { URL_ENCODER_META } from "./meta/url-encoder"
import { TEXT_DIFF_META } from "./meta/text-diff"
import { UUID_META } from "./meta/uuid"
import { JWT_DECODER_META } from "./meta/jwt-decoder"
import { HTML_FORMATTER_META } from "./meta/html-formatter"
import { PASSWORD_GENERATOR_META } from "./meta/password-generator"
import { REGEX_META } from "./meta/regex"
import { MARKDOWN_PREVIEW_META } from "./meta/markdown-preview"
import { SHA_256_META } from "./meta/sha-256"
import { WORD_COUNTER_META } from "./meta/word-counter"

export const tools: ToolMeta[] = [
  JSON_FORMATTER_META,
  JSON_MODEL_META,
  BASE_64_META,
  URL_ENCODER_META,
  TEXT_DIFF_META,
  UUID_META,
  JWT_DECODER_META,
  HTML_FORMATTER_META,
  PASSWORD_GENERATOR_META,
  REGEX_META,
  MARKDOWN_PREVIEW_META,
  SHA_256_META,
  WORD_COUNTER_META
]

export const categoryLabels: Record<ToolMeta['category'], string> = {
  'json-tools': 'JSON',
  'encode-tools': 'Encode / Decode',
  'text-tools': 'Text',
  'generate-tools': 'Generators',
  'auth-tools': 'Authentication',
  'web-tools': 'Web',
  'data-tools': 'Data',
  'crypto-tools': 'Crypto',
  'analyze-tools': 'Analyze',
}

// Returns true if the tool is available for use (status is stable or beta, or no status set)
export function isAvailable(tool: ToolMeta): boolean {
  return !tool.status || tool.status == 'stable' || tool.status == 'beta';
}

export function isCommingSoon(tool: ToolMeta): boolean {
  return tool.status === 'coming-soon';
}

export function getToolBadge(tool: ToolMeta): string | null {
  if (tool.status === 'coming-soon') return tool.eta ? `Coming ${tool.eta}` : 'Soon'
  if (tool.status === 'beta') return 'Beta'
  if (tool.status === 'deprecated') return 'Deprecated'
  if (tool.isNew) return 'New'
  return null
}

export function getAvailableToolsByCategory(category: ToolMeta['category']): ToolMeta[] {
  return tools.filter(tool => tool.category === category && isAvailable(tool))
}

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find(tool => tool.slug === slug)
}

export function getFeaturedTools(): ToolMeta[] {
  return tools.filter(tool => tool.featured && isAvailable(tool))
}
export function getAllAvailableTools(): ToolMeta[] {
  return tools.filter(isAvailable)
}
export function getToolCategories(): { category: ToolMeta['category']; label: string }[] {
  const categories = Array.from(new Set(tools.map(t => t.category)))
  return categories.map(category => ({ category, label: categoryLabels[category] || category }))
}