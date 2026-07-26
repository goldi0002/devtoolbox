import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import TipsCard from '../../ui/TipsCard'
import ToggleGroup from '../../ui/ToggleGroup'

type Mode = 'encode' | 'decode'

const MODES = [
  { value: 'encode' as const, label: 'Encode' },
  { value: 'decode' as const, label: 'Decode' },
]

const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  ' ': '&nbsp;',
}

function encodeHtml(value: string, preserveSpaces: boolean): string {
  return Array.from(value).map((char) => {
    if (char === ' ' && !preserveSpaces) return char
    if (NAMED_ENTITIES[char]) return NAMED_ENTITIES[char]

    const codePoint = char.codePointAt(0)
    if (!codePoint) return char
    if (codePoint > 126) return `&#${codePoint};`
    return char
  }).join('')
}

function decodeHtml(value: string): string {
  if (typeof document === 'undefined') return value
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

export default function HtmlEntityTool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [preserveSpaces, setPreserveSpaces] = useState(false)
  const [input, setInput] = useState('<button class="cta">Tom & Jerry\'s Café</button>')

  const output = useMemo(() => (
    mode === 'encode' ? encodeHtml(input, preserveSpaces) : decodeHtml(input)
  ), [input, mode, preserveSpaces])

  const entityCount = useMemo(() => (output.match(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi) ?? []).length, [output])

  return (
    <ToolLayout
      title="HTML Entity Encoder"
      description="Escape special characters for HTML or decode entity strings back into plain text"
      tag="encode"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={MODES} value={mode} onChange={setMode} />
          {mode === 'encode' && (
            <button onClick={() => setPreserveSpaces(v => !v)} className={preserveSpaces ? 'btn-primary ml-auto' : 'btn-ghost ml-auto'}>
              {preserveSpaces ? 'Spaces → &nbsp;' : 'Keep spaces plain'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label="Input"
            value={input}
            onChange={setInput}
            className="textarea-base h-56"
            placeholder={mode === 'encode' ? 'Paste plain text or HTML here...' : 'Paste encoded HTML entities here...'}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">Output</label>
              <CopyButton text={output} disabled={!output} />
            </div>
            <textarea value={output} readOnly className="textarea-base h-56" spellCheck={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <StatCard label="Mode" value={mode} valueClassName="capitalize" />
          <StatCard label="Chars" value={output.length} />
          <StatCard label="Entities" value={entityCount} />
        </div>

        <TipsCard
          title="Useful for"
          items={[
            'Escaping example markup in blog posts, docs, and support replies.',
            'Decoding entity-heavy output copied from editors or rendered templates.',
            'Inspecting how quotes, ampersands, angle brackets, and unicode characters are represented.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}
