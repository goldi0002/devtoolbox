import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import CodeInput from '../../CodeInput'
import { renderMarkdown } from '../../../utils/markdown'

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
