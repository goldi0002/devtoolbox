import { useState, useMemo } from 'react'
import { baseExtensions, baseSetup } from '../../../lib/editor-theme'
import CodeMirror from '@uiw/react-codemirror'
import ClientOnly from '../../ClientOnly'
import ToolLayout from '../../ToolLayout'
import { tools } from '../../../tools/registry'

const SAMPLE = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How valiantly did brave Hercules fight the mighty Nemean lion.
Every developer has a dozen tabs open for tools they use daily.`

// ── Analysis ──────────────────────────────────────────────────────────────
function analyze(text: string) {
  const trimmed = text.trim()
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = trimmed === '' ? [] : trimmed.split(/\s+/).filter(Boolean)
  const sentences = trimmed === '' ? 0 : (trimmed.match(/[^.!?]*[.!?]+/g) ?? [trimmed]).length
  const paragraphs = trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).filter(Boolean).length || 1
  const lines = text === '' ? 0 : text.split('\n').length
  const readingTimeSec = Math.ceil((words.length / 200) * 60)
  const readingTime = readingTimeSec < 60
    ? `${readingTimeSec}s`
    : `${Math.floor(readingTimeSec / 60)}m ${readingTimeSec % 60}s`

  const freq: Record<string, number> = {}
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9']/g, '')
    if (clean.length > 1) freq[clean] = (freq[clean] ?? 0) + 1
  })
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const avgWordLen = words.length
    ? (words.reduce((s, w) => s + w.replace(/[^a-z0-9]/gi, '').length, 0) / words.length).toFixed(1)
    : '0'

  return { chars, charsNoSpace, words: words.length, sentences, paragraphs, lines, readingTime, topWords, avgWordLen }
}

// ── Stat card ─────────────────────────────────────────────────────────────
function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border p-3 flex flex-col gap-1">
      <div className="font-display text-2xl text-bright leading-none tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-[10px] font-mono text-subtle uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[10px] font-mono text-muted">{sub}</div>}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────
export default function WordCounter() {
  const [text, setText] = useState('')
  const meta = tools.find(t => t.slug === 'word-counter')
  const result = useMemo(() => analyze(text), [text])
  const isEmpty = text.trim() === ''

  return (
    <ToolLayout
      title={meta?.name ?? 'Word Counter'}
      description={meta?.description ?? 'Count words, characters, sentences and more.'}
      tag="Analyze"
    >
      <div className="space-y-4">

        {/* ── Controls ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setText('')} className="btn-ghost" disabled={isEmpty}>
            Clear
          </button>
          <button
            onClick={() => setText(SAMPLE)}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-auto"
          >
            ← example
          </button>
        </div>

        {/* ── Editor ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">
            Text Input
            {!isEmpty && (
              <span className="ml-2 text-muted tabular-nums">
                — {result.lines} line{result.lines !== 1 ? 's' : ''}
              </span>
            )}
          </label>
          <ClientOnly key={text} children={
            <CodeMirror
              value={text}
              onChange={setText}
              extensions={baseExtensions}
              basicSetup={{ ...baseSetup, syntaxHighlighting: false }}
              theme="none"
            />}
          />
        </div>

        {/* ── Stats grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Stat label="Words" value={result.words} />
          <Stat label="Characters" value={result.chars} sub={`${result.charsNoSpace} no spaces`} />
          <Stat label="Sentences" value={result.sentences} />
          <Stat label="Paragraphs" value={result.paragraphs} />
          <Stat label="Lines" value={result.lines} />
          <Stat label="Read time" value={result.readingTime} sub="@ 200 wpm" />
        </div>

        {/* ── Secondary stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="border border-border p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-subtle uppercase tracking-wider mb-0.5">
                Avg word length
              </div>
              <div className="text-sm font-mono text-dim">
                {result.avgWordLen} characters per word
              </div>
            </div>
            <div className="font-display text-3xl text-bright">{result.avgWordLen}</div>
          </div>

          <div className="border border-border p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-subtle uppercase tracking-wider mb-0.5">
                Unique words
              </div>
              <div className="text-sm font-mono text-dim">
                {result.topWords.length > 0
                  ? `${result.topWords.length}+ distinct words`
                  : 'No words yet'}
              </div>
            </div>
            <div className="font-display text-3xl text-bright">
              {result.topWords.length > 0 ? `${result.topWords.length}+` : '—'}
            </div>
          </div>
        </div>

        {/* ── Top words ─────────────────────────────────────────────── */}
        {result.topWords.length > 0 && (
          <div className="border border-border">
            <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">
                Top words
              </span>
              <span className="text-[10px] font-mono text-muted">frequency</span>
            </div>
            <div className="divide-y divide-border">
              {result.topWords.map(([word, count]) => {
                const pct = Math.round((count / result.words) * 100)
                return (
                  <div key={word} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-mono text-bright w-32 truncate flex-shrink-0">
                      {word}
                    </span>
                    <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bright rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(pct * 3, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-dim tabular-nums w-4 text-right">
                      {count}
                    </span>
                    <span className="text-[10px] font-mono text-muted tabular-nums w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  )
}