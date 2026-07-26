import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import DataTable from '../../ui/DataTable'
import TextInputField from '../../ui/TextInputField'
import { matchesQuery } from '../../../utils/text'

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
      return matchesQuery(normalized, [row.label, row.char, row.code, binary])
        || hex.includes(normalized.replace(/^0x/, ''))
    })
  }, [query])

  return (
    <ToolLayout
      title="ASCII Table"
      description="Browse ASCII character codes in decimal, hex, and binary with quick search and copy actions"
      tag="data"
    >
      <div className="space-y-5">
        <TextInputField
          label="Search by character, label, decimal, hex, or binary"
          value={query}
          onChange={setQuery}
          placeholder="Examples: A, space, 65, 0x41, 01000001"
        />

        <DataTable
          gridClass="grid-cols-[70px_70px_100px_120px_1fr_auto]"
          columns={[
            { label: 'Dec' },
            { label: 'Hex' },
            { label: 'Binary' },
            { label: 'Char' },
            { label: 'Label' },
            { label: 'Copy', align: 'right' },
          ]}
          rows={filtered}
          rowKey={row => String(row.code)}
          copyText={row => String(row.code)}
          emptyMessage="No matching ASCII characters found."
          align="center"
          bodyClass="max-h-[540px] overflow-auto divide-y divide-border"
          renderRow={row => (
            <>
              <span className="text-sm font-mono text-bright">{row.code}</span>
              <span className="text-xs font-mono text-dim">0x{row.code.toString(16).padStart(2, '0').toUpperCase()}</span>
              <span className="text-xs font-mono text-subtle">{row.code.toString(2).padStart(8, '0')}</span>
              <span className="text-lg font-mono text-bright">{row.char}</span>
              <span className="text-sm font-sans text-dim">{row.label}</span>
            </>
          )}
        />
      </div>
    </ToolLayout>
  )
}
