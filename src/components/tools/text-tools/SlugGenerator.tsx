import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import TextStats from '../../ui/TextStats'
import TipsCard from '../../ui/TipsCard'
import ToggleGroup from '../../ui/ToggleGroup'
import { stripDiacritics } from '../../../utils/text'

type SlugStyle = 'kebab' | 'snake'

const SLUG_STYLES = [
  { value: 'kebab' as const, label: 'kebab-case' },
  { value: 'snake' as const, label: 'snake_case' },
]

function buildSlug(input: string, style: SlugStyle, keepNumbers: boolean): string {
  const normalized = stripDiacritics(input)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s_-]/g, ' ')

  const withoutNumbers = keepNumbers ? normalized : normalized.replace(/[0-9]/g, ' ')
  const separator = style === 'kebab' ? '-' : '_'

  return withoutNumbers
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`\\${separator}{2,}`, 'g'), separator)
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '')
}

export default function SlugGenerator() {
  const [input, setInput] = useState('10 Tips for Building Fast Client-Side Tools in 2026')
  const [style, setStyle] = useState<SlugStyle>('kebab')
  const [keepNumbers, setKeepNumbers] = useState(true)

  const output = useMemo(
    () => buildSlug(input, style, keepNumbers),
    [input, style, keepNumbers]
  )

  return (
    <ToolLayout
      title="Slug Generator"
      description="Turn titles, headings, and labels into clean URL or key-friendly slugs"
      tag="text"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label="Source text"
            value={input}
            onChange={setInput}
            className="textarea-base h-44"
            placeholder="Paste a blog title, category name, or page heading..."
            footer={<TextStats value={input} />}
          />

          <div>
            <OutputPanel
              label="Generated slug"
              value={output}
              placeholder="Your slug will appear here..."
              heightClass="h-44"
              surface="surface"
            />

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <StatCard label="Separator" value={style === 'kebab' ? 'Hyphen (-)' : 'Underscore (_)'} />
              <StatCard label="Length" value={`${output.length} chars`} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={SLUG_STYLES} value={style} onChange={setStyle} />
          <button onClick={() => setKeepNumbers(v => !v)} className={keepNumbers ? 'btn-primary' : 'btn-ghost'}>
            {keepNumbers ? 'Keeping numbers' : 'Removing numbers'}
          </button>
        </div>

        <TipsCard
          title="What it does"
          items={[
            'Lowercases text and removes accent marks for cleaner URLs.',
            'Replaces spaces and punctuation with a single separator.',
            'Trims duplicate separators from the beginning, middle, and end.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}
