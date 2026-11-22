import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import ToggleGroup from '../../ui/ToggleGroup'
import TextInputField from '../../ui/TextInputField'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import {
  MAX_SORTABLE_ID_COUNT,
  clampSortableCount,
  generateUlids,
  generateUuidV7s,
  inspectId,
  type SortableIdKind,
} from '../../../utils/sortableId'

type OutputShape = 'lines' | 'json' | 'sql'

const KIND_OPTIONS: ReadonlyArray<{ value: SortableIdKind; label: string }> = [
  { value: 'ulid', label: 'ULID' },
  { value: 'uuidv7', label: 'UUID v7 (RFC 9562)' },
]

const SHAPE_OPTIONS: ReadonlyArray<{ value: OutputShape; label: string }> = [
  { value: 'lines', label: 'Lines' },
  { value: 'json', label: 'JSON Array' },
  { value: 'sql', label: 'SQL VALUES' },
]

export default function UlidUuidv7Generator() {
  const [kind, setKind] = useState<SortableIdKind>('ulid')
  const [count, setCount] = useState<number>(5)
  const [monotonic, setMonotonic] = useState<boolean>(true)
  const [lowercaseUlid, setLowercaseUlid] = useState<boolean>(false)
  const [uppercaseUuid, setUppercaseUuid] = useState<boolean>(false)
  const [noHyphens, setNoHyphens] = useState<boolean>(false)
  const [useCustomTimestamp, setUseCustomTimestamp] = useState<boolean>(false)
  const [customTimestampMs, setCustomTimestampMs] = useState<string>(() => String(Date.now()))
  const [outputShape, setOutputShape] = useState<OutputShape>('lines')

  const [ids, setIds] = useState<string[]>(() => generateUlids(5, { monotonic: true }))
  const [genError, setGenError] = useState<string>('')
  const [inspectInput, setInspectInput] = useState<string>(() => ids[0] ?? '')

  const handleGenerate = (targetKind: SortableIdKind = kind) => {
    setGenError('')
    try {
      const ts = useCustomTimestamp ? Number(customTimestampMs.trim()) : Date.now()
      if (useCustomTimestamp && (!Number.isInteger(ts) || ts < 0)) {
        throw new Error('Custom timestamp must be a non-negative integer in Unix milliseconds.')
      }
      const nextIds =
        targetKind === 'ulid'
          ? generateUlids(count, { timestampMs: ts, monotonic, lowercase: lowercaseUlid })
          : generateUuidV7s(count, { timestampMs: ts, monotonic, uppercase: uppercaseUuid, noHyphens })
      setIds(nextIds)
      if (targetKind !== kind && nextIds[0]) {
        setInspectInput(nextIds[0])
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate IDs.')
    }
  }

  const switchKind = (nextKind: SortableIdKind) => {
    setKind(nextKind)
    handleGenerate(nextKind)
  }

  const formattedOutput = useMemo(() => {
    if (ids.length === 0) return ''
    if (outputShape === 'json') return JSON.stringify(ids, null, 2)
    if (outputShape === 'sql') return ids.map(id => `('${id}')`).join(',\n')
    return ids.join('\n')
  }, [ids, outputShape])

  const inspected = useMemo(() => inspectId(inspectInput), [inspectInput])

  return (
    <ToolLayout
      title="ULID & UUID v7 Generator & Inspector"
      description="Generate lexicographically time-sortable ULID and RFC 9562 UUID v7 identifiers, or decode any ULID/UUID timestamp"
      tag="id"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Identifier format" className="flex flex-wrap gap-2">
            <ToggleGroup options={KIND_OPTIONS} value={kind} onChange={switchKind} />
          </div>
          <div role="group" aria-label="Copy format" className="flex flex-wrap gap-2">
            <ToggleGroup options={SHAPE_OPTIONS} value={outputShape} onChange={setOutputShape} />
          </div>
        </div>

        <SectionPanel title="Generator Settings">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="sortable-count" className="block text-xs text-dim font-mono mb-1.5">
                  Count (1–{MAX_SORTABLE_ID_COUNT})
                </label>
                <input
                  id="sortable-count"
                  type="number"
                  min={1}
                  max={MAX_SORTABLE_ID_COUNT}
                  value={count}
                  onChange={e => setCount(clampSortableCount(Number(e.target.value)))}
                  className="input-base font-mono tabular-nums"
                />
              </div>

              <div className="flex flex-col gap-2 pb-1">
                <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monotonic}
                    onChange={e => setMonotonic(e.target.checked)}
                  />
                  Monotonic ordering (same-ms increment)
                </label>
                {kind === 'uuidv7' ? (
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uppercaseUuid}
                        onChange={e => setUppercaseUuid(e.target.checked)}
                      />
                      Uppercase hex
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noHyphens}
                        onChange={e => setNoHyphens(e.target.checked)}
                      />
                      Strip hyphens
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lowercaseUlid}
                      onChange={e => setLowercaseUlid(e.target.checked)}
                    />
                    Lowercase Crockford Base32
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-2 pb-1">
                <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomTimestamp}
                    onChange={e => setUseCustomTimestamp(e.target.checked)}
                  />
                  Pin custom Unix timestamp (ms)
                </label>
                {useCustomTimestamp && (
                  <input
                    type="number"
                    aria-label="Custom Unix timestamp in milliseconds"
                    value={customTimestampMs}
                    onChange={e => setCustomTimestampMs(e.target.value)}
                    className="input-base font-mono text-xs tabular-nums"
                  />
                )}
              </div>
            </div>

            {genError && <ErrorBanner message={genError} />}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="btn-primary"
              >
                Generate {count} {kind === 'ulid' ? (count === 1 ? 'ULID' : 'ULIDs') : count === 1 ? 'UUID v7' : 'UUIDs v7'}
              </button>
              <button
                type="button"
                onClick={() => setIds([])}
                className="btn-ghost"
                disabled={ids.length === 0}
              >
                Clear
              </button>
            </div>
          </div>
        </SectionPanel>

        {ids.length > 0 && (
          <SectionPanel
            title={`Generated Output (${ids.length})`}
            copyText={formattedOutput}
          >
            {outputShape === 'lines' ? (
              <ul aria-label="Generated sortable IDs" className="max-h-72 overflow-y-auto divide-y divide-border/50">
                {ids.map((id, idx) => (
                  <li key={`${id}-${idx}`} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="font-mono text-xs text-bright break-all tabular-nums">{id}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setInspectInput(id)}
                        className="text-[11px] font-mono text-dim hover:text-accent transition-colors"
                      >
                        Inspect
                      </button>
                      <CopyButton text={id} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <pre className="max-h-72 overflow-auto font-mono text-xs text-bright whitespace-pre-wrap break-all">
                {formattedOutput}
              </pre>
            )}
          </SectionPanel>
        )}

        <SectionPanel
          title="ULID & UUID Inspector / Timestamp Decoder"
          action={
            ids[0] ? (
              <button
                type="button"
                onClick={() => setInspectInput(ids[0])}
                className="btn-ghost text-xs py-1 px-2.5"
              >
                Inspect first generated
              </button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            <TextInputField
              label="Paste a ULID or UUID (v1, v4, v7)"
              value={inspectInput}
              onChange={setInspectInput}
              placeholder="01J... or 019..."
            />

            {!inspected.valid ? (
              <ErrorBanner message={inspected.error || 'Enter a valid ULID or UUID.'} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  <StatCard label="Detected Type" value={inspected.versionLabel} />
                  <StatCard label="Variant / Encoding" value={inspected.variantLabel} />
                  <StatCard
                    label="Embedded Timestamp (ms)"
                    value={inspected.timestampMs !== null ? String(inspected.timestampMs) : 'None (Random)'}
                    valueClassName="tabular-nums"
                  />
                  <StatCard
                    label="UTC Date (ISO 8601)"
                    value={inspected.isoDate ?? 'N/A'}
                    valueClassName="tabular-nums break-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded border border-border bg-surface space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-dim">
                        {inspected.kind === 'ulid' ? 'Equivalent 128-bit UUID Format' : 'Equivalent 26-char ULID Format'}
                      </span>
                      <CopyButton text={inspected.alternateForm} />
                    </div>
                    <div className="font-mono text-xs text-bright break-all">{inspected.alternateForm}</div>
                  </div>

                  <div className="p-3 rounded border border-border bg-surface space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-dim">Raw 128-bit Hex</span>
                      <CopyButton text={inspected.hex} />
                    </div>
                    <div className="font-mono text-xs text-bright break-all">{inspected.hex}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionPanel>
      </div>
    </ToolLayout>
  )
}
