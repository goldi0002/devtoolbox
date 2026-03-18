import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import CodeInput from '../../CodeInput'

type ListContext = {
  type: 'ul' | 'ol'
  items: string[]
}

const SAMPLE_MARKDOWN = `# Markdown Preview

Write Markdown on the left and get a live preview on the right.

## Features

- Headings, emphasis, and links
- Ordered and unordered lists
- Blockquotes and fenced code blocks
- Tables and inline code
- Fully client-side rendering

## Example table

| Tool | Runs where? |
| --- | --- |
| JSON Formatter | Browser |
| Markdown Preview | Browser |

> Nothing leaves your device.

1. Paste text
2. Review the preview
3. Copy the generated HTML

    npm run build
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseInline(markdown: string): string {
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

function tableRowToCells(row: string, tag: 'th' | 'td'): string {
  return row
    .split('|')
    .slice(1, -1)
    .map(cell => `<${tag}>${parseInline(cell.trim())}</${tag}>`)
    .join('')
}

function renderTable(lines: string[], startIndex: number): { html: string; nextIndex: number } | null {
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

  const body = rows.map(row => `<tr>${tableRowToCells(row, 'td')}</tr>`).join('')

  return {
    html: `<table><thead><tr>${tableRowToCells(header, 'th')}</tr></thead>${body ? `<tbody>${body}</tbody>` : ''}</table>`,
    nextIndex: index,
  }
}

function renderMarkdown(markdown: string): string {
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
    html.push(`<p>${parseInline(paragraph.join(' ').trim())}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    html.push(`<${list.type}>${list.items.map(item => `<li>${item}</li>`).join('')}</${list.type}>`)
    list = null
  }

  const flushBlockquote = () => {
    if (!blockquote.length) return
    html.push(`<blockquote>${blockquote.map(line => `<p>${parseInline(line)}</p>`).join('')}</blockquote>`)
    blockquote = []
  }

  const flushCode = () => {
    if (!inCodeBlock) return
    const langClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ''
    html.push(`<pre><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
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

    const table = renderTable(lines, index)
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
      html.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`)
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
      list.items.push(parseInline(unorderedMatch[1]))
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
      list.items.push(parseInline(orderedMatch[1]))
      continue
    }

    const hrMatch = /^(---|\*\*\*|___)$/.exec(trimmed)
    if (hrMatch) {
      flushParagraph()
      flushList()
      flushBlockquote()
      html.push('<hr />')
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

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN)

  const renderedHtml = useMemo(() => renderMarkdown(input), [input])
  const stats = useMemo(() => {
    const lines = input ? input.split(/\r?\n/).length : 0
    const words = input.trim() ? input.trim().split(/\s+/).length : 0
    const characters = input.length
    return { lines, words, characters }
  }, [input])

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write Markdown and inspect a live HTML preview without leaving the browser"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setInput(SAMPLE_MARKDOWN)} className="btn-primary">Load sample</button>
          <button onClick={() => setInput('')} className="btn-ghost">Clear</button>
          <div className="ml-auto flex flex-wrap gap-2 text-[10px] font-mono text-subtle uppercase tracking-[0.16em]">
            <span>{stats.lines} lines</span>
            <span>{stats.words} words</span>
            <span>{stats.characters} chars</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="space-y-3">
            <CodeInput
              value={input}
              onChange={setInput}
              language="markdown"
              label="Markdown input"
              placeholder="# Hello\n\nWrite some markdown..."
              minHeight="420px"
              maxHeight="720px"
            />
          </div>

          <div className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden bg-surface">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <div className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em]">Live preview</div>
                  <div className="text-xs font-sans text-dim mt-1">Rendered client-side from your Markdown input.</div>
                </div>
              </div>
              <div className="markdown-preview prose-none max-w-none p-5 min-h-[420px] overflow-auto">
                {renderedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                ) : (
                  <p className="text-sm font-mono text-subtle">Preview output will appear here.</p>
                )}
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-surface">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3">
                <div>
                  <div className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em]">Generated HTML</div>
                  <div className="text-xs font-sans text-dim mt-1">Copy the rendered markup for docs, prototypes, or emails.</div>
                </div>
                <CopyButton text={renderedHtml} />
              </div>
              <pre className="p-4 text-xs font-mono text-bright whitespace-pre-wrap break-words max-h-[280px] overflow-auto">{renderedHtml || '<!-- HTML output will appear here -->'}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
