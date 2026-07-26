import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import DataTable from '../../ui/DataTable'
import FieldCard from '../../ui/FieldCard'
import TextAreaField from '../../ui/TextAreaField'

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

        <TextAreaField
          label="Raw headers"
          value={input}
          onChange={setInput}
          className="input-base min-h-[170px] w-full"
          placeholder="Paste raw HTTP headers here"
        />

        {parsed.requestLine && (
          <FieldCard label="Request line" value={parsed.requestLine} copyable />
        )}

        <DataTable
          gridClass="grid-cols-[220px_1fr_auto]"
          columns={[
            { label: 'Header' },
            { label: 'Value' },
            { label: 'Copy', align: 'right' },
          ]}
          rows={parsed.headers}
          rowKey={row => `${row.name}-${row.value}`}
          copyText={row => `${row.name}: ${row.value}`}
          emptyMessage="No header lines detected yet."
          renderRow={row => (
            <>
              <span className="text-sm font-mono text-bright break-all">{row.name}</span>
              <span className="text-sm font-sans text-dim break-all">{row.value}</span>
            </>
          )}
        />

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
