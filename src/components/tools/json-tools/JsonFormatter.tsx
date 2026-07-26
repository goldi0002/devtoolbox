import { useState, useEffect, useCallback } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import { tools } from '../../../tools/registry'
import { useHashData } from '../../../hooks/useHashData'
import { JsonDataShare } from '../../../types/share'
import { getErrorMessage } from '../../../utils/errors'
import { Sparkles, ArrowDownAZ, Braces, Minimize2, Wrench } from 'lucide-react'

const SAMPLE = `{
  "name": "DevUtils",
  "version": "2.0.0",
  "isClientOnly": true,
  "features": [
    "JSON Formatter",
    "Base64 Encoder",
    "JWT Decoder",
    "Regex Tester"
  ],
  "settings": {
    "theme": "dark",
    "indent": 2,
    "privacy": "100% Client-Side Local Storage"
  }
}`

// Deep recursive key sorting
const sortObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortObjectKeys(obj[key])
        return acc
      }, {})
  }
  return obj
}

// Attempt to auto-repair common relaxed JSON errors (trailing commas, single quotes, unquoted keys)
const autoRepairJson = (str: string): string => {
  return str
    .replace(/,\s*([\]}])/g, '$1') // Trailing commas
    .replace(/'/g, '"')            // Single quotes to double
    .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":') // Unquoted keys
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indent, setIndent] = useState<number | '\t'>(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const meta = tools.find(t => t.slug === 'json-formatter')

  useHashData<JsonDataShare>((value) => {
    if (value.input && typeof value.input === 'string') {
      setInput(value.input)
      if (value.meta?.mode === 'minify') setMode('minify')
    }
  })
  const handleProcess = useCallback((m: 'format' | 'minify' = mode, currentInput = input) => {
    setMode(m)
    setError('')
    if (!currentInput.trim()) {
      setOutput('')
      setIsValid(true)
      return
    }

    try {
      let parsed = JSON.parse(currentInput)
      if (sortKeys) {
        parsed = sortObjectKeys(parsed)
      }

      if (m === 'minify') {
        setOutput(JSON.stringify(parsed))
      } else {
        setOutput(JSON.stringify(parsed, null, indent))
      }
      setIsValid(true)
    } catch (e) {
      setIsValid(false)
      setError(getErrorMessage(e, 'Invalid JSON syntax'))
    }
  }, [input, mode, indent, sortKeys])

  const handleFixAndFormat = () => {
    const repaired = autoRepairJson(input)
    setInput(repaired)
    handleProcess('format', repaired)
  }

  useEffect(() => {
    handleProcess(mode, input)
  }, [input, mode, indent, sortKeys, handleProcess])

  const getShareData = (): JsonDataShare => ({
    input,
    output,
    tool: {
      name: meta?.name || 'JSON Formatter',
      description: meta?.description || 'Format, validate, or minify JSON data on the client.',
      category: meta?.category || 'utility',
      slug: meta?.slug || 'json-formatter',
      url: window.location.origin + window.location.pathname,
    },
    meta: {
      mode,
      createdAt: Date.now(),
    },
  })

  return (
    <ToolLayout
      title={meta?.name || 'JSON Formatter & Beautifier'}
      description={meta?.description || 'Format, validate, repair, and minify JSON data with instant client-side execution.'}
      tag="json"
    >
      <div className="space-y-5">
        {/* Toolbar & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleProcess('format')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'format'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-muted/40 hover:bg-muted text-bright'
              }`}
            >
              <Braces size={14} />
              Format / Beautify
            </button>

            <button
              onClick={() => handleProcess('minify')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'minify'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-muted/40 hover:bg-muted text-bright'
              }`}
            >
              <Minimize2 size={14} />
              Minify
            </button>

            <button
              onClick={() => setSortKeys(!sortKeys)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                sortKeys
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-muted/40 hover:bg-muted text-dim hover:text-bright'
              }`}
            >
              <ArrowDownAZ size={14} />
              Sort Keys {sortKeys ? '(On)' : ''}
            </button>

            {!isValid && (
              <button
                onClick={handleFixAndFormat}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5"
                title="Attempt to fix trailing commas and quotes"
              >
                <Wrench size={14} />
                Auto-Repair JSON
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Indent Selector */}
            {mode === 'format' && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-dim">
                <span>Indent:</span>
                <select
                  value={String(indent)}
                  onChange={(e) => {
                    const val = e.target.value
                    setIndent(val === '\t' ? '\t' : Number(val))
                  }}
                  className="bg-muted/50 border border-border rounded px-2 py-1 text-bright text-xs font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="2">2 Spaces</option>
                  <option value="4">4 Spaces</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Input Editor */}
        <CodeInput
          value={input}
          onChange={setInput}
          language="json"
          label="JSON Input"
          placeholder="Paste or drop JSON here..."
          minHeight="240px"
          sampleValue={SAMPLE}
          sampleLabel="Load Sample JSON"
        />

        {/* Error Display */}
        {!isValid && <ErrorBanner message={error} />}

        {/* Output Panel */}
        {isValid && output && (
          <CodeBlock
            code={output}
            language="json"
            label={mode === 'format' ? 'formatted.json' : 'minified.json'}
            status="ready"
            minHeight="280px"
            maxHeight="500px"
            shareTool={getShareData()}
          />
        )}
      </div>
    </ToolLayout>
  )
}

