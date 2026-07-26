import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import { decodeBase64, encodeBase64 } from '../../../utils/encoding'

type Mode = 'encode' | 'decode'

const MODES = [
  { value: 'encode' as const, label: 'Encode' },
  { value: 'decode' as const, label: 'Decode' },
]

function convert(value: string, mode: Mode): string {
  return mode === 'encode' ? encodeBase64(value) : decodeBase64(value)
}

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('encode')

  const process = (m: Mode) => {
    setMode(m)
    setError('')
    if (!input.trim()) return

    try {
      setOutput(convert(input, m))
    } catch {
      setError(m === 'encode' ? 'Encoding failed' : 'Invalid Base64 string')
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
      setOutput('')
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
    const newMode: Mode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    try {
      setOutput(convert(output, newMode))
    } catch {
      setOutput('')
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
          <ToggleGroup options={MODES} value={mode} onChange={process} />
          {output && (
            <button onClick={swap} className="btn-ghost">⇅ Swap</button>
          )}
          <button onClick={clear} className="btn-ghost ml-auto">Clear</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label={mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
            value={input}
            onChange={handleInput}
            placeholder={mode === 'encode' ? 'Hello, World!' : 'SGVsbG8sIFdvcmxkIQ=='}
          />

          <OutputPanel
            label={mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
            value={output}
            error={error}
          />
        </div>
      </div>
    </ToolLayout>
  )
}
