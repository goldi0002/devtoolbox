import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

const SAMPLE_HEADERS = `GET /api/users?page=2 HTTP/1.1
Host: api.example.dev
Authorization: Bearer abc123
Content-Type: application/json
X-Request-Id: req_42
Cache-Control: no-cache`

type HeaderRow = {
  name: string
  value: string
}

export default function HttpHeaderParser() {
  const [input, setInput] = useState(SAMPLE_HEADERS)

  const parsed = useMemo(() => {
    const lines = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const requestLine = lines.find(line => !line.includes(':')) ?? ''
    const headers: HeaderRow[] = lines
      .filter(line => line.includes(':'))
      .map((line) => {
        const idx = line.indexOf(':')
        return {
          name: line.slice(0, idx).trim(),
          value: line.slice(idx + 1).trim(),
        }
      })

    return {
      requestLine,
      headers,
      json: headers.reduce<Record<string, string>>((acc, row) => {
        acc[row.name] = row.value
        return acc
      }, {}),
    }
  }, [input])

  return (
    <ToolLayout
      title="HTTP Header Parser"
      description="Parse raw request or response headers into a structured table and copyable JSON"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => setInput(SAMPLE_HEADERS)}>Load sample</button>
          <button className="btn-primary ml-auto" onClick={() => setInput('')}>Clear</button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">Raw headers</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-base min-h-[170px] w-full"
            placeholder="Paste raw HTTP headers here"
            spellCheck={false}
          />
        </div>

        {parsed.requestLine && (
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Request line</div>
            <div className="flex items-start gap-3">
              <p className="text-sm font-mono text-bright break-all flex-1">{parsed.requestLine}</p>
              <CopyButton text={parsed.requestLine} />
            </div>
          </div>
        )}

        <div className="border border-border rounded overflow-hidden">
          <div className="grid grid-cols-[220px_1fr_auto] gap-3 px-4 py-2 bg-surface border-b border-border text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">
            <span>Header</span>
            <span>Value</span>
            <span className="text-right">Copy</span>
          </div>

          {parsed.headers.length === 0 ? (
            <div className="px-4 py-8 text-xs font-mono text-subtle">No header lines detected yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {parsed.headers.map((row) => (
                <div key={`${row.name}-${row.value}`} className="grid grid-cols-[220px_1fr_auto] gap-3 px-4 py-3 items-start bg-[#f8f8f8]">
                  <span className="text-sm font-mono text-bright break-all">{row.name}</span>
                  <span className="text-sm font-sans text-dim break-all">{row.value}</span>
                  <div className="justify-self-end">
                    <CopyButton text={`${row.name}: ${row.value}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border rounded p-4 bg-surface">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">JSON view</div>
            <CopyButton text={JSON.stringify(parsed.json, null, 2)} />
          </div>
          <pre className="text-xs font-mono text-dim whitespace-pre-wrap break-all">{JSON.stringify(parsed.json, null, 2)}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
