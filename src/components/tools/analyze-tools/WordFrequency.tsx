import { useDeferredValue, useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import {
  TOP_N_OPTIONS,
  analyzeFrequency,
  formatPercent,
  limitRows,
  sortRows,
  toCsv,
  toPlainText,
  type FrequencyRow,
  type FrequencyTable,
  type SortDirection,
  type SortKey,
  type TopN,
} from '../../../utils/wordFrequency'

const SAMPLE = `The quick brown fox jumps over the lazy dog. The dog sleeps, and the fox runs.
Naïve café owners réservent la table — 你好，世界！ Привет, мир.`

const numberFormatter = new Intl.NumberFormat('en-US')

interface SortState {
  key: SortKey
  direction: SortDirection
}

const DEFAULT_SORT: SortState = { key: 'count', direction: 'desc' }

/** Column headers pick a sensible first direction: text A→Z, numbers largest first. */
function nextSort(current: SortState, key: SortKey): SortState {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
  }
  return { key, direction: key === 'label' ? 'asc' : 'desc' }
}

function ariaSort(state: SortState, key: SortKey): 'ascending' | 'descending' | 'none' {
  if (state.key !== key) return 'none'
  return state.direction === 'asc' ? 'ascending' : 'descending'
}

function arrow(state: SortState, key: SortKey): string {
  if (state.key !== key) return ''
  return state.direction === 'asc' ? ' ▲' : ' ▼'
}

interface FrequencyTableViewProps {
  id: string
  caption: string
  itemHeader: string
  table: FrequencyTable
  topN: TopN
  sort: SortState
  onSort: (key: SortKey) => void
  emptyMessage: string
}

function FrequencyTableView({ id, caption, itemHeader, table, topN, sort, onSort, emptyMessage }: FrequencyTableViewProps) {
  const rows = useMemo(
    () => limitRows(sortRows(table.rows, sort.key, sort.direction), topN),
    [table.rows, sort, topN],
  )

  const headers: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'label', label: itemHeader, align: 'left' },
    { key: 'count', label: 'Count', align: 'right' },
    { key: 'percent', label: 'Percent', align: 'right' },
  ]

  const copyCsv = toCsv(rows, itemHeader)
  const copyText = toPlainText(rows)
  const hasRows = rows.length > 0

  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-2 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-heading`} className="text-sm font-semibold">
          {caption}
        </h2>
        {hasRows && (
          <div className="flex gap-2">
            <CopyButton text={copyCsv} label="Copy CSV" aria-label={`Copy CSV, ${caption}`} />
            <CopyButton text={copyText} label="Copy text" aria-label={`Copy text, ${caption}`} />
          </div>
        )}
      </div>

      {table.unique > 0 && (
        <p className="text-xs font-mono text-dim">
          Showing {numberFormatter.format(rows.length)} of {numberFormatter.format(table.unique)} unique
        </p>
      )}

      {hasRows ? (
        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <caption className="sr-only">{caption}, sorted by {sort.key} {sort.direction === 'asc' ? 'ascending' : 'descending'}</caption>
            <thead className="bg-surface border-b border-border text-[10px] uppercase tracking-[0.16em] text-subtle">
              <tr>
                {headers.map(header => (
                  <th
                    key={header.key}
                    scope="col"
                    aria-sort={ariaSort(sort, header.key)}
                    className={`px-4 py-2 font-normal ${header.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(header.key)}
                      className="uppercase tracking-[0.16em] hover:text-bright focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      {header.label}
                      <span aria-hidden="true">{arrow(sort, header.key)}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row: FrequencyRow) => (
                <tr key={row.key}>
                  <th scope="row" className="px-4 py-2 text-left font-normal text-bright break-all whitespace-pre-wrap max-w-[16rem]">
                    {row.label}
                  </th>
                  <td className="px-4 py-2 text-right tabular-nums">{numberFormatter.format(row.count)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-dim">{formatPercent(row.percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p role="status" className="text-xs font-mono text-subtle border border-border rounded px-4 py-6">
          {emptyMessage}
        </p>
      )}
    </section>
  )
}

export default function WordFrequency() {
  const [text, setText] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [ignoreStopWords, setIgnoreStopWords] = useState(false)
  const [topN, setTopN] = useState<TopN>(25)
  const [wordSort, setWordSort] = useState<SortState>(DEFAULT_SORT)
  const [charSort, setCharSort] = useState<SortState>(DEFAULT_SORT)

  // Analysis runs on a deferred copy of the text, so typing stays responsive on very long input.
  const deferredText = useDeferredValue(text)
  const isStale = deferredText !== text

  const analysis = useMemo(
    () => analyzeFrequency(deferredText, { ignoreCase, ignoreStopWords }),
    [deferredText, ignoreCase, ignoreStopWords],
  )

  const isEmpty = text.trim() === ''
  const characterTotal = analysis.characters.total
  const topNLabel = (option: TopN) => (option === 'all' ? 'All' : String(option))

  return (
    <ToolLayout
      title="Word / Character Frequency"
      description="Count how often each word and character appears, sorted by frequency"
      tag="Analyze"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <TextAreaField
            label="Text to analyze"
            value={text}
            onChange={setText}
            className="textarea-base h-48 font-mono"
            placeholder="Paste or type text to see word and character frequencies…"
            footer={
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setText(SAMPLE)}
                  className="text-subtle hover:text-dim transition-colors"
                >
                  ← example
                </button>
                {isStale && <span role="status" className="text-dim">Updating…</span>}
              </div>
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-mono text-dim">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={e => setIgnoreCase(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Ignore case
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreStopWords}
              onChange={e => setIgnoreStopWords(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Ignore stop words
          </label>
          <label className="flex items-center gap-2">
            Show top
            <select
              value={String(topN)}
              onChange={e => {
                const picked = TOP_N_OPTIONS.find(option => String(option) === e.target.value)
                if (picked !== undefined) setTopN(picked)
              }}
              className="bg-surface border border-border rounded px-2 py-1 font-mono"
            >
              {TOP_N_OPTIONS.map(option => (
                <option key={String(option)} value={String(option)}>
                  {topNLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isEmpty ? (
          <p role="status" className="text-sm text-dim">
            Enter some text to see its word and character frequencies.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono" data-testid="frequency-totals">
              <StatCard label="Total words" value={numberFormatter.format(analysis.words.total)} />
              <StatCard label="Unique words" value={numberFormatter.format(analysis.words.unique)} />
              <StatCard label="Total characters" value={numberFormatter.format(characterTotal)} />
              <StatCard label="Unique characters" value={numberFormatter.format(analysis.characters.unique)} />
            </div>
            {ignoreStopWords && (
              <p className="text-xs font-mono text-subtle">
                {numberFormatter.format(analysis.stopWordsRemoved)} stop word{analysis.stopWordsRemoved === 1 ? '' : 's'} left out of the word table.
              </p>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FrequencyTableView
                id="word-frequency-words"
                caption="Word frequency"
                itemHeader="Word"
                table={analysis.words}
                topN={topN}
                sort={wordSort}
                onSort={key => setWordSort(current => nextSort(current, key))}
                emptyMessage={
                  analysis.words.total === 0 && analysis.stopWordsRemoved > 0
                    ? 'Every word was a stop word. Untick "Ignore stop words" to see them.'
                    : 'No words found. Words are letters or numbers, so punctuation alone is not counted.'
                }
              />
              <FrequencyTableView
                id="word-frequency-chars"
                caption="Character frequency"
                itemHeader="Character"
                table={analysis.characters}
                topN={topN}
                sort={charSort}
                onSort={key => setCharSort(current => nextSort(current, key))}
                emptyMessage="No characters found."
              />
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
