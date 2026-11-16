import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import {
  ALPHABET_PRESETS,
  NANOID_DEFAULT_LENGTH,
  NANOID_MAX_COUNT,
  NANOID_MAX_LENGTH,
  NANOID_MIN_LENGTH,
  clampCount,
  clampLength,
  entropyBits,
  generateNanoIds,
  validateAlphabet,
} from '../../../utils/nanoIdGenerator'

const CUSTOM = 'custom'

export default function NanoIdGenerator() {
  const [presetId, setPresetId] = useState<string>(ALPHABET_PRESETS[0].id)
  const [customAlphabet, setCustomAlphabet] = useState('abcdef123456')
  const [length, setLength] = useState(NANOID_DEFAULT_LENGTH)
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>([])

  const alphabet = presetId === CUSTOM ? customAlphabet : ALPHABET_PRESETS.find((p) => p.id === presetId)!.alphabet
  const alphabetError = validateAlphabet(alphabet)
  const alphabetSize = new Set(Array.from(alphabet)).size
  const bits = Math.round(entropyBits(alphabetSize, length))

  const generate = () => {
    if (alphabetError) return
    setIds(generateNanoIds(alphabet, length, count))
  }

  return (
    <ToolLayout
      title="NanoID Generator"
      description="Generate compact, URL-friendly random IDs with a custom length and alphabet, in your browser."
      tag="generate"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="nanoid-alphabet" className="block text-xs text-dim font-mono mb-1.5">Alphabet</label>
            <select
              id="nanoid-alphabet"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="input-base"
            >
              {ALPHABET_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
              <option value={CUSTOM}>Custom…</option>
            </select>
          </div>
          <div>
            <label htmlFor="nanoid-length" className="block text-xs text-dim font-mono mb-1.5">
              Length ({NANOID_MIN_LENGTH}–{NANOID_MAX_LENGTH})
            </label>
            <input
              id="nanoid-length"
              type="number"
              min={NANOID_MIN_LENGTH}
              max={NANOID_MAX_LENGTH}
              value={length}
              onChange={(e) => setLength(clampLength(Number(e.target.value)))}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="nanoid-count" className="block text-xs text-dim font-mono mb-1.5">How many (1–{NANOID_MAX_COUNT})</label>
            <input
              id="nanoid-count"
              type="number"
              min={1}
              max={NANOID_MAX_COUNT}
              value={count}
              onChange={(e) => setCount(clampCount(Number(e.target.value)))}
              className="input-base"
            />
          </div>
        </div>

        {presetId === CUSTOM && (
          <div>
            <label htmlFor="nanoid-custom" className="block text-xs text-dim font-mono mb-1.5">Custom alphabet</label>
            <input
              id="nanoid-custom"
              value={customAlphabet}
              onChange={(e) => setCustomAlphabet(e.target.value)}
              spellCheck={false}
              className="input-base"
            />
          </div>
        )}

        {alphabetError ? (
          <div role="alert">
            <ErrorBanner message={alphabetError} />
          </div>
        ) : (
          <p className="text-xs font-mono text-subtle">
            {alphabetSize} characters × {length} = about {bits} bits of randomness per ID
          </p>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={generate} disabled={Boolean(alphabetError)} className="btn-primary disabled:opacity-50">
            Generate {count === 1 ? 'ID' : `${count} IDs`}
          </button>
          {ids.length > 0 && (
            <button type="button" onClick={() => setIds([])} className="btn-ghost">Clear</button>
          )}
        </div>

        {ids.length > 0 && (
          <div className="border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
              <span className="text-xs text-subtle font-mono">{ids.length} {ids.length === 1 ? 'ID' : 'IDs'}</span>
              <CopyButton text={ids.join('\n')} />
            </div>
            <ul aria-label="Generated IDs" className="max-h-72 overflow-y-auto">
              {ids.map((id, i) => (
                <li key={`${id}-${i}`} className="flex items-center justify-between gap-2 px-4 py-1.5 border-b border-border/50 last:border-b-0">
                  <span data-testid="nanoid-value" className="font-mono text-xs text-bright break-all">{id}</span>
                  <CopyButton text={id} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
