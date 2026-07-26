import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import { getErrorMessage } from '../../../utils/errors'

const SAMPLES = {
  encode: 'https://example.com/search?q=hello world&lang=en&tag=c# developer',
  decode: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den%26tag%3Dc%23%20developer',
}

type Mode = 'encode' | 'decode'
type EncodeType = 'full' | 'component'

function convert(value: string, mode: Mode, type: EncodeType): string {
  if (mode === 'encode') {
    // 'component' encodes everything including : / ? &, 'full' preserves URL structure chars
    return type === 'component' ? encodeURIComponent(value) : encodeURI(value)
  }
  try {
    return decodeURIComponent(value)
  } catch {
    // decodeURI tolerates sequences decodeURIComponent rejects; if it also
    // fails the error propagates to the caller instead of being swallowed.
    return decodeURI(value)
  }
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
          <button
            onClick={() => process('encode')}
            className={mode === 'encode' ? 'btn-primary' : 'btn-ghost'}
          >
            Encode
          </button>
          <button
            onClick={() => process('decode')}
            className={mode === 'decode' ? 'btn-primary' : 'btn-ghost'}
          >
            Decode
          </button>
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
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">
              {mode === 'encode' ? 'Plain URL Input' : 'Encoded URL Input'}
            </label>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              className="textarea-base h-36"
              placeholder={SAMPLES[mode]}
              spellCheck={false}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">
                {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
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