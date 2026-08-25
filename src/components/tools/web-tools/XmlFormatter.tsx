import { useState } from 'react'
import formatXml from 'xml-formatter'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import { getErrorMessage } from '../../../utils/errors'

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><root><item id="1"><name>Apple</name><color>Red</color></item><item id="2"><name>Banana</name><color>Yellow</color></item></root>`

export default function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indentSize, setIndentSize] = useState(2)

  const process = (m: 'format' | 'minify') => {
    setMode(m)
    setError('')
    const src = input || SAMPLE
    if (!src.trim()) return

    try {
      if (m === 'format') {
        const formatted = formatXml(src, {
          indentation: ' '.repeat(indentSize),
          collapseContent: true,
          lineSeparator: '\n'
        })
        setOutput(formatted)
      } else {
        const minified = formatXml(src, {
          indentation: '',
          collapseContent: true,
          lineSeparator: ''
        })
        setOutput(minified)
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to process XML'))
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
      title="XML Formatter"
      description="Format, beautify or minify XML strings"
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
              value={indentSize}
              onChange={e => setIndentSize(Number(e.target.value))}
              className="input-base w-16 py-1 text-xs"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>

          <button
            onClick={() => { setInput(SAMPLE); setTimeout(() => process('format'), 100); }}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-4"
          >
            ← example
          </button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">XML Input</label>
          <CodeBlock
            code={input}
            language="xml"
            label="input.xml"
            maxHeight="300px"
            minHeight="300px"
            isForInput={true}
            readOnly={false}
            onChange={value => setInput(value)}
          />
        </div>

        <ErrorBanner message={error} />

        {output && (
          <CodeBlock
            code={output}
            language="xml"
            label={mode === 'format' ? 'formatted.xml' : 'minified.xml'}
            maxHeight="300px"
            minHeight="300px"
          />
        )}
      </div>
    </ToolLayout>
  )
}
