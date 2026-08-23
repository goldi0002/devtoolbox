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
import { CIDR_CALCULATOR_META } from "./meta/cidr-calculator"
import { STRING_ESCAPER_META } from "./meta/string-escaper"
import { BASE_CONVERTER_META } from "./meta/base-converter"
import { CSS_UNIT_CONVERTER_META } from "./meta/css-unit-converter"
import { JSON_TO_CSV_META } from "./meta/json-to-csv"
import { BCRYPT_GENERATOR_META } from "./meta/bcrypt-generator"
import { KEYCODE_INSPECTOR_META } from "./meta/keycode-inspector"
import { DOCKERFILE_GENERATOR_META } from "./meta/dockerfile-generator"
import { CSV_TO_MARKDOWN_META } from "./meta/csv-to-markdown"
import { HEX_CONVERTER_META } from "./meta/hex-converter"
import { MAC_ADDRESS_GENERATOR_META } from "./meta/mac-address-generator"
import { RSA_KEY_GENERATOR_META } from "./meta/rsa-key-generator"
import { SVG_PLACEHOLDER_GENERATOR_META } from "./meta/svg-placeholder-generator"
import { URL_PARSER_META } from "./meta/url-parser"
import { XML_FORMATTER_META } from "./meta/xml-formatter"
import { WCAG_CONTRAST_CHECKER_META } from "./meta/wcag-contrast-checker"
import { SEMVER_CALCULATOR_META } from "./meta/semver-calculator"
import { JSON_TO_SQL_META } from "./meta/json-to-sql"
import { AGE_CALCULATOR_META } from "./meta/age-calculator"
import { LINE_SORTER_META } from "./meta/line-sorter"
import { NUMBER_TO_WORDS_META } from "./meta/number-to-words"
import { DOCKER_RUN_TO_COMPOSE_META } from "./meta/docker-run-to-compose"
import { SVG_TO_JSX_META } from "./meta/svg-to-jsx"
import { QR_CODE_GENERATOR_META } from "./meta/qr-code-generator"
import { QR_CODE_SCANNER_META } from "./meta/qr-code-scanner"
import { GITIGNORE_GENERATOR_META } from "./meta/gitignore-generator"
import { TEXT_REPEATER_META } from "./meta/text-repeater"
import { AI_TOKEN_COUNTER_META } from "./meta/ai-token-counter"
import { JWT_ENCODER_META } from "./meta/jwt-encoder"
import { CRON_GENERATOR_META } from "./meta/cron-generator"

export const tools: ToolMeta[] = [
  JSON_FORMATTER_META,
  JSON_MODEL_META,
  JSON_TO_ZOD_META,
  JSON_TO_CSV_META,
  JSON_TO_SQL_META,
  AGE_CALCULATOR_META,
  WCAG_CONTRAST_CHECKER_META,
  SEMVER_CALCULATOR_META,
  YAML_JSON_CONVERTER_META,
  CURL_CONVERTER_META,
  SQL_FORMATTER_META,
  GRAPHQL_FORMATTER_META,
  DOCKERFILE_GENERATOR_META,
  DOCKER_RUN_TO_COMPOSE_META,
  SVG_TO_JSX_META,
  QR_CODE_GENERATOR_META,
  QR_CODE_SCANNER_META,
  GITIGNORE_GENERATOR_META,
  HMAC_GENERATOR_META,
  BCRYPT_GENERATOR_META,
  CIDR_CALCULATOR_META,
  STRING_ESCAPER_META,
  BASE_CONVERTER_META,
  CSS_UNIT_CONVERTER_META,
  KEYCODE_INSPECTOR_META,
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
  LOCAL_AI_TEXT_ASSISTANT_META,
  CSV_TO_MARKDOWN_META,
  HEX_CONVERTER_META,
  MAC_ADDRESS_GENERATOR_META,
  RSA_KEY_GENERATOR_META,
  SVG_PLACEHOLDER_GENERATOR_META,
  URL_PARSER_META,
  XML_FORMATTER_META,
  LINE_SORTER_META,
  NUMBER_TO_WORDS_META,
  TEXT_REPEATER_META,
  AI_TOKEN_COUNTER_META,
  JWT_ENCODER_META,
  CRON_GENERATOR_META
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