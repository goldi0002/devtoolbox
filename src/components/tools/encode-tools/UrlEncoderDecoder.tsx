import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import { decodeUrl, encodeUrl, UrlEncodeType } from '../../../utils/encoding'
import { getErrorMessage } from '../../../utils/errors'

const SAMPLES = {
  encode: 'https://example.com/search?q=hello world&lang=en&tag=c# developer',
  decode: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26tag%3Dc%23%20developer',
}

type Mode = 'encode' | 'decode'
type EncodeType = UrlEncodeType

const MODES = [
  { value: 'encode' as const, label: 'Encode' },
  { value: 'decode' as const, label: 'Decode' },
]

function convert(value: string, mode: Mode, type: EncodeType): string {
  return mode === 'encode' ? encodeUrl(value, type) : decodeUrl(value)
}

export default function UrlEncoderDecoder() {
  const [input, setInput]           = useState('')
  const [output, setOutput]         = useState('')
  const [error, setError]           = useState('')
  const [mode, setMode]             = useState<Mode>('encode')
  const [encodeType, setEncodeType] = useState<EncodeType>('component')

  const process = (m: Mode, type = encodeType) => {
    setMode(m)
    setError('')
    const src = input || SAMPLES[m]
    if (!src.trim()) { setOutput(''); return }

    try {
      setOutput(convert(src, m, type))
    } catch (e) {
      setError(getErrorMessage(e, m === 'encode' ? 'Encoding failed' : 'Invalid URL encoding'))
      setOutput('')
    }
  }

  const handleInput = (val: string) => {
    setInput(val)
    setError('')
    if (!val.trim()) { setOutput(''); return }
    try {
      setOutput(convert(val, mode, encodeType))
    } catch (e) {
      setError(getErrorMessage(e, mode === 'encode' ? 'Encoding failed' : 'Invalid URL encoding'))
      setOutput('')
    }
  }

  const handleEncodeType = (t: EncodeType) => {
    setEncodeType(t)
    if (mode === 'encode' && input) {
      setError('')
      try {
        setOutput(convert(input, 'encode', t))
      } catch (e) {
        setError(getErrorMessage(e, 'Encoding failed'))
        setOutput('')
      }
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const swap = () => {
    if (!output) return
    setInput(output)
    setOutput('')
    const newMode: Mode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    setError('')
    try {
      setOutput(convert(output, newMode, encodeType))
    } catch (e) {
      setError(getErrorMessage(e, newMode === 'encode' ? 'Encoding failed' : 'Invalid URL encoding'))
      setOutput('')
    }
  }

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode or decode URLs and query string components"
      tag="encode"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <ToggleGroup options={MODES} value={mode} onChange={m => process(m)} />
          {output && (
            <button onClick={swap} className="btn-ghost">⇅ Swap</button>
          )}
          <button onClick={clear} className="btn-ghost">Clear</button>

          {/* Encode type toggle — only relevant for encoding */}
          {mode === 'encode' && (
            <div className="flex items-center gap-1 ml-auto border border-border rounded overflow-hidden">
              <button
                onClick={() => handleEncodeType('component')}
                className={`px-3 py-1.5 text-xs font-mono transition-all duration-150
                  ${encodeType === 'component'
                    ? 'bg-bright text-bg'
                    : 'text-dim hover:text-light'
                  }`}
              >
                encodeURIComponent
              </button>
              <button
                onClick={() => handleEncodeType('full')}
                className={`px-3 py-1.5 text-xs font-mono transition-all duration-150
                  ${encodeType === 'full'
                    ? 'bg-bright text-bg'
                    : 'text-dim hover:text-light'
                  }`}
              >
                encodeURI
              </button>
            </div>
          )}

          <button
            onClick={() => setInput(SAMPLES[mode])}
            className={`text-xs text-subtle hover:text-dim transition-colors font-mono ${mode === 'encode' ? '' : 'ml-auto'}`}
          >
            ← example
          </button>
        </div>

        {/* Encode type explanation */}
        {mode === 'encode' && (
          <div className="text-xs font-mono text-subtle bg-surface border border-border rounded px-3 py-2">
            {encodeType === 'component'
              ? 'encodeURIComponent — encodes everything including : / ? & = (use for query values)'
              : 'encodeURI — preserves URL structure characters like : / ? & = (use for full URLs)'
            }
          </div>
        )}

        {/* Input / Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label={mode === 'encode' ? 'Plain URL Input' : 'Encoded URL Input'}
            value={input}
            onChange={handleInput}
            placeholder={SAMPLES[mode]}
          />

          <OutputPanel
            label={mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
            value={output}
            error={error}
          />
        </div>

        {/* Character reference */}
        <div>
          <p className="text-xs font-mono text-subtle tracking-widest uppercase mb-2">
            Common Encodings
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { char: 'Space', encoded: '%20' },
              { char: '&',     encoded: '%26' },
              { char: '=',     encoded: '%3D' },
              { char: '+',     encoded: '%2B' },
              { char: '#',     encoded: '%23' },
              { char: '/',     encoded: '%2F' },
              { char: '?',     encoded: '%3F' },
              { char: '@',     encoded: '%40' },
            ].map(({ char, encoded }) => (
              <div
                key={char}
                className="card p-3 flex items-center justify-between gap-2"
              >
                <span className="font-mono text-sm text-bright">{char}</span>
                <span className="font-mono text-xs text-subtle">→</span>
                <span className="font-mono text-xs text-dim">{encoded}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}