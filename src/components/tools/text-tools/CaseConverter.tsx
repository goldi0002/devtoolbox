import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab'

const CASE_OPTIONS: { mode: CaseMode; label: string }[] = [
  { mode: 'upper', label: 'UPPERCASE' },
  { mode: 'lower', label: 'lowercase' },
  { mode: 'title', label: 'Title Case' },
  { mode: 'sentence', label: 'Sentence case' },
  { mode: 'camel', label: 'camelCase' },
  { mode: 'pascal', label: 'PascalCase' },
  { mode: 'snake', label: 'snake_case' },
  { mode: 'kebab', label: 'kebab-case' },
]

function toWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

function capitalize(word: string): string {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function sentenceCase(input: string): string {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return ''

  return normalized.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, match => match.toUpperCase())
}

function convertCase(input: string, mode: CaseMode): string {
  const words = toWords(input)

  switch (mode) {
    case 'upper':
      return input.toUpperCase()
    case 'lower':
      return input.toLowerCase()
    case 'title':
      return words.map(capitalize).join(' ')
    case 'sentence':
      return sentenceCase(input)
    case 'camel':
      return words.map((word, index) => index === 0 ? word.toLowerCase() : capitalize(word)).join('')
    case 'pascal':
      return words.map(capitalize).join('')
    case 'snake':
      return words.map(word => word.toLowerCase()).join('_')
    case 'kebab':
      return words.map(word => word.toLowerCase()).join('-')
    default:
      return input
  }
}

export default function CaseConverter() {
  const [input, setInput] = useState('hello world from toolbox4devs')
  const [mode, setMode] = useState<CaseMode>('camel')

  const output = useMemo(() => convertCase(input, mode), [input, mode])
  const wordCount = useMemo(() => toWords(input).length, [input])

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between uppercase, lowercase, camelCase, snake_case and more"
      tag="text"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {CASE_OPTIONS.map(option => (
            <button
              key={option.mode}
              onClick={() => setMode(option.mode)}
              className={mode === option.mode ? 'btn-primary' : 'btn-ghost'}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">Input</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="textarea-base h-48"
              placeholder="Paste any text, variable name, slug, or sentence..."
              spellCheck={false}
            />
            <div className="mt-2 flex gap-4 text-[10px] font-mono text-subtle">
              <span>{input.length} chars</span>
              <span>{wordCount} words</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">Converted output</label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="bg-surface border border-border rounded px-3 py-2 h-48 overflow-auto">
              {output ? (
                <pre className="text-xs font-mono text-light whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <span className="text-xs font-mono text-subtle">Converted text will appear here...</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Active mode</div>
                <div className="text-bright">{CASE_OPTIONS.find(option => option.mode === mode)?.label}</div>
              </div>
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Output length</div>
                <div className="text-bright">{output.length} chars</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
