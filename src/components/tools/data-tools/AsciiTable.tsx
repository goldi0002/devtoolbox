import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type AsciiRow = {
  code: number
  char: string
  label: string
}

const ASCII_ROWS: AsciiRow[] = Array.from({ length: 128 }, (_, code) => {
  const controlNames: Record<number, string> = {
    0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL',
    8: 'BS', 9: 'TAB', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI',
    16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
    24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US', 127: 'DEL',
  }

  if (controlNames[code]) {
    return { code, char: '·', label: controlNames[code] }
  }

  if (code === 32) {
    return { code, char: '␠', label: 'SPACE' }
  }

  return { code, char: String.fromCharCode(code), label: String.fromCharCode(code) }
})

export default function AsciiTable() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return ASCII_ROWS

    return ASCII_ROWS.filter((row) => {
      const hex = row.code.toString(16).padStart(2, '0')
      const binary = row.code.toString(2).padStart(8, '0')
      return row.label.toLowerCase().includes(normalized)
        || row.char.toLowerCase().includes(normalized)
        || String(row.code).includes(normalized)
        || hex.includes(normalized.replace(/^0x/, ''))
        || binary.includes(normalized)
    })
  }, [query])

  return (
    <ToolLayout
      title="ASCII Table"
      description="Browse ASCII character codes in decimal, hex, and binary with quick search and copy actions"
      tag="data"
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">Search by character, label, decimal, hex, or binary</label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-base w-full"
            placeholder="Examples: A, space, 65, 0x41, 01000001"
            spellCheck={false}
          />
        </div>

        <div className="border border-border rounded overflow-hidden">
          <div className="grid grid-cols-[70px_70px_100px_120px_1fr_auto] gap-3 px-4 py-2 bg-surface border-b border-border text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">
            <span>Dec</span>
            <span>Hex</span>
            <span>Binary</span>
            <span>Char</span>
            <span>Label</span>
            <span className="text-right">Copy</span>
          </div>

          <div className="max-h-[540px] overflow-auto divide-y divide-border">
            {filtered.map((row) => (
              <div key={row.code} className="grid grid-cols-[70px_70px_100px_120px_1fr_auto] gap-3 px-4 py-3 items-center bg-[#f8f8f8]">
                <span className="text-sm font-mono text-bright">{row.code}</span>
                <span className="text-xs font-mono text-dim">0x{row.code.toString(16).padStart(2, '0').toUpperCase()}</span>
                <span className="text-xs font-mono text-subtle">{row.code.toString(2).padStart(8, '0')}</span>
                <span className="text-lg font-mono text-bright">{row.char}</span>
                <span className="text-sm font-sans text-dim">{row.label}</span>
                <div className="justify-self-end">
                  <CopyButton text={String(row.code)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
