import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type ParamRow = {
  key: string
  value: string
}

type ParsedOutput = {
  normalizedQuery: string
  rows: ParamRow[]
  grouped: Record<string, string | string[]>
}

function normalizeInput(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed)
    return url.search.startsWith('?') ? url.search.slice(1) : url.search
  } catch {
    return trimmed.startsWith('?') ? trimmed.slice(1) : trimmed
  }
}

function parseQuery(raw: string): ParsedOutput | null {
  const normalized = normalizeInput(raw)
  if (!normalized) return null

  const params = new URLSearchParams(normalized)
  const rows: ParamRow[] = []
  const grouped = new Map<string, string[]>()

  params.forEach((value, key) => {
    rows.push({ key, value })
    const existing = grouped.get(key) ?? []
    existing.push(value)
    grouped.set(key, existing)
  })

  const groupedObject = Object.fromEntries(
    Array.from(grouped.entries()).map(([key, values]) => [key, values.length === 1 ? values[0] : values])
  )

  return {
    normalizedQuery: params.toString(),
    rows,
    grouped: groupedObject,
  }
}

export default function QueryStringParser() {
  const [input, setInput] = useState('https://toolbox4devs.com/tools?tab=web&tag=query&tag=url&new=true')

  const parsed = useMemo(() => parseQuery(input), [input])
  const jsonOutput = useMemo(() => parsed ? JSON.stringify(parsed.grouped, null, 2) : '', [parsed])

  return (
    <ToolLayout
      title="Query String Parser"
      description="Decode full URLs or raw query strings into readable params and JSON"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInput('https://toolbox4devs.com/tools?tab=web&tag=query&tag=url&new=true')}
            className="btn-primary"
          >
            Load sample
          </button>
          <button onClick={() => setInput('')} className="btn-ghost">Clear</button>
          <span className="ml-auto text-[10px] font-mono text-subtle self-center">
            Paste a full URL or only the part after ?
          </span>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">URL or query string</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="textarea-base h-28"
            placeholder="https://example.com/callback?code=abc123&state=xyz"
            spellCheck={false}
          />
        </div>

        {parsed ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="border border-border rounded bg-surface p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em] mb-1">Normalized query</div>
                  <div className="text-sm font-mono text-bright break-all leading-relaxed">{parsed.normalizedQuery || '(empty)'}</div>
                </div>
                <CopyButton text={parsed.normalizedQuery} />
              </div>

              <div className="border-t border-border pt-4">
                <div className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em] mb-3">Parameters ({parsed.rows.length})</div>
                {parsed.rows.length ? (
                  <div className="space-y-2">
                    {parsed.rows.map((row, index) => (
                      <div key={`${row.key}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 text-sm font-mono">
                        <div className="text-subtle break-all">{row.key}</div>
                        <div className="text-bright break-all">{row.value || '""'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-subtle">No parameters found.</div>
                )}
              </div>
            </div>

            <div className="border border-border rounded bg-surface p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em]">Grouped JSON</div>
                <CopyButton text={jsonOutput} />
              </div>
              <pre className="text-sm font-mono text-bright whitespace-pre-wrap break-words leading-relaxed">{jsonOutput}</pre>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded px-4 py-8 text-xs font-mono text-subtle">
            Parsed parameters and grouped JSON will appear here.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
