import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import OutputPanel from '../../ui/OutputPanel'
import { markdownToHtml } from '../../../utils/markdown'

const SAMPLE_MARKDOWN = `# Release notes

Shipped **Markdown to HTML** with *clean* output and ~~old~~ new markup.

## Changes

- Raw HTML like <script> is escaped, never run
- Read the [docs](https://example.com/docs) or see the ![logo](https://example.com/logo.png)

| Item | Status |
| --- | --- |
| Tables | Done |
| Images | Done |

\`\`\`js
const greeting = 'hello'
\`\`\`

> Nothing leaves your browser.

1. Paste Markdown
2. Copy the HTML
`

export default function MarkdownToHtml() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN)
  const [inlineStyles, setInlineStyles] = useState(false)
  const [fullDocument, setFullDocument] = useState(false)

  const html = useMemo(
    () => markdownToHtml(input, { inlineStyles, fullDocument }),
    [input, inlineStyles, fullDocument],
  )

  return (
    <ToolLayout
      title="Markdown to HTML"
      description="Convert Markdown into clean, copy-ready HTML without leaving the browser"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setInput(SAMPLE_MARKDOWN)} className="btn-primary">Load sample</button>
          <button onClick={() => setInput('')} className="btn-ghost">Clear</button>
          <div className="ml-auto flex flex-wrap gap-4 text-xs font-sans text-dim">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inlineStyles}
                onChange={e => setInlineStyles(e.target.checked)}
              />
              Include inline styles
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fullDocument}
                onChange={e => setFullDocument(e.target.checked)}
              />
              Full HTML document
            </label>
          </div>
        </div>

        <CodeInput
          value={input}
          onChange={setInput}
          language="markdown"
          label="Markdown input"
          placeholder="# Hello\n\nWrite some Markdown..."
          minHeight="320px"
          maxHeight="600px"
        />

        <OutputPanel
          label="HTML output"
          value={html}
          language="html"
          placeholder="HTML output will appear here..."
          heightClass="min-h-[240px] max-h-[600px]"
        />
      </div>
    </ToolLayout>
  )
}
