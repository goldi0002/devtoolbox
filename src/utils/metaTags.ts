/** Recommended lengths (in characters) used for the warnings under the form. */
export const TITLE_RECOMMENDED = { min: 30, max: 60 } as const
export const DESCRIPTION_RECOMMENDED = { min: 70, max: 160 } as const

export type TwitterCardType = 'summary' | 'summary_large_image'

export const TWITTER_CARD_LABELS: Record<TwitterCardType, string> = {
  summary: 'Summary',
  summary_large_image: 'Summary with large image',
}

export interface MetaTagInput {
  title: string
  description: string
  url: string
  imageUrl: string
  siteName: string
  twitterCard: TwitterCardType
  themeColor: string
  canonical: string
}

export const EMPTY_META_INPUT: MetaTagInput = {
  title: '',
  description: '',
  url: '',
  imageUrl: '',
  siteName: '',
  twitterCard: 'summary_large_image',
  themeColor: '',
  canonical: '',
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapes text for use in HTML element content or a double-quoted attribute value. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, ch => HTML_ENTITIES[ch])
}

/** Length in user-perceived characters (code points), so an emoji counts as one. */
export function charLength(text: string): number {
  return [...text.trim()].length
}

/**
 * Returns a warning when a non-empty value falls outside its recommended range,
 * or null when it is empty or within range.
 */
export function lengthWarning(
  text: string,
  range: { min: number; max: number },
  label: string,
): string | null {
  const length = charLength(text)
  if (length === 0) return null
  if (length > range.max) {
    return `${label} is ${length} characters. Keep it to ${range.max} or fewer so it is not cut off.`
  }
  if (length < range.min) {
    return `${label} is ${length} characters. Aim for at least ${range.min}.`
  }
  return null
}

/** Warns when a non-empty URL is not an absolute http(s) address. */
export function urlWarning(value: string, label: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const { protocol } = new URL(trimmed)
    if (protocol === 'http:' || protocol === 'https:') return null
    return `${label} should use http:// or https://.`
  } catch {
    return `${label} must be an absolute URL, such as https://example.com/page.`
  }
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isValidThemeColor(value: string): boolean {
  return HEX_COLOR.test(value.trim())
}

/** Hostname without a leading "www.", or the raw text when it is not a URL. */
export function displayHost(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  try {
    return new URL(trimmed).hostname.replace(/^www\./, '')
  } catch {
    return trimmed
  }
}

/**
 * Builds the head markup for the given page metadata.
 * Empty fields are omitted, and every value is HTML-escaped.
 */
export function buildMetaTags(input: MetaTagInput): string {
  const title = input.title.trim()
  const description = input.description.trim()
  const url = input.url.trim()
  const imageUrl = input.imageUrl.trim()
  const siteName = input.siteName.trim()
  const canonical = input.canonical.trim()
  const themeColor = input.themeColor.trim()

  const lines: string[] = []
  if (title) lines.push(`<title>${escapeHtml(title)}</title>`)
  if (description) lines.push(`<meta name="description" content="${escapeHtml(description)}">`)
  if (canonical) lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`)
  if (isValidThemeColor(themeColor)) lines.push(`<meta name="theme-color" content="${escapeHtml(themeColor)}">`)

  if (title) lines.push(`<meta property="og:title" content="${escapeHtml(title)}">`)
  if (description) lines.push(`<meta property="og:description" content="${escapeHtml(description)}">`)
  lines.push('<meta property="og:type" content="website">')
  if (url) lines.push(`<meta property="og:url" content="${escapeHtml(url)}">`)
  if (imageUrl) lines.push(`<meta property="og:image" content="${escapeHtml(imageUrl)}">`)
  if (siteName) lines.push(`<meta property="og:site_name" content="${escapeHtml(siteName)}">`)

  lines.push(`<meta name="twitter:card" content="${escapeHtml(input.twitterCard)}">`)
  if (title) lines.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`)
  if (description) lines.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`)
  if (imageUrl) lines.push(`<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`)

  return lines.join('\n')
}
