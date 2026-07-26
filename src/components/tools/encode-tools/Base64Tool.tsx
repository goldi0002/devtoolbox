import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

function convert(value: string, mode: 'encode' | 'decode'): string {
  return mode === 'encode'
    ? btoa(unescape(encodeURIComponent(value)))
    : decodeURIComponent(escape(atob(value)))
}

function failureMessage(mode: 'encode' | 'decode'): string {
  return mode === 'encode' ? 'Encoding failed' : 'Invalid Base64 string'
}

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = (m: 'encode' | 'decode') => {
    setMode(m)
    setError('')
    if (!input.trim()) return

    try {
      setOutput(convert(input, m))
    } catch {
      setError(failureMessage(m))
      setOutput('')
    }
  }

  const handleInput = (val: string) => {
    setInput(val)
    setError('')
    if (!val.trim()) { setOutput(''); return }
    try {
      setOutput(convert(val, mode))
    } catch {
      setError(failureMessage(mode))
      setOutput('')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const swap = () => {
    if (output) {
      setInput(output)
      const newMode = mode === 'encode' ? 'decode' : 'encode'
      setMode(newMode)
      setError('')
      try {
        setOutput(convert(output, newMode))
      } catch {
        setError(failureMessage(newMode))
        setOutput('')
      }
    }
  }

  return (
    <ToolLayout
      title="Base64 Encoder / Decoder"
      description="Encode or decode Base64 strings in the browser"
      tag="encode"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => process('encode')}
            className={mode === 'encode' ? 'btn-primary' : 'btn-ghost'}
          >Encode</button>
          <button
            onClick={() => process('decode')}
            className={mode === 'decode' ? 'btn-primary' : 'btn-ghost'}
          >Decode</button>
          {output && (
            <button onClick={swap} className="btn-ghost">⇅ Swap</button>
          )}
          <button onClick={clear} className="btn-ghost ml-auto">Clear</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">
              {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
            </label>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              className="textarea-base h-36"
              placeholder={mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='}
              spellCheck={false}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="bg-[#f8f8f8] border border-border rounded px-3 py-2 h-36 overflow-auto">
              {error ? (
                <span className="text-xs font-mono text-subtle">⚠ {error}</span>
              ) : output ? (
                <pre className="text-xs font-mono text-light whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <span className="text-xs font-mono text-subtle">Output will appear here...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
