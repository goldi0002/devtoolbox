import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'

const SAMPLE = `<div class="container"><h1>Hello World</h1><p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item one</li><li>Item two</li><li>Item three</li></ul></div>`

export default function HtmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [tabWidth, setTabWidth] = useState(2)

  const process = async (m: 'format' | 'minify') => {
    setMode(m)
    setError('')
    const src = input || SAMPLE
    if (!src.trim()) return

    try {
      if (m === 'format') {
        const prettier = await import('prettier')
        const parserHtml = await import('prettier/plugins/html')

        const formatted = await prettier.format(src, {
          parser:    'html',
          plugins:   [parserHtml],
          tabWidth,
          printWidth: 80,
        })
        setOutput(formatted)
      } else {
        const minified = src
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim()
        setOutput(minified)
      }
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout
      title="HTML Formatter"
      description="Format, beautify or minify HTML using Prettier"
      tag="web"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => process('format')} className="btn-primary">Format</button>
          <button onClick={() => process('minify')} className="btn-ghost">Minify</button>
          <button onClick={clear} className="btn-ghost">Clear</button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs font-mono text-subtle">indent</label>
            <select
              value={tabWidth}
              onChange={e => setTabWidth(Number(e.target.value))}
              className="input-base w-16 py-1 text-xs"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>

          <button
            onClick={() => setInput(SAMPLE)}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono"
          >
            ← example
          </button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">HTML Input</label>
          <CodeBlock
            code={input}
            language="html"
            label='input.html'
            maxHeight='300px'
            minHeight='300px'
            isForInput={true}
            readOnly={false}
            onChange={value => setInput(value)}
          />
          {/* <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="textarea-base h-36"
            placeholder={SAMPLE}
            spellCheck={false}
          /> */}
        </div>

        {error && (
          <div className="text-xs font-mono text-dim bg-surface border border-border rounded px-3 py-2">
            ⚠ {error}
          </div>
        )}

        {output && (
          <CodeBlock
            code={output}
            language="html"
            label={mode === 'format' ? 'formatted.html' : 'minified.html'}
            maxHeight='300px'
            minHeight='300px'
          />
        )}
      </div>
    </ToolLayout>
  )
}