import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import {
  DEFAULT_SOURCE_ZONE,
  DEFAULT_ZONES,
  buildConversionRows,
  buildPlannerGrid,
  buildSummaryLine,
  epochToZoned,
  formatWall,
  listTimeZones,
  pad2,
  parseWallInput,
  searchTimeZones,
  wallToEpoch,
  type ResolvedWallTime,
  type WallTime,
} from '../../../utils/timeZone'

// Fixed defaults, so server-rendered HTML matches the first client render. "Now" reads the clock on click only.
const DEFAULT_DATE = '2026-03-29'
const DEFAULT_TIME = '09:00'

function describeResolution(wall: WallTime, resolved: ResolvedWallTime, zone: string): string | null {
  if (resolved.status === 'ok') return null
  if (resolved.status === 'gap') {
    const shown = formatWall(epochToZoned(resolved.epochMs, zone))
    return `${formatWall(wall)} does not exist in ${zone} because the clocks skip forward that day. Showing ${shown} instead.`
  }
  return `${formatWall(wall)} happens twice in ${zone} because the clocks fall back that day. Showing the first occurrence.`
}

function readHour(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(23, Math.max(0, parsed))
}

export default function TimeZoneConverter() {
  const zoneOptions = useMemo(() => listTimeZones(), [])
  const [source, setSource] = useState(DEFAULT_SOURCE_ZONE)
  const [zones, setZones] = useState<string[]>([...DEFAULT_ZONES])
  const [date, setDate] = useState(DEFAULT_DATE)
  const [time, setTime] = useState(DEFAULT_TIME)
  const [query, setQuery] = useState('')
  const [workStart, setWorkStart] = useState(9)
  const [workEnd, setWorkEnd] = useState(17)

  const rowZones = useMemo(() => [source, ...zones.filter(zone => zone !== source)], [source, zones])
  const wall = parseWallInput(date, time)
  const resolved = wall ? wallToEpoch(wall, source) : null
  const rows = resolved ? buildConversionRows(resolved.epochMs, rowZones, source) : []
  const grid = wall ? buildPlannerGrid({ referenceDate: wall, referenceZone: source, zones: rowZones, workStart, workEnd }) : null
  const summary = resolved ? buildSummaryLine(source, resolved.epochMs, rows) : ''
  const warning = wall && resolved ? describeResolution(wall, resolved, source) : null
  const matches = useMemo(
    () => searchTimeZones(query, zoneOptions.filter(zone => !rowZones.includes(zone))),
    [query, zoneOptions, rowZones],
  )

  const addZone = (zone: string) => {
    setZones(current => (current.includes(zone) || zone === source ? current : [...current, zone]))
    setQuery('')
  }

  const removeZone = (zone: string) => {
    setZones(current => current.filter(item => item !== zone))
  }

  const setToNow = () => {
    const now = epochToZoned(Date.now(), source)
    setDate(`${now.year}-${pad2(now.month)}-${pad2(now.day)}`)
    setTime(`${pad2(now.hour)}:${pad2(now.minute)}`)
  }

  return (
    <ToolLayout
      title="Time Zone Converter & Meeting Planner"
      description="Convert one date and time across time zones and plan a meeting around working hours"
      tag="time"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label htmlFor="tz-source" className="text-xs font-mono text-dim">
              Source time zone
            </label>
            <select
              id="tz-source"
              className="input-base w-full"
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              {zoneOptions.map(zone => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="tz-date" className="text-xs font-mono text-dim">
              Date
            </label>
            <input id="tz-date" type="date" className="input-base w-full" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="tz-time" className="text-xs font-mono text-dim">
              Time
            </label>
            <input id="tz-time" type="time" step={60} className="input-base w-full" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="button" className="btn-ghost w-full" onClick={setToNow}>
              Now
            </button>
          </div>
        </div>

        {!wall && <ErrorBanner message="Enter a valid date and time in the source zone." />}
        {warning && (
          <p role="status" className="text-sm text-amber-500">
            {warning}
          </p>
        )}

        <SectionPanel title="Conversion">
          <div className="space-y-4">
            {rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table data-testid="conversion-table" className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-left text-dim">
                      <th scope="col" className="px-3 py-2 font-normal">Zone</th>
                      <th scope="col" className="px-3 py-2 font-normal">Local date and time</th>
                      <th scope="col" className="px-3 py-2 font-normal">Offset</th>
                      <th scope="col" className="px-3 py-2 font-normal">Daylight saving</th>
                      <th scope="col" className="px-3 py-2 font-normal">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row, index) => (
                      <tr key={row.zone} data-testid={`convert-${row.zone}`}>
                        <th scope="row" className="px-3 py-2 text-left font-normal break-all">
                          {row.zone}
                          {index === 0 && <span className="ml-2 text-dim">(source)</span>}
                        </th>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatWall(row.wall)}
                          {row.dayDelta !== 0 && (
                            <span className="ml-2 text-dim">{row.dayDelta > 0 ? `+${row.dayDelta} day` : `${row.dayDelta} day`}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.offsetLabel}</td>
                        <td className="px-3 py-2">{row.daylight ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-2 text-right">
                          {index > 0 && (
                            <button
                              type="button"
                              className="btn-ghost"
                              aria-label={`Remove ${row.zone}`}
                              onClick={() => removeZone(row.zone)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-dim">Enter a valid date and time to see the conversion.</p>
            )}

            <div className="space-y-2">
              <TextInputField
                label="Search zones"
                value={query}
                onChange={setQuery}
                placeholder="City or IANA name, e.g. kolkata or America/Chicago"
              />
              {query.trim() && (
                <ul className="divide-y divide-border border border-border rounded text-xs font-mono">
                  {matches.length === 0 && <li className="px-3 py-2 text-dim">No matching time zone.</li>}
                  {matches.map(zone => (
                    <li key={zone} className="px-3 py-2 flex items-center justify-between gap-3">
                      <span className="break-all">{zone}</span>
                      <button type="button" className="btn-ghost" aria-label={`Add ${zone}`} onClick={() => addZone(zone)}>
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Summary" action={<CopyButton text={summary} label="Copy summary" disabled={!summary} />}>
          <p data-testid="summary-line" className="font-mono text-sm break-words">
            {summary || 'Nothing to summarize yet.'}
          </p>
        </SectionPanel>

        <SectionPanel title="Meeting planner">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label htmlFor="tz-work-start" className="block text-dim">
                  Work day starts (hour)
                </label>
                <input
                  id="tz-work-start"
                  type="number"
                  min={0}
                  max={23}
                  className="input-base w-28"
                  value={workStart}
                  onChange={e => setWorkStart(readHour(e.target.value, workStart))}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="tz-work-end" className="block text-dim">
                  Work day ends (hour)
                </label>
                <input
                  id="tz-work-end"
                  type="number"
                  min={0}
                  max={23}
                  className="input-base w-28"
                  value={workEnd}
                  onChange={e => setWorkEnd(readHour(e.target.value, workEnd))}
                />
              </div>
              <p className="text-dim max-w-md">
                Columns are the 24 hours from midnight of the source day, so each column is the same moment in every row. Shaded
                cells are local working hours in that zone.
              </p>
            </div>

            {grid && (
              <div className="overflow-x-auto">
                <table data-testid="planner-grid" className="min-w-[760px] w-full text-[10px] font-mono border-separate border-spacing-px">
                  <thead>
                    <tr>
                      <th scope="col" className="px-2 py-1 text-left font-normal text-dim">
                        Zone (source hours)
                      </th>
                      {grid.columns.map((column, index) => (
                        <th key={index} scope="col" className="px-0.5 py-1 font-normal text-dim">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.rows.map(row => (
                      <tr key={row.zone} data-testid={`planner-${row.zone}`}>
                        <th scope="row" className="px-2 py-1 text-left font-normal whitespace-nowrap">
                          {row.zone}
                          <span className="block text-dim">{row.offsetLabel}</span>
                        </th>
                        {row.cells.map((cell, index) => (
                          <td
                            key={index}
                            data-working={cell.working}
                            className={`px-0.5 py-1 text-center rounded-sm ${
                              cell.working ? 'bg-emerald-500/25 text-emerald-200' : 'bg-muted text-dim'
                            }`}
                          >
                            {cell.label}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionPanel>
      </div>
    </ToolLayout>
  )
}
