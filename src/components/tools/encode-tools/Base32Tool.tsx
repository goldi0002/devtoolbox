import { useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import ErrorBanner from '../../ui/ErrorBanner'
import { decodeBase32, encodeBase32 } from '../../../utils/base32'
import { getErrorMessage } from '../../../utils/errors'

type Mode = 'encode' | 'decode'

const MODES = [
  { value: 'encode' as const, label: 'Encode' },
  { value: 'decode' as const, label: 'Decode' },
]

function convert(input: string, mode: Mode, pad: boolean): { output: string; error: string } {
  if (!input) return { output: '', error: '' }
  try {
    return { output: mode === 'encode' ? encodeBase32(input, pad) : decodeBase32(input), error: '' }
  } catch (e) {
    return { output: '', error: getErrorMessage(e, 'Invalid Base32 input') }
  }
}

export default function Base32Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('encode')
  const [pad, setPad] = useState(true)

  const { output, error } = useMemo(() => convert(input, mode, pad), [input, mode, pad])

  const swap = () => {
    if (!output) return
    setInput(output)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  return (
    <ToolLayout
      title="Base32 Encoder / Decoder"
      description="Encode UTF-8 text to RFC 4648 Base32 or decode Base32 back to text, entirely in your browser."
      tag="encode"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-3 bg-surface border border-border rounded-xl">
          <ToggleGroup options={MODES} value={mode} onChange={setMode} />
          {mode === 'encode' && (
            <label className="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright cursor-pointer px-2 py-1 rounded bg-muted/40">
              <input
                type="checkbox"
                checked={pad}
                onChange={(e) => setPad(e.target.checked)}
                className="rounded border-border accent-indigo-500"
              />
              Add = padding
            </label>
          )}
          <button type="button" onClick={swap} disabled={!output} className="btn-ghost sm:ml-auto disabled:opacity-50">
            <ArrowLeftRight size={14} />
            Swap
          </button>
        </div>

        <TextAreaField
          label={mode === 'encode' ? 'Plain text' : 'Base32'}
          value={input}
          onChange={setInput}
          placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base32 such as MZXW6YTBOI======'}
        />

        {error && (
          <div role="alert">
            <ErrorBanner message={error} />
          </div>
        )}

        <OutputPanel
          label={mode === 'encode' ? 'Base32 output' : 'Decoded text'}
          value={output}
          placeholder="Result will appear here..."
        />
      </div>
    </ToolLayout>
  )
}
