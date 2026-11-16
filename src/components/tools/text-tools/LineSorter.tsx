import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import TextStats from '../../ui/TextStats'
import ToggleGroup from '../../ui/ToggleGroup'
import { countWords } from '../../../utils/text'
import { processLines, type SortMode } from '../../../utils/lineSorter'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'asc', label: 'A → Z' },
  { value: 'desc', label: 'Z → A' },
  { value: 'length', label: 'By Length' },
  { value: 'natural', label: 'Natural' },
]

const SAMPLE = `banana
Apple
cherry
apple
Banana
date
cherry
elderberry

date`

export default function LineSorter() {
  const [input, setInput] = useState(SAMPLE)
  const [mode, setMode] = useState<SortMode>('asc')
  const [removeDuplicates, setRemoveDuplicates] = useState(true)
  const [trimLines, setTrimLines] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [caseInsensitive, setCaseInsensitive] = useState(true)

  const result = useMemo(
    () => processLines(input, { mode, removeDuplicates, trimLines, removeEmpty, caseInsensitive }),
    [input, mode, removeDuplicates, trimLines, removeEmpty, caseInsensitive]
  )

  const inputLines = input.split('\n')
  const outputLines = result ? result.split('\n') : []
  const removedCount = inputLines.length - outputLines.length

  return (
    <ToolLayout
      title="Line Sorter & Deduplicator"
      description="Sort lines alphabetically, by length, or naturally — remove duplicates and empty lines instantly"
      tag="text"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={SORT_OPTIONS} value={mode} onChange={setMode} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-dim">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={e => setRemoveDuplicates(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Remove duplicates
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-dim">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={e => setTrimLines(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Trim whitespace
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-dim">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={e => setRemoveEmpty(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Remove empty lines
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-dim">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={e => setCaseInsensitive(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Case-insensitive
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label="Input lines"
            value={input}
            onChange={setInput}
            className="textarea-base h-64"
            placeholder="Paste one item per line..."
            footer={<TextStats value={input} wordCount={countWords(input)} />}
          />

          <div>
            <OutputPanel
              label="Sorted output"
              value={result}
              placeholder="Sorted lines will appear here..."
              heightClass="h-64"
              surface="surface"
            />

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono">
              <StatCard label="Input lines" value={inputLines.length} />
              <StatCard label="Output lines" value={outputLines.length} />
              <StatCard label="Removed" value={Math.max(0, removedCount)} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
