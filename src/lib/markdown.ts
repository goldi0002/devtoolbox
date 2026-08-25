export type BlockNode =
  | { type: 'code'; code: string; lang: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string; id: string }
  | { type: 'h4'; text: string; id: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; calloutType: 'note' | 'warning' | 'security' | 'tip' | 'quote'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; text: string }

export function slugifyHeading(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Parses inline markdown elements safely:
 * - Code spans (`code`) protected via unique Unicode sentinel placeholders
 * - Math spans ($math$)
 * - Links ([text](url))
 * - Bold (**text**)
 * - Italic (*text*)
 * - Strikethrough (~~text~~)
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return ''

  // 1. Extract inline code blocks first using non-colliding Unicode private use area sentinels
  const codeSpans: string[] = []
  const textWithCodePlaceholders = text.replace(/`([^`]+)`/g, (_, codeContent) => {
    const placeholder = `\uE000CODE_${codeSpans.length}\uE001`
    codeSpans.push(codeContent)
    return placeholder
  })

  // 2. Escape HTML for everything outside inline code
  let escaped = escapeHtml(textWithCodePlaceholders)

  // 3. Math expressions $formula$
  escaped = escaped.replace(/\$([^$\n]+)\$/g, (_, math) => {
    return `<code class="px-1.5 py-0.5 rounded bg-surface/80 border border-border text-amber-300 text-[0.85em] font-mono">${math}</code>`
  })

  // 4. Links: [text](url) - handle before bold/italic so URL underscores/asterisks aren't touched
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, linkText, url) => {
    const isInternal = url.startsWith('/') || url.startsWith('#')
    if (isInternal) {
      return `<a href="${url}" class="text-accent underline hover:text-bright transition-colors font-medium">${linkText}</a>`
    }
    return `<a href="${url}" class="text-accent underline hover:text-bright transition-colors font-medium inline-flex items-center gap-0.5" target="_blank" rel="noopener noreferrer">${linkText}</a>`
  })

  // 5. Bold: **text** (strict matching so internal underscores or flags don't break)
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-bright font-semibold">$1</strong>')

  // 6. Italic: *text* (word boundary / whitespace aware to avoid breaking math or variable names like a_b_c)
  escaped = escaped.replace(/(^|[\s(>])\*([^*\n]+)\*([)\s<.,:;!?]|$)/g, '$1<em class="text-dim italic">$2</em>$3')

  // 7. Strikethrough: ~~text~~
  escaped = escaped.replace(/~~([^~]+)~~/g, '<del class="text-subtle line-through">$1</del>')

  // 8. Restore protected code spans with styling and HTML escaping
  escaped = escaped.replace(/\uE000CODE_(\d+)\uE001/g, (_, idx) => {
    const rawCode = codeSpans[Number(idx)] ?? ''
    const escapedCode = escapeHtml(rawCode)
    return `<code class="px-1.5 py-0.5 rounded bg-surface/90 border border-border text-accent text-[0.85em] font-mono selection:bg-accent/20">${escapedCode}</code>`
  })

  return escaped
}

export function parseMarkdownDocument(markdown: string): BlockNode[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: BlockNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // 1. Skip empty lines
    if (!trimmed) {
      i++
      continue
    }

    // 2. Fenced code block (```lang ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++ // consume closing ```
      }
      blocks.push({
        type: 'code',
        lang,
        code: codeLines.join('\n'),
      })
      continue
    }

    // 3. Headings
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).trim()
      blocks.push({ type: 'h2', text, id: slugifyHeading(text) })
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).trim()
      blocks.push({ type: 'h3', text, id: slugifyHeading(text) })
      i++
      continue
    }
    if (trimmed.startsWith('#### ')) {
      const text = trimmed.slice(5).trim()
      blocks.push({ type: 'h4', text, id: slugifyHeading(text) })
      i++
      continue
    }

    // 4. Tables (header row with |, next row with | --- |)
    if (
      trimmed.startsWith('|') &&
      trimmed.endsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].includes('---')
    ) {
      const parseRow = (r: string) =>
        r
          .split('|')
          .slice(1, -1)
          .map(cell => cell.trim())

      const headers = parseRow(trimmed)
      i += 2 // skip header and separator row
      const rows: string[][] = []

      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        rows.push(parseRow(lines[i].trim()))
        i++
      }

      blocks.push({
        type: 'table',
        headers,
        rows,
      })
      continue
    }

    // 5. Blockquotes / Callouts (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleanLine = lines[i].trim().replace(/^>\s?/, '')
        if (cleanLine) {
          quoteLines.push(cleanLine)
        }
        i++
      }

      const firstLine = quoteLines[0] || ''
      let calloutType: 'note' | 'warning' | 'security' | 'tip' | 'quote' = 'quote'

      if (firstLine.startsWith('[!WARNING]') || firstLine.startsWith('[!CAUTION]')) {
        calloutType = 'warning'
        quoteLines[0] = firstLine.replace(/\[!(WARNING|CAUTION)\]/, '').trim()
      } else if (firstLine.startsWith('[!SECURITY]')) {
        calloutType = 'security'
        quoteLines[0] = firstLine.replace('[!SECURITY]', '').trim()
      } else if (firstLine.startsWith('[!TIP]')) {
        calloutType = 'tip'
        quoteLines[0] = firstLine.replace('[!TIP]', '').trim()
      } else if (firstLine.startsWith('[!NOTE]') || firstLine.startsWith('[!INFO]')) {
        calloutType = 'note'
        quoteLines[0] = firstLine.replace(/\[!(NOTE|INFO)\]/, '').trim()
      }

      blocks.push({
        type: 'callout',
        calloutType,
        lines: quoteLines.filter(Boolean),
      })
      continue
    }

    // 6. Unordered lists (- item or * item)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // 7. Ordered lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // 8. Paragraphs: accumulate lines until blank line, heading, code block, table, blockquote, or list
    const pLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !(
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|') &&
        i + 1 < lines.length &&
        lines[i + 1].includes('---')
      )
    ) {
      pLines.push(lines[i].trim())
      i++
    }

    if (pLines.length > 0) {
      blocks.push({
        type: 'p',
        text: pLines.join(' '),
      })
    }
  }

  return blocks
}
