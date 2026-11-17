// Pure time-zone helpers built only on Intl.DateTimeFormat. No tz database is downloaded:
// the browser's own zone rules decide every offset, including daylight saving changes.

export interface WallTime {
  year: number
  month: number // 1-12
  day: number
  hour: number // 0-23
  minute: number // 0-59
}

export interface ZonedParts extends WallTime {
  second: number
}

export type ResolveStatus = 'ok' | 'gap' | 'ambiguous'

export interface ResolvedWallTime {
  epochMs: number
  status: ResolveStatus
}

export interface ConversionRow {
  zone: string
  wall: ZonedParts
  offsetMinutes: number
  offsetLabel: string
  daylight: boolean
  /** Calendar days relative to the source zone's date (-1, 0, +1, ...). */
  dayDelta: number
}

export interface PlannerCell {
  hour: number
  label: string
  working: boolean
}

export interface PlannerRow {
  zone: string
  offsetLabel: string
  cells: PlannerCell[]
}

export interface PlannerColumn {
  label: string
}

export interface PlannerGrid {
  columns: PlannerColumn[]
  rows: PlannerRow[]
}

export const DEFAULT_SOURCE_ZONE = 'America/New_York'
export const DEFAULT_ZONES: readonly string[] = ['Europe/London', 'Asia/Kolkata', 'Asia/Tokyo']

/**
 * Common zones that are always listed, merged with whatever the browser reports. Some runtimes name a
 * zone differently (Intl lists Asia/Calcutta, while people search for Kolkata), so these names guarantee a
 * match. This is also the whole list when the browser has no Intl.supportedValuesOf. Includes a :30 zone.
 */
export const FALLBACK_TIME_ZONES: readonly string[] = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Kathmandu',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

// ── Zone list and search ─────────────────────────────────────────────────

/**
 * Merges Intl.supportedValuesOf results (when the browser provides them) with FALLBACK_TIME_ZONES,
 * de-duplicated and sorted. Pure: the caller passes the function, so tests can exercise both paths.
 */
export function buildTimeZoneList(supportedValuesOf: ((key: string) => string[]) | undefined): string[] {
  let reported: string[] = []
  try {
    if (typeof supportedValuesOf === 'function') {
      reported = supportedValuesOf('timeZone').filter(zone => typeof zone === 'string' && zone.length > 0)
    }
  } catch {
    reported = []
  }
  return [...new Set([...reported, ...FALLBACK_TIME_ZONES])].sort()
}

let cachedZoneList: string[] | null = null

export function listTimeZones(): string[] {
  if (!cachedZoneList) {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    const supported = intl.supportedValuesOf
    cachedZoneList = buildTimeZoneList(supported ? (key: string) => supported.call(Intl, key) : undefined)
  }
  return cachedZoneList
}

/** "America/Argentina/Buenos_Aires" -> "Buenos Aires" */
export function cityName(zone: string): string {
  const last = zone.split('/').pop() ?? zone
  return last.replace(/_/g, ' ')
}

function normalizeSearch(text: string): string {
  return text.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Finds zones whose city or IANA name contains the query. Prefix matches rank first.
 * Matching ignores case, underscores vs spaces, and the order of "/" segments.
 */
export function searchTimeZones(query: string, zones: readonly string[], limit = 8): string[] {
  const needle = normalizeSearch(query)
  if (!needle) return []
  const scored: { zone: string; score: number }[] = []
  for (const zone of zones) {
    const name = normalizeSearch(zone)
    const city = normalizeSearch(cityName(zone))
    if (city.startsWith(needle) || name.startsWith(needle)) {
      scored.push({ zone, score: 0 })
    } else if (city.includes(needle) || name.includes(needle)) {
      scored.push({ zone, score: 1 })
    }
  }
  scored.sort((a, b) => a.score - b.score || a.zone.localeCompare(b.zone))
  return scored.slice(0, limit).map(item => item.zone)
}

// ── Zone offsets and conversion ──────────────────────────────────────────

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(zone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(zone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    formatterCache.set(zone, formatter)
  }
  return formatter
}

export function isValidTimeZone(zone: string): boolean {
  try {
    getFormatter(zone)
    return true
  } catch {
    return false
  }
}

/** Wall-clock fields of an instant as seen in the zone. */
export function epochToZoned(epochMs: number, zone: string): ZonedParts {
  const parts = getFormatter(zone).formatToParts(new Date(epochMs))
  const read = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0)
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour') % 24,
    minute: read('minute'),
    second: read('second'),
  }
}

/** UTC offset of the zone at an instant, in whole minutes (positive east of UTC). */
export function getOffsetMinutes(zone: string, epochMs: number): number {
  const p = epochToZoned(epochMs, zone)
  const wallAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const wholeSecondMs = Math.floor(epochMs / 1000) * 1000
  return Math.round((wallAsUtc - wholeSecondMs) / 60_000)
}

/** 330 -> "UTC+05:30", -240 -> "UTC-04:00", 0 -> "UTC" */
export function formatUtcOffset(minutes: number): string {
  if (minutes === 0) return 'UTC'
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  return `UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}

/**
 * True when the zone is on its daylight-saving offset at this instant.
 * Compares the instant's offset with the larger of the January and July offsets of that year.
 * Zones without daylight saving always return false.
 */
export function isDaylightTime(zone: string, epochMs: number): boolean {
  const year = epochToZoned(epochMs, zone).year
  const january = getOffsetMinutes(zone, Date.UTC(year, 0, 1))
  const july = getOffsetMinutes(zone, Date.UTC(year, 6, 1))
  if (january === july) return false
  return getOffsetMinutes(zone, epochMs) === Math.max(january, july)
}

/**
 * Converts a wall-clock time in a zone to an instant.
 * - "gap": the time does not exist (clocks jump forward). Returns the instant after the jump.
 * - "ambiguous": the time happens twice (clocks fall back). Returns the earlier instant.
 */
export function wallToEpoch(wall: WallTime, zone: string): ResolvedWallTime {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute)
  const before = getOffsetMinutes(zone, guess - DAY_MS) * 60_000
  const after = getOffsetMinutes(zone, guess + DAY_MS) * 60_000

  const valid = new Set<number>()
  for (const offset of [before, after]) {
    const candidate = guess - offset
    if (getOffsetMinutes(zone, candidate) * 60_000 === offset) valid.add(candidate)
  }

  if (valid.size === 0) return { epochMs: guess - before, status: 'gap' }
  const sorted = [...valid].sort((a, b) => a - b)
  return { epochMs: sorted[0], status: sorted.length > 1 ? 'ambiguous' : 'ok' }
}

/** Parses "YYYY-MM-DD" and "HH:mm" from date and time inputs. Returns null for anything invalid. */
export function parseWallInput(date: string, time: string): WallTime | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const t = /^(\d{2}):(\d{2})$/.exec(time)
  if (!d || !t) return null
  const wall: WallTime = {
    year: Number(d[1]),
    month: Number(d[2]),
    day: Number(d[3]),
    hour: Number(t[1]),
    minute: Number(t[2]),
  }
  if (wall.month < 1 || wall.month > 12) return null
  const check = new Date(Date.UTC(wall.year, wall.month - 1, wall.day))
  if (check.getUTCDate() !== wall.day) return null
  if (wall.hour > 23 || wall.minute > 59) return null
  return wall
}

export function formatWall(wall: WallTime): string {
  return `${wall.year}-${pad2(wall.month)}-${pad2(wall.day)} ${pad2(wall.hour)}:${pad2(wall.minute)}`
}

export function formatClock(parts: { hour: number; minute: number }): string {
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`
}

/** Whole calendar days from `from` to `to` (both wall-clock dates). */
function dayDifference(from: WallTime, to: WallTime): number {
  const a = Date.UTC(from.year, from.month - 1, from.day)
  const b = Date.UTC(to.year, to.month - 1, to.day)
  return Math.round((b - a) / DAY_MS)
}

/** Shows one instant in each zone. The source zone's date is the reference for dayDelta. */
export function buildConversionRows(epochMs: number, zones: readonly string[], sourceZone: string): ConversionRow[] {
  const sourceWall = epochToZoned(epochMs, sourceZone)
  return zones.map(zone => {
    const wall = epochToZoned(epochMs, zone)
    const offsetMinutes = getOffsetMinutes(zone, epochMs)
    return {
      zone,
      wall,
      offsetMinutes,
      offsetLabel: formatUtcOffset(offsetMinutes),
      daylight: isDaylightTime(zone, epochMs),
      dayDelta: dayDifference(sourceWall, wall),
    }
  })
}

// ── Meeting planner ──────────────────────────────────────────────────────

/** True when the local hour falls in the working window. start..end is [start, end). Wraps past midnight when start > end. */
export function isWorkingHour(hour: number, start: number, end: number): boolean {
  if (start === end) return false
  if (start < end) return hour >= start && hour < end
  return hour >= start || hour < end
}

/**
 * Builds the planner grid. Columns are the 24 consecutive hours that start at local midnight of
 * the reference date in the reference zone, so every column is the same moment in every row.
 * Each cell shows that moment's clock time in its zone and is marked when it falls in working hours.
 */
export function buildPlannerGrid(options: {
  referenceDate: WallTime
  referenceZone: string
  zones: readonly string[]
  workStart: number
  workEnd: number
}): PlannerGrid {
  const { referenceDate, referenceZone, zones, workStart, workEnd } = options
  const startEpoch = wallToEpoch({ ...referenceDate, hour: 0, minute: 0 }, referenceZone).epochMs
  const instants = Array.from({ length: 24 }, (_, index) => startEpoch + index * HOUR_MS)

  const columns: PlannerColumn[] = instants.map(epoch => {
    const wall = epochToZoned(epoch, referenceZone)
    return { label: wall.minute === 0 ? pad2(wall.hour) : formatClock(wall) }
  })

  const rows: PlannerRow[] = zones.map(zone => ({
    zone,
    offsetLabel: formatUtcOffset(getOffsetMinutes(zone, startEpoch)),
    cells: instants.map(epoch => {
      const wall = epochToZoned(epoch, zone)
      return {
        hour: wall.hour,
        label: wall.minute === 0 ? pad2(wall.hour) : formatClock(wall),
        working: isWorkingHour(wall.hour, workStart, workEnd),
      }
    }),
  }))

  return { columns, rows }
}

// ── Summary ──────────────────────────────────────────────────────────────

/**
 * One line for chat or email, e.g.
 * "2026-03-29 09:00 America/New_York (UTC-04:00) = Europe/London 14:00 (UTC+01:00); Asia/Kolkata 18:30 (UTC+05:30)".
 * Rows on another calendar day get " (next day)" or " (previous day)".
 */
export function buildSummaryLine(sourceZone: string, epochMs: number, rows: readonly ConversionRow[]): string {
  const source = epochToZoned(epochMs, sourceZone)
  const head = `${formatWall(source)} ${sourceZone} (${formatUtcOffset(getOffsetMinutes(sourceZone, epochMs))})`
  const others = rows
    .filter(row => row.zone !== sourceZone)
    .map(row => {
      const dayNote = row.dayDelta === 1 ? ' (next day)' : row.dayDelta === -1 ? ' (previous day)' : row.dayDelta !== 0 ? ` (${row.dayDelta > 0 ? '+' : ''}${row.dayDelta} days)` : ''
      return `${row.zone} ${formatClock(row.wall)} (${row.offsetLabel})${dayNote}`
    })
  if (others.length === 0) return head
  return `${head} = ${others.join('; ')}`
}
