import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import TextStats from '../../ui/TextStats'
import ToggleGroup from '../../ui/ToggleGroup'
import { capitalize, toWords } from '../../../utils/text'

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab'

const CASE_OPTIONS: { value: CaseMode; label: string }[] = [
  { value: 'upper', label: 'UPPERCASE' },
  { value: 'lower', label: 'lowercase' },
  { value: 'title', label: 'Title Case' },
  { value: 'sentence', label: 'Sentence case' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
]

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

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between uppercase, lowercase, camelCase, snake_case and more"
      tag="text"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={CASE_OPTIONS} value={mode} onChange={setMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label="Input"
            value={input}
            onChange={setInput}
            className="textarea-base h-48"
            placeholder="Paste any text, variable name, slug, or sentence..."
            footer={<TextStats value={input} wordCount={toWords(input).length} />}
          />

          <div>
            <OutputPanel
              label="Converted output"
              value={output}
              placeholder="Converted text will appear here..."
              heightClass="h-48"
              surface="surface"
            />

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <StatCard label="Active mode" value={CASE_OPTIONS.find(option => option.value === mode)?.label} />
              <StatCard label="Output length" value={`${output.length} chars`} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
