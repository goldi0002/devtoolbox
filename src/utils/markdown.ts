/**
 * Dependency-free Markdown renderer shared by Markdown Preview and Markdown to HTML.
 *
 * Two modes:
 * - Default (Markdown Preview): output is unchanged from the original renderer. Links are only
 *   created for http(s) URLs.
 * - `exportMode` (Markdown to HTML): also renders images, allows http, https and mailto links and
 *   relative URLs, and protects code spans from emphasis. Every other URL scheme (javascript:,
 *   data:, vbscript: and anything else) is neutralized to plain text.
 *
 * In both modes raw HTML typed in the Markdown is escaped, so it is shown as text, never parsed.
 */

export interface MarkdownRenderOptions {
  /** Enables the export rules described above. */
  exportMode?: boolean
  /** Adds minimal `style` attributes to elements. Intended for export mode. */
  inlineStyles?: boolean
}

interface RenderContext {
  exportMode: boolean
  inlineStyles: boolean
}

type ListContext = {
  type: 'ul' | 'ol'
  items: string[]
}

const STYLES = {
  code: 'background:#f6f8fa;padding:2px 4px;border-radius:4px;font-family:monospace',
  pre: 'background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto',
  table: 'border-collapse:collapse;width:100%',
  th: 'border:1px solid #d0d7de;padding:6px 12px;text-align:left;font-weight:600;background:#f6f8fa',
  td: 'border:1px solid #d0d7de;padding:6px 12px;text-align:left',
  blockquote: 'border-left:4px solid #d0d7de;margin:0;padding:0 1em;color:#57606a',
  hr: 'border:0;border-top:1px solid #d0d7de',
  img: 'max-width:100%',
} as const

type StyleName = keyof typeof STYLES

/**
 * Placeholder delimiter: a private-use character. Export mode replaces it in the input before
 * rendering, so user text can never be mistaken for a placeholder.
 */
const PLACEHOLDER = ''

function styleAttr(name: StyleName, ctx: RenderContext): string {
  return ctx.inlineStyles ? ` style="${STYLES[name]}"` : ''
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const SAFE_SCHEME = /^(https?|mailto):$/i

/**
 * True when a link or image URL is safe to output. Relative URLs are allowed. A URL with a scheme
 * is allowed only for http, https and mailto. Whitespace and control characters are removed first,
 * because browsers ignore them inside a scheme (for example `java\tscript:`).
 */
export function isSafeUrl(url: string): boolean {
  const compact = Array.from(url)
    .filter(ch => ch.charCodeAt(0) > 0x20 && ch.charCodeAt(0) !== 0x7f)
    .join('')
  const scheme = /^[^/?#:]+:/.exec(compact)
  if (!scheme) return true
  return SAFE_SCHEME.test(scheme[0])
}

function inlineExport(raw: string, tokens: string[], ctx: RenderContext): string {
  const hold = (html: string) => {
    tokens.push(html)
    return `${PLACEHOLDER}${tokens.length - 1}${PLACEHOLDER}`
  }

  // Code spans first, so their content is never read as emphasis or links.
  let text = raw.replace(/`([^`]+)`/g, (_match, code: string) =>
    hold(`<code${styleAttr('code', ctx)}>${escapeHtml(code)}</code>`),
  )

  text = text.replace(/!\[([^\]]*)\]\(((?:[^\s()]|\([^\s()]*\))+)\)/g, (_match, alt: string, url: string) =>
    hold(isSafeUrl(url)
      ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${styleAttr('img', ctx)} />`
      : escapeHtml(alt)),
  )

  text = text.replace(/\[([^\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)\)/g, (_match, label: string, url: string) =>
    hold(isSafeUrl(url)
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${inlineExport(label, tokens, ctx)}</a>`
      : escapeHtml(label)),
  )

  // Escaping does not touch the placeholder characters, and the emphasis markers survive escaping.
  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')

  return text
}

function restorePlaceholders(text: string, tokens: string[]): string {
  return text.replace(new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, 'g'), (_match, index: string) =>
    restorePlaceholders(tokens[Number(index)], tokens),
  )
}

function parseInline(markdown: string, ctx: RenderContext): string {
  if (ctx.exportMode) {
    const tokens: string[] = []
    const input = markdown.split(PLACEHOLDER).join('�')
    return restorePlaceholders(inlineExport(input, tokens, ctx), tokens)
  }

  const escaped = escapeHtml(markdown)

  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

function tableRowToCells(row: string, tag: 'th' | 'td', ctx: RenderContext): string {
  return row
    .split('|')
    .slice(1, -1)
    .map(cell => `<${tag}${styleAttr(tag, ctx)}>${parseInline(cell.trim(), ctx)}</${tag}>`)
    .join('')
}

function renderTable(lines: string[], startIndex: number, ctx: RenderContext): { html: string; nextIndex: number } | null {
  const header = lines[startIndex]
  const divider = lines[startIndex + 1]

  if (!header || !divider) return null
  if (!header.includes('|')) return null
  if (!/^\|?\s*[-:]+(?:\s*\|\s*[-:]+)+\s*\|?$/.test(divider.trim())) return null

  const rows: string[] = []
  let index = startIndex + 2

  while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
    rows.push(lines[index])
    index += 1
  }

  const body = rows.map(row => `<tr>${tableRowToCells(row, 'td', ctx)}</tr>`).join('')

  return {
    html: `<table${styleAttr('table', ctx)}><thead><tr>${tableRowToCells(header, 'th', ctx)}</tr></thead>${body ? `<tbody>${body}</tbody>` : ''}</table>`,
    nextIndex: index,
  }
}

export function renderMarkdown(markdown: string, options: MarkdownRenderOptions = {}): string {
  const ctx: RenderContext = {
    exportMode: options.exportMode ?? false,
    inlineStyles: options.inlineStyles ?? false,
  }
  const normalized = markdown.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  const html: string[] = []
  let paragraph: string[] = []
  let codeLines: string[] = []
  let codeLanguage = ''
  let inCodeBlock = false
  let list: ListContext | null = null
  let blockquote: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${parseInline(paragraph.join(' ').trim(), ctx)}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    html.push(`<${list.type}>${list.items.map(item => `<li>${item}</li>`).join('')}</${list.type}>`)
    list = null
  }

  const flushBlockquote = () => {
    if (!blockquote.length) return
    html.push(`<blockquote${styleAttr('blockquote', ctx)}>${blockquote.map(line => `<p>${parseInline(line, ctx)}</p>`).join('')}</blockquote>`)
    blockquote = []
  }

  const flushCode = () => {
    if (!inCodeBlock) return
    const langClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ''
    html.push(`<pre${styleAttr('pre', ctx)}><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
    codeLines = []
    codeLanguage = ''
    inCodeBlock = false
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushList()
      flushBlockquote()

      if (inCodeBlock) {
        flushCode()
      } else {
        inCodeBlock = true
        codeLanguage = trimmed.slice(3).trim()
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    const table = renderTable(lines, index, ctx)
    if (table) {
      flushParagraph()
      flushList()
      flushBlockquote()
      html.push(table.html)
      index = table.nextIndex - 1
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      flushBlockquote()
      continue
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed)
    if (headingMatch) {
      flushParagraph()
      flushList()
      flushBlockquote()
      const level = headingMatch[1].length
      html.push(`<h${level}>${parseInline(headingMatch[2], ctx)}</h${level}>`)
      continue
    }

    const quoteMatch = /^>\s?(.*)$/.exec(trimmed)
    if (quoteMatch) {
      flushParagraph()
      flushList()
      blockquote.push(quoteMatch[1])
      continue
    }

    const unorderedMatch = /^[-*+]\s+(.+)$/.exec(trimmed)
    if (unorderedMatch) {
      flushParagraph()
      flushBlockquote()
      if (!list || list.type !== 'ul') {
        flushList()
        list = { type: 'ul', items: [] }
      }
      list.items.push(parseInline(unorderedMatch[1], ctx))
      continue
    }

    const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed)
    if (orderedMatch) {
      flushParagraph()
      flushBlockquote()
      if (!list || list.type !== 'ol') {
        flushList()
        list = { type: 'ol', items: [] }
      }
      list.items.push(parseInline(orderedMatch[1], ctx))
      continue
    }

    const hrMatch = /^(---|\*\*\*|___)$/.exec(trimmed)
    if (hrMatch) {
      flushParagraph()
      flushList()
      flushBlockquote()
      html.push(`<hr${styleAttr('hr', ctx)} />`)
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  flushBlockquote()
  flushCode()

  return html.join('\n')
}

/** Text of the first ATX heading, with simple Markdown markup removed. Falls back to `Document`. */
export function extractTitle(markdown: string): string {
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const match = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)
    if (match) {
      const text = match[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .trim()
      if (text) return text
    }
  }
  return 'Document'
}

/** Wraps an HTML fragment in a complete document with doctype, charset, title and body. */
export function buildHtmlDocument(body: string, title: string): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
  ].join('\n')
}

export interface HtmlExportOptions {
  /** Adds minimal inline style attributes to elements. */
  inlineStyles: boolean
  /** Wraps the fragment in a full HTML document. */
  fullDocument: boolean
}

/** Converts Markdown to HTML using the export rules: escaped raw HTML and safe URLs only. */
export function markdownToHtml(markdown: string, options: HtmlExportOptions): string {
  if (!markdown.trim()) return ''
  const body = renderMarkdown(markdown, { exportMode: true, inlineStyles: options.inlineStyles })
  if (!options.fullDocument) return body
  return buildHtmlDocument(body, extractTitle(markdown))
}
