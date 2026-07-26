import { ToolMeta } from "./tool-meta"
import { JSON_FORMATTER_META } from "./meta/json-formatter"
import { JSON_MODEL_META } from "./meta/json-model"
import { BASE_64_META } from "./meta/base-64"
import { URL_ENCODER_META } from "./meta/url-encoder"
import { HTML_ENTITY_META } from "./meta/html-entity"
import { TEXT_DIFF_META } from "./meta/text-diff"
import { UUID_META } from "./meta/uuid"
import { JWT_DECODER_META } from "./meta/jwt-decoder"
import { HTML_FORMATTER_META } from "./meta/html-formatter"
import { PASSWORD_GENERATOR_META } from "./meta/password-generator"
import { REGEX_META } from "./meta/regex"
import { CASE_CONVERTER_META } from "./meta/case-converter"
import { SLUG_GENERATOR_META } from "./meta/slug-generator"
import { MARKDOWN_PREVIEW_META } from "./meta/markdown-preview"
import { SHA_256_META } from "./meta/sha-256"
import { WORD_COUNTER_META } from "./meta/word-counter"
import { TIMESTAMP_CONVERTER_META } from "./meta/timestamp-converter"
import { QUERY_STRING_PARSER_META } from "./meta/query-string-parser"
import { LOREM_IPSUM_GENERATOR_META } from "./meta/lorem-ipsum-generator"
import { COLOR_CONVERTER_META } from "./meta/color-converter"
import { HTTP_STATUS_LOOKUP_META } from "./meta/http-status-lookup"
import { MIME_TYPE_LOOKUP_META } from "./meta/mime-type-lookup"
import { USER_AGENT_PARSER_META } from "./meta/user-agent-parser"
import { ASCII_TABLE_META } from "./meta/ascii-table"
import { HASH_COMPARATOR_META } from "./meta/hash-comparator"
import { HTTP_HEADER_PARSER_META } from "./meta/http-header-parser"
import { BASIC_AUTH_HEADER_META } from "./meta/basic-auth-header"
import { UNIX_PERMISSIONS_CALCULATOR_META } from "./meta/unix-permissions-calculator"
import { LOCAL_AI_TEXT_ASSISTANT_META } from "./meta/local-ai-text-assistant"
import { JSON_TO_ZOD_META } from "./meta/json-to-zod"
import { CRON_PARSER_META } from "./meta/cron-parser"
import { CURL_CONVERTER_META } from "./meta/curl-converter"
import { SQL_FORMATTER_META } from "./meta/sql-formatter"
import { GRAPHQL_FORMATTER_META } from "./meta/graphql-formatter"
import { YAML_JSON_CONVERTER_META } from "./meta/yaml-json-converter"
import { HMAC_GENERATOR_META } from "./meta/hmac-generator"

export const tools: ToolMeta[] = [
  JSON_FORMATTER_META,
  JSON_MODEL_META,
  JSON_TO_ZOD_META,
  YAML_JSON_CONVERTER_META,
  CURL_CONVERTER_META,
  SQL_FORMATTER_META,
  GRAPHQL_FORMATTER_META,
  HMAC_GENERATOR_META,
  BASE_64_META,
  URL_ENCODER_META,
  HTML_ENTITY_META,
  TEXT_DIFF_META,
  UUID_META,
  JWT_DECODER_META,
  HTML_FORMATTER_META,
  PASSWORD_GENERATOR_META,
  LOREM_IPSUM_GENERATOR_META,
  REGEX_META,
  CASE_CONVERTER_META,
  SLUG_GENERATOR_META,
  MARKDOWN_PREVIEW_META,
  SHA_256_META,
  WORD_COUNTER_META,
  TIMESTAMP_CONVERTER_META,
  CRON_PARSER_META,
  QUERY_STRING_PARSER_META,
  COLOR_CONVERTER_META,
  HTTP_STATUS_LOOKUP_META,
  MIME_TYPE_LOOKUP_META,
  USER_AGENT_PARSER_META,
  ASCII_TABLE_META,
  HASH_COMPARATOR_META,
  HTTP_HEADER_PARSER_META,
  BASIC_AUTH_HEADER_META,
  UNIX_PERMISSIONS_CALCULATOR_META,
  LOCAL_AI_TEXT_ASSISTANT_META
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

export function isComingSoon(tool: ToolMeta): boolean {
  return tool.status === 'coming-soon';
}

/** @deprecated Use isComingSoon instead */
export function isCommingSoon(tool: ToolMeta): boolean {
  return isComingSoon(tool);
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