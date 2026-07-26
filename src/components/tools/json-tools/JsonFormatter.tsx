import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import TextAreaField from '../../ui/TextAreaField'
import { tools } from '../../../tools/registry'
import { useHashData } from '../../../hooks/useHashData'
import { JsonDataShare } from '../../../types/share'
import { getErrorMessage } from '../../../utils/errors'
const SAMPLE = `{"name":"ToolBox4Devs","version":"1.0","tools":["JSON Formatter","JSON-Model","UUID Generator"],"config":{"theme":"dark","lang":"en"}}`

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  useHashData<JsonDataShare>((value) => {
    if (!value.input) {
      setError('No input data found')
      return;
    }
    if (typeof value.input !== 'string') {
      setError('Invalid input data')
      return;
    }
    setInput(value.input as string)
    try {
      const parsed = JSON.parse(value.input as string)
      setOutput(
        value.meta?.mode === 'minify'
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, 2)
      )
      setMode(value.meta?.mode === 'minify' ? 'minify' : 'format')
    } catch (e) {
      setError(getErrorMessage(e, 'Shared JSON could not be parsed'))
    }
  })
  const process = (m: 'format' | 'minify') => {
    setMode(m)
    setError('')
    const src = input || SAMPLE
    try {
      const parsed = JSON.parse(src)
      if (m === 'format') {
        setOutput(JSON.stringify(parsed, null, 2))
      } else {
        setOutput(JSON.stringify(parsed))
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Invalid JSON'))
      setOutput('')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }
  const meta = tools.find(t => t.slug === 'json-formatter');
  const getShareData = (): JsonDataShare => ({
    input,
    output,
    tool: {
      name: meta?.name || 'JSON Formatter',
      description: meta?.description || 'Format or minify JSON data with ease.',
      category: meta?.category || 'utility',
      slug: meta?.slug || 'json-formatter',
      url: window.location.origin + window.location.pathname,  // ← no hash
    },
    meta: {
      mode,
      createdAt: Date.now(),
    },
  })

  return (
    <ToolLayout
      title={meta?.name || 'JSON Formatter'}
      description={meta?.description || 'Format or minify JSON data with ease.'}
      tag="json"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => process('format')} className="btn-primary">Format</button>
          <button onClick={() => process('minify')} className="btn-ghost">Minify</button>
          <button onClick={clear} className="btn-ghost">Clear</button>
          <button
            onClick={() => setInput(SAMPLE)}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-auto"
          >
            ← example
          </button>
        </div>

        <TextAreaField
          label="JSON Input"
          value={input}
          onChange={setInput}
          placeholder={SAMPLE}
        />

        <ErrorBanner message={error} />

        {output && (
          <CodeBlock
            code={output}
            language="json"
            label={mode === 'format' ? 'formatted.json' : 'minified.json'}
            status="ready"
            minHeight='300px'
            maxHeight='300px'
            shareTool={getShareData()}
          />
        )}
      </div>
    </ToolLayout>
  )
}
