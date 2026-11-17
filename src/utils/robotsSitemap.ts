import { urlWarning } from './metaTags'

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

/** Escapes the five XML special characters so a value is safe as element text. */
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, ch => XML_ENTITIES[ch])
}

export interface TextLine {
  /** 1-based line number in the original text, so warnings can point at it. */
  line: number
  text: string
}

/** Splits text into trimmed, non-empty lines, keeping each line's original number. */
export function parseLines(text: string): TextLine[] {
  const result: TextLine[] = []
  text.split(/\r?\n/).forEach((raw, index) => {
    const trimmed = raw.trim()
    if (trimmed) result.push({ line: index + 1, text: trimmed })
  })
  return result
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

export interface RobotsGroup {
  userAgent: string
  /** One path per line. */
  allow: string
  /** One path per line. */
  disallow: string
  /** Seconds between requests. Empty means the line is left out. */
  crawlDelay: string
}

export interface RobotsConfig {
  groups: RobotsGroup[]
  /** One sitemap URL per line. */
  sitemaps: string
}

/**
 * Crawler tokens for common AI training and answer-engine bots.
 * Google-Extended is a control token, not a separate crawler: blocking it
 * tells Google not to use content for AI training.
 */
export const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
] as const

export const EMPTY_ROBOTS_GROUP: RobotsGroup = {
  userAgent: '*',
  allow: '',
  disallow: '',
  crawlDelay: '',
}

export const ROBOTS_PRESET_IDS = ['allow-all', 'block-all', 'block-ai'] as const
export type RobotsPresetId = (typeof ROBOTS_PRESET_IDS)[number]

export const ROBOTS_PRESET_LABELS: Record<RobotsPresetId, string> = {
  'allow-all': 'Allow all',
  'block-all': 'Block all',
  'block-ai': 'Block AI crawlers',
}

/** Returns the groups a preset replaces the editor with. Always returns fresh objects. */
export function robotsPresetGroups(id: RobotsPresetId): RobotsGroup[] {
  if (id === 'allow-all') {
    return [{ userAgent: '*', allow: '/', disallow: '', crawlDelay: '' }]
  }
  if (id === 'block-all') {
    return [{ userAgent: '*', allow: '', disallow: '/', crawlDelay: '' }]
  }
  return AI_CRAWLERS.map(userAgent => ({ userAgent, allow: '', disallow: '/', crawlDelay: '' }))
}

/**
 * Builds the robots.txt text. Groups are separated by a blank line, and the
 * sitemap lines follow the last group. Empty fields are left out.
 */
export function buildRobotsTxt(config: RobotsConfig): string {
  const blocks: string[] = []

  for (const group of config.groups) {
    const userAgent = group.userAgent.trim()
    if (!userAgent) continue
    const lines = [`User-agent: ${userAgent}`]
    for (const path of parseLines(group.allow)) lines.push(`Allow: ${path.text}`)
    for (const path of parseLines(group.disallow)) lines.push(`Disallow: ${path.text}`)
    const delay = group.crawlDelay.trim()
    if (delay) lines.push(`Crawl-delay: ${delay}`)
    blocks.push(lines.join('\n'))
  }

  const sitemapLines = parseLines(config.sitemaps).map(line => `Sitemap: ${line.text}`)
  if (sitemapLines.length) blocks.push(sitemapLines.join('\n'))

  return blocks.length ? `${blocks.join('\n\n')}\n` : ''
}

const NON_NEGATIVE_NUMBER = /^\d+(?:\.\d+)?$/

/** Returns human-readable warnings for the robots.txt configuration. */
export function validateRobots(config: RobotsConfig): string[] {
  const warnings: string[] = []
  const usedAgents = new Map<string, number>()

  config.groups.forEach((group, index) => {
    const number = index + 1
    const userAgent = group.userAgent.trim()
    if (!userAgent) {
      warnings.push(`Group ${number} has no user-agent, so it is left out of the file.`)
    } else {
      const key = userAgent.toLowerCase()
      if (usedAgents.has(key)) {
        warnings.push(
          `User-agent "${userAgent}" appears in more than one group. Merge them into one group, since crawlers may read duplicates inconsistently.`,
        )
      } else {
        usedAgents.set(key, number)
      }
    }

    for (const [kind, text] of [
      ['Allow', group.allow],
      ['Disallow', group.disallow],
    ] as const) {
      for (const path of parseLines(text)) {
        if (!path.text.startsWith('/')) {
          warnings.push(`${kind} path "${path.text}" in group ${number} should start with /.`)
        }
      }
    }

    const delay = group.crawlDelay.trim()
    if (delay && !NON_NEGATIVE_NUMBER.test(delay)) {
      warnings.push(`Crawl-delay "${delay}" in group ${number} must be a whole or decimal number of seconds.`)
    }
    if (delay && NON_NEGATIVE_NUMBER.test(delay)) {
      warnings.push(
        `Group ${number} sets Crawl-delay. Google ignores it, so it only affects crawlers that support it.`,
      )
    }
  })

  if (config.groups.length === 0) {
    warnings.push('Add at least one user-agent group, or use a preset.')
  }

  const seenSitemaps = new Set<string>()
  for (const line of parseLines(config.sitemaps)) {
    const warning = urlWarning(line.text, `Sitemap on line ${line.line}`)
    if (warning) warnings.push(warning)
    if (seenSitemaps.has(line.text)) {
      warnings.push(`Sitemap "${line.text}" is listed more than once.`)
    }
    seenSitemaps.add(line.text)
  }

  return warnings
}

/* ------------------------------------------------------------------ */
/* sitemap.xml                                                         */
/* ------------------------------------------------------------------ */

export const SITEMAP_CHANGEFREQS = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const
export type SitemapChangefreq = (typeof SITEMAP_CHANGEFREQS)[number]

export const SITEMAP_MAX_URLS = 50000

export interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: SitemapChangefreq
  priority?: string
}

export interface SitemapResult {
  entries: SitemapEntry[]
  xml: string
  warnings: string[]
}

const LASTMOD_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/
const PRIORITY_PATTERN = /^(?:0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/

/** Accepts the W3C Datetime formats the sitemap protocol allows, with a real calendar date. */
export function isValidLastmod(value: string): boolean {
  if (!LASTMOD_PATTERN.test(value)) return false
  const day = value.slice(0, 10)
  const date = new Date(`${day}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day
}

/**
 * Reads one sitemap line: a URL followed by optional lastmod, changefreq and
 * priority values in any order. Each optional value is recognised by its shape.
 * Invalid values are reported and dropped; the URL itself is kept if it is valid.
 */
function parseSitemapLine(text: string, lineNumber: number, warnings: string[]): SitemapEntry | null {
  const [url, ...fields] = text.split(/\s+/)
  const label = `Line ${lineNumber}`

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const warning = urlWarning(url, `${label}: "${url}"`)
    if (warning) warnings.push(`${warning} This line is left out.`)
    return null
  }
  try {
    new URL(url)
  } catch {
    warnings.push(`${label}: "${url}" is not a valid URL. This line is left out.`)
    return null
  }

  const entry: SitemapEntry = { url }
  for (const field of fields) {
    const lower = field.toLowerCase()
    if (/^\d{4}-/.test(field)) {
      if (entry.lastmod !== undefined) {
        warnings.push(`${label}: lastmod is given more than once. Keeping the first.`)
      } else if (isValidLastmod(field)) {
        entry.lastmod = field
      } else {
        warnings.push(`${label}: lastmod "${field}" is not a valid date. Use YYYY-MM-DD. It is left out.`)
      }
    } else if ((SITEMAP_CHANGEFREQS as readonly string[]).includes(lower)) {
      if (entry.changefreq !== undefined) {
        warnings.push(`${label}: changefreq is given more than once. Keeping the first.`)
      } else {
        entry.changefreq = lower as SitemapChangefreq
      }
    } else if (/^[\d.]+$/.test(field)) {
      if (entry.priority !== undefined) {
        warnings.push(`${label}: priority is given more than once. Keeping the first.`)
      } else if (PRIORITY_PATTERN.test(field)) {
        entry.priority = field
      } else {
        warnings.push(`${label}: priority "${field}" must be between 0.0 and 1.0. It is left out.`)
      }
    } else {
      warnings.push(
        `${label}: "${field}" is not a lastmod date, changefreq or priority. It is ignored.`,
      )
    }
  }
  return entry
}

/** Builds sitemap.xml from entries. Every value is XML-escaped. */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>']
  if (entries.length === 0) {
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>')
  } else {
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for (const entry of entries) {
      lines.push('  <url>')
      lines.push(`    <loc>${escapeXml(entry.url)}</loc>`)
      if (entry.lastmod) lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`)
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      if (entry.priority) lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`)
      lines.push('  </url>')
    }
    lines.push('</urlset>')
  }
  return `${lines.join('\n')}\n`
}

/**
 * Parses one URL per line into sitemap entries and builds the XML.
 * Lines with a relative, non-http(s) or duplicate URL are left out and reported.
 */
export function generateSitemap(text: string): SitemapResult {
  const warnings: string[] = []
  const entries: SitemapEntry[] = []
  const seen = new Map<string, number>()

  for (const line of parseLines(text)) {
    const entry = parseSitemapLine(line.text, line.line, warnings)
    if (!entry) continue
    const firstLine = seen.get(entry.url)
    if (firstLine !== undefined) {
      warnings.push(`Line ${line.line}: "${entry.url}" is a duplicate of line ${firstLine}. This line is left out.`)
      continue
    }
    seen.set(entry.url, line.line)
    entries.push(entry)
  }

  if (entries.length > SITEMAP_MAX_URLS) {
    warnings.push(
      `The sitemap has ${entries.length} URLs. One file should hold no more than ${SITEMAP_MAX_URLS.toLocaleString('en-US')}, so split it and list the parts in a sitemap index.`,
    )
  }

  return { entries, xml: buildSitemapXml(entries), warnings }
}
