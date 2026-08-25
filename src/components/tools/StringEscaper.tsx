import { useState, useMemo } from 'react'
import { escapeString, unescapeString, EscapeFormat } from '../../utils/stringEscape'
import CopyButton from '../CopyButton'
import { ArrowLeftRight, Sparkles, Check, Copy } from 'lucide-react'

const FORMATS: { id: EscapeFormat; label: string; desc: string }[] = [
  { id: 'json', label: 'JSON', desc: '\\", \\\\, \\n, \\r, \\t' },
  { id: 'javascript', label: 'JavaScript / TS', desc: 'Single, double & backticks' },
  { id: 'python', label: 'Python', desc: 'Single, double & newlines' },
  { id: 'java', label: 'Java / C#', desc: 'Standard C-style escapes' },
  { id: 'sql', label: 'SQL', desc: "Doubled single quotes ('')" },
  { id: 'html', label: 'HTML Entities', desc: '&amp;, &lt;, &gt;, &quot;' },
  { id: 'csv', label: 'CSV', desc: 'Quote enclosure & comma safety' },
  { id: 'shell', label: 'Shell / Bash', desc: 'Safe POSIX single quotes' },
  { id: 'unicode', label: 'Unicode Escape', desc: '\\uXXXX hex encoding' },
]

export default function StringEscaper() {
  const [input, setInput] = useState('Hello "World"!\nSpecial characters: <tag> & \'quotes\'.')
  const [format, setFormat] = useState<EscapeFormat>('json')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [preserveNewlines, setPreserveNewlines] = useState(false)
  const [escapeUnicode, setEscapeUnicode] = useState(false)

  const output = useMemo(() => {
    try {
      if (mode === 'escape') {
        return escapeString(input, format, { preserveNewlines, escapeUnicode })
      } else {
        return unescapeString(input, format)
      }
    } catch {
      return 'Error processing string'
    }
  }, [input, format, mode, preserveNewlines, escapeUnicode])

  return (
    <div className="space-y-6">
      {/* ── Mode & Format Controls ── */}
      <div className="card p-5 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setMode('escape')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                mode === 'escape' ? 'bg-indigo-600 text-white shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              Escape String
            </button>
            <button
              type="button"
              onClick={() => setMode('unescape')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                mode === 'unescape' ? 'bg-indigo-600 text-white shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              Unescape String
            </button>
          </div>

          {/* Additional Options */}
          {mode === 'escape' && (
            <div className="flex items-center gap-4 text-xs font-mono text-dim">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveNewlines}
                  onChange={(e) => setPreserveNewlines(e.target.checked)}
                  className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                />
                <span>Preserve Real Newlines</span>
              </label>

              {(format === 'javascript' || format === 'java' || format === 'csharp') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escapeUnicode}
                    onChange={(e) => setEscapeUnicode(e.target.checked)}
                    className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                  />
                  <span>Escape Non-ASCII (\\uXXXX)</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Format Selector Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                format === f.id
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-semibold'
                  : 'bg-muted/30 text-dim border-border/60 hover:bg-muted/60 hover:text-bright'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Editor Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Textarea */}
        <div className="card p-4 bg-surface border border-border rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-subtle font-medium">
              {mode === 'escape' ? 'Raw Input' : 'Escaped Input'}
            </span>
            <button
              onClick={() => setInput('')}
              className="text-[11px] font-mono text-subtle hover:text-bright transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder="Type or paste text to escape/unescape..."
            className="w-full flex-1 p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright placeholder:text-subtle focus:outline-none focus:border-indigo-500 transition-all resize-y"
          />
        </div>

        {/* Output Textarea */}
        <div className="card p-4 bg-surface border border-border rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-400 font-medium">
              {mode === 'escape' ? `Escaped Result (${format.toUpperCase()})` : 'Unescaped Result'}
            </span>
            <CopyButton text={output} />
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            placeholder="Result will appear here..."
            className="w-full flex-1 p-3 bg-muted/20 border border-border rounded-lg font-mono text-xs text-bright select-all focus:outline-none resize-y"
          />
        </div>
      </div>
    </div>
  )
}
