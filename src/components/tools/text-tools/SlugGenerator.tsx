import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type SlugStyle = 'kebab' | 'snake'

function stripDiacritics(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}

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
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">Source text</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="textarea-base h-44"
              placeholder="Paste a blog title, category name, or page heading..."
              spellCheck={false}
            />
            <div className="mt-2 flex gap-4 text-[10px] font-mono text-subtle">
              <span>{input.length} chars</span>
              <span>{input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dim font-mono">Generated slug</label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="bg-surface border border-border rounded px-3 py-2 h-44 overflow-auto">
              {output ? (
                <pre className="text-xs font-mono text-light whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <span className="text-xs font-mono text-subtle">Your slug will appear here...</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Separator</div>
                <div className="text-bright">{style === 'kebab' ? 'Hyphen (-)' : 'Underscore (_)'}</div>
              </div>
              <div className="border border-border rounded px-3 py-2">
                <div className="text-subtle mb-1">Length</div>
                <div className="text-bright">{output.length} chars</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStyle('kebab')} className={style === 'kebab' ? 'btn-primary' : 'btn-ghost'}>
            kebab-case
          </button>
          <button onClick={() => setStyle('snake')} className={style === 'snake' ? 'btn-primary' : 'btn-ghost'}>
            snake_case
          </button>
          <button onClick={() => setKeepNumbers(v => !v)} className={keepNumbers ? 'btn-primary' : 'btn-ghost'}>
            {keepNumbers ? 'Keeping numbers' : 'Removing numbers'}
          </button>
        </div>

        <div className="border border-border rounded-lg p-4 bg-surface/50">
          <p className="text-[10px] font-mono text-subtle tracking-widest uppercase mb-2">What it does</p>
          <ul className="space-y-2 text-xs font-sans text-dim leading-relaxed">
            <li>• Lowercases text and removes accent marks for cleaner URLs.</li>
            <li>• Replaces spaces and punctuation with a single separator.</li>
            <li>• Trims duplicate separators from the beginning, middle, and end.</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
