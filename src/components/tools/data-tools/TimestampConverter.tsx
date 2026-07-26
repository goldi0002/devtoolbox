import { useEffect, useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import TextAreaField from '../../ui/TextAreaField'

const DEFAULT_INPUT = '1710460800'

type ParseResult = {
  date: Date | null
  error: string
}

function parseInput(value: string): ParseResult {
  const trimmed = value.trim()
  if (!trimmed) return { date: null, error: '' }

  if (/^-?\d+$/.test(trimmed)) {
    const numeric = Number(trimmed)
    const milliseconds = trimmed.length <= 10 ? numeric * 1000 : numeric
    const date = new Date(milliseconds)
    if (!Number.isNaN(date.getTime())) {
      return { date, error: '' }
    }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return { date: parsed, error: '' }
  }

  return { date: null, error: 'Enter a valid Unix timestamp, ISO string, or browser-readable date.' }
}

function formatDateParts(date: Date) {
  return {
    unixSeconds: Math.floor(date.getTime() / 1000).toString(),
    unixMilliseconds: date.getTime().toString(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    localeDate: date.toLocaleDateString(),
    localeTime: date.toLocaleTimeString(),
  }
}

export default function TimestampConverter() {
  const [input, setInput] = useState('')
  const [nowTick, setNowTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setInput(DEFAULT_INPUT)
  }, [])

  const parsed = useMemo(() => parseInput(input), [input])
  const output = useMemo(() => parsed.date ? formatDateParts(parsed.date) : null, [parsed])

  const useCurrentTime = () => {
    const now = new Date()
    setInput(now.getTime().toString())
    setNowTick(now.getTime())
  }

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert Unix timestamps into readable dates and back again in your browser"
      tag="data"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button onClick={useCurrentTime} className="btn-primary">Use current time</button>
          <button onClick={() => setInput('')} className="btn-ghost">Clear</button>
          <span className="ml-auto text-[10px] font-mono text-subtle self-center">
            {nowTick ? `Updated from current time` : 'Supports seconds, milliseconds, ISO, and local date strings'}
          </span>
        </div>

        <TextAreaField
          label="Input"
          value={input}
          onChange={setInput}
          className="textarea-base h-28"
          placeholder="1710460800 or 2026-03-18T09:30:00Z"
        />

        {parsed.error ? (
          <div className="border border-border rounded px-4 py-3 text-xs font-mono text-subtle">
            ⚠ {parsed.error}
          </div>
        ) : !mounted ? (
          <div className="border border-border rounded px-4 py-8 text-xs font-mono text-subtle">
            Loading timestamp preview…
          </div>
        ) : output ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              ['Unix seconds', output.unixSeconds],
              ['Unix milliseconds', output.unixMilliseconds],
              ['ISO 8601', output.iso],
              ['UTC', output.utc],
              ['Local date/time', output.local],
              ['Local date', output.localeDate],
              ['Local time', output.localeTime],
            ] as const).map(([label, value]) => (
              <div key={label} className="border border-border rounded p-4 bg-surface">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-mono text-subtle uppercase tracking-[0.16em]">{label}</span>
                  <CopyButton text={value} />
                </div>
                <div className="text-sm font-mono text-bright break-all leading-relaxed">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded px-4 py-8 text-xs font-mono text-subtle">
            Converted timestamps and formatted dates will appear here.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
