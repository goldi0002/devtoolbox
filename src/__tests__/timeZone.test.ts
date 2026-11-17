import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SOURCE_ZONE,
  DEFAULT_ZONES,
  FALLBACK_TIME_ZONES,
  buildConversionRows,
  buildPlannerGrid,
  buildSummaryLine,
  buildTimeZoneList,
  cityName,
  epochToZoned,
  formatUtcOffset,
  formatWall,
  getOffsetMinutes,
  isDaylightTime,
  isValidTimeZone,
  isWorkingHour,
  listTimeZones,
  parseWallInput,
  searchTimeZones,
  wallToEpoch,
} from '../utils/timeZone'
import { TIME_ZONE_CONVERTER_META } from '../tools/meta/time-zone-converter'

const NY = 'America/New_York'
const LONDON = 'Europe/London'
const KOLKATA = 'Asia/Kolkata'
const TOKYO = 'Asia/Tokyo'
const SYDNEY = 'Australia/Sydney'

function resolve(date: string, time: string, zone: string) {
  const wall = parseWallInput(date, time)
  if (!wall) throw new Error(`bad input ${date} ${time}`)
  return wallToEpoch(wall, zone)
}

describe('parseWallInput', () => {
  it('parses date and time inputs', () => {
    expect(parseWallInput('2026-03-29', '09:05')).toEqual({ year: 2026, month: 3, day: 29, hour: 9, minute: 5 })
  })

  it('rejects malformed or impossible values', () => {
    expect(parseWallInput('', '09:00')).toBeNull()
    expect(parseWallInput('2026-02-30', '09:00')).toBeNull()
    expect(parseWallInput('2026-13-01', '00:00')).toBeNull()
    expect(parseWallInput('2026-01-01', '24:00')).toBeNull()
    expect(parseWallInput('2026-01-01', '9:00')).toBeNull()
  })
})

describe('getOffsetMinutes and formatUtcOffset', () => {
  it('returns half-hour offsets for Asia/Kolkata', () => {
    expect(getOffsetMinutes(KOLKATA, Date.UTC(2026, 0, 15, 12))).toBe(330)
    expect(formatUtcOffset(330)).toBe('UTC+05:30')
  })

  it('formats negative, zero and whole-hour offsets', () => {
    expect(formatUtcOffset(-240)).toBe('UTC-04:00')
    expect(formatUtcOffset(-210)).toBe('UTC-03:30')
    expect(formatUtcOffset(0)).toBe('UTC')
    expect(formatUtcOffset(780)).toBe('UTC+13:00')
  })
})

describe('DST boundaries', () => {
  it('America/New_York spring forward on 2026-03-08: 02:30 does not exist and shifts to 03:30', () => {
    const gap = resolve('2026-03-08', '02:30', NY)
    expect(gap.status).toBe('gap')
    expect(formatWall(epochToZoned(gap.epochMs, NY))).toBe('2026-03-08 03:30')
    expect(getOffsetMinutes(NY, gap.epochMs)).toBe(-240)
  })

  it('America/New_York keeps the offset on either side of spring forward', () => {
    const before = resolve('2026-03-08', '01:59', NY)
    expect(before.status).toBe('ok')
    expect(getOffsetMinutes(NY, before.epochMs)).toBe(-300)
    const after = resolve('2026-03-08', '03:00', NY)
    expect(after.status).toBe('ok')
    expect(getOffsetMinutes(NY, after.epochMs)).toBe(-240)
  })

  it('America/New_York fall back on 2026-11-01: 01:30 happens twice and resolves to the first (EDT)', () => {
    const twice = resolve('2026-11-01', '01:30', NY)
    expect(twice.status).toBe('ambiguous')
    expect(twice.epochMs).toBe(Date.UTC(2026, 10, 1, 5, 30))
    expect(getOffsetMinutes(NY, twice.epochMs)).toBe(-240)
  })

  it('America/New_York after fall back: 02:30 is unambiguous EST', () => {
    const after = resolve('2026-11-01', '02:30', NY)
    expect(after.status).toBe('ok')
    expect(after.epochMs).toBe(Date.UTC(2026, 10, 1, 7, 30))
    expect(getOffsetMinutes(NY, after.epochMs)).toBe(-300)
  })

  it('Europe/London spring forward on 2026-03-29: 01:30 is a gap; 09:00 is BST (+01:00)', () => {
    expect(resolve('2026-03-29', '01:30', LONDON).status).toBe('gap')
    const morning = resolve('2026-03-29', '09:00', LONDON)
    expect(morning.status).toBe('ok')
    expect(morning.epochMs).toBe(Date.UTC(2026, 2, 29, 8, 0))
  })

  it('Europe/London fall back on 2026-10-25: 01:30 happens twice', () => {
    expect(resolve('2026-10-25', '01:30', LONDON).status).toBe('ambiguous')
  })

  it('detects daylight time per instant and for southern hemisphere zones', () => {
    expect(isDaylightTime(NY, Date.UTC(2026, 6, 1, 12))).toBe(true)
    expect(isDaylightTime(NY, Date.UTC(2026, 0, 15, 12))).toBe(false)
    expect(isDaylightTime(LONDON, Date.UTC(2026, 2, 28, 12))).toBe(false)
    expect(isDaylightTime(LONDON, Date.UTC(2026, 2, 30, 12))).toBe(true)
    expect(isDaylightTime(SYDNEY, Date.UTC(2026, 0, 15, 12))).toBe(true)
    expect(isDaylightTime(SYDNEY, Date.UTC(2026, 6, 1, 12))).toBe(false)
    expect(isDaylightTime(KOLKATA, Date.UTC(2026, 6, 1, 12))).toBe(false)
  })
})

describe('buildConversionRows', () => {
  it('shows one instant in each zone, including a half-hour zone', () => {
    const { epochMs } = resolve('2026-03-29', '09:00', NY)
    const rows = buildConversionRows(epochMs, [NY, LONDON, KOLKATA, TOKYO], NY)
    expect(rows.map(row => [row.zone, formatWall(row.wall).slice(11), row.offsetLabel, row.daylight, row.dayDelta])).toEqual([
      [NY, '09:00', 'UTC-04:00', true, 0],
      [LONDON, '14:00', 'UTC+01:00', true, 0],
      [KOLKATA, '18:30', 'UTC+05:30', false, 0],
      [TOKYO, '22:00', 'UTC+09:00', false, 0],
    ])
  })

  it('reports the calendar day shift relative to the source zone', () => {
    const { epochMs } = resolve('2026-03-29', '21:00', NY)
    const rows = buildConversionRows(epochMs, [NY, TOKYO, KOLKATA], NY)
    expect(rows[1]).toMatchObject({ zone: TOKYO, dayDelta: 1 })
    expect(formatWall(rows[1].wall)).toBe('2026-03-30 10:00')
    expect(rows[2]).toMatchObject({ zone: KOLKATA, dayDelta: 1 })
    expect(rows[0].dayDelta).toBe(0)
  })
})

describe('buildPlannerGrid', () => {
  const grid = buildPlannerGrid({
    referenceDate: { year: 2026, month: 3, day: 29, hour: 0, minute: 0 },
    referenceZone: NY,
    zones: [NY, LONDON, KOLKATA],
    workStart: 9,
    workEnd: 17,
  })

  const workingCount = (row: { cells: { working: boolean }[] }) => row.cells.filter(cell => cell.working).length

  it('has 24 columns that start at local midnight of the reference zone', () => {
    expect(grid.columns).toHaveLength(24)
    expect(grid.columns[0].label).toBe('00')
    expect(grid.columns[9].label).toBe('09')
    expect(grid.columns[0].label).not.toContain(':')
    grid.rows.forEach(row => expect(row.cells).toHaveLength(24))
  })

  it('marks eight working hours for each zone, aligned to the same instants', () => {
    grid.rows.forEach(row => expect(workingCount(row)).toBe(8))
    const [newYork, london] = grid.rows
    expect(newYork.cells[9]).toMatchObject({ label: '09', working: true })
    expect(newYork.cells[8].working).toBe(false)
    // London is 5 hours ahead of New York on this date, so London 09:00 is column 4.
    expect(london.cells[4]).toMatchObject({ hour: 9, working: true })
    expect(london.cells[3].working).toBe(false)
  })

  it('labels half-hour cells with their minutes and marks them correctly', () => {
    const kolkata = grid.rows[2]
    expect(kolkata.offsetLabel).toBe('UTC+05:30')
    expect(kolkata.cells[0]).toMatchObject({ label: '09:30', working: true })
    expect(kolkata.cells[7].working).toBe(true)
    expect(kolkata.cells[8].working).toBe(false)
  })
})

describe('isWorkingHour', () => {
  it('handles plain and overnight windows', () => {
    expect(isWorkingHour(9, 9, 17)).toBe(true)
    expect(isWorkingHour(16, 9, 17)).toBe(true)
    expect(isWorkingHour(17, 9, 17)).toBe(false)
    expect(isWorkingHour(8, 9, 17)).toBe(false)
    expect(isWorkingHour(9, 9, 9)).toBe(false)
    expect(isWorkingHour(22, 20, 6)).toBe(true)
    expect(isWorkingHour(5, 20, 6)).toBe(true)
    expect(isWorkingHour(12, 20, 6)).toBe(false)
  })
})

describe('buildSummaryLine', () => {
  it('writes one line with the source and each other zone', () => {
    const { epochMs } = resolve('2026-03-29', '09:00', NY)
    const rows = buildConversionRows(epochMs, [NY, LONDON, KOLKATA], NY)
    expect(buildSummaryLine(NY, epochMs, rows)).toBe(
      '2026-03-29 09:00 America/New_York (UTC-04:00) = Europe/London 14:00 (UTC+01:00); Asia/Kolkata 18:30 (UTC+05:30)',
    )
  })

  it('notes when a zone is on another calendar day', () => {
    const { epochMs } = resolve('2026-03-29', '21:00', NY)
    const rows = buildConversionRows(epochMs, [NY, TOKYO], NY)
    expect(buildSummaryLine(NY, epochMs, rows)).toContain('Asia/Tokyo 10:00 (UTC+09:00) (next day)')
  })

  it('returns only the source when no other zones are selected', () => {
    const { epochMs } = resolve('2026-03-29', '09:00', NY)
    const rows = buildConversionRows(epochMs, [NY], NY)
    expect(buildSummaryLine(NY, epochMs, rows)).toBe('2026-03-29 09:00 America/New_York (UTC-04:00)')
  })
})

describe('zone list and search', () => {
  it('merges Intl results with the common list, de-duplicated and sorted', () => {
    const merged = buildTimeZoneList(() => ['Europe/Paris', 'Europe/Paris', 'Asia/Calcutta'])
    expect(merged).toContain('Europe/Paris')
    expect(merged).toContain('Asia/Calcutta')
    expect(merged).toContain(KOLKATA)
    expect(merged).toContain('UTC')
    expect(new Set(merged).size).toBe(merged.length)
    expect([...merged]).toEqual([...merged].sort())
  })

  it('uses the common list when supportedValuesOf is missing or throws', () => {
    expect(buildTimeZoneList(undefined)).toEqual([...FALLBACK_TIME_ZONES].sort())
    expect(
      buildTimeZoneList(() => {
        throw new Error('unsupported')
      }),
    ).toEqual([...FALLBACK_TIME_ZONES].sort())
  })

  it('lists zones from the runtime and every fallback zone is valid', () => {
    expect(listTimeZones()).toContain(KOLKATA)
    expect(listTimeZones()).toContain('UTC')
    FALLBACK_TIME_ZONES.forEach(zone => expect(isValidTimeZone(zone)).toBe(true))
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false)
  })

  it('derives a city name from the last IANA segment', () => {
    expect(cityName('America/Argentina/Buenos_Aires')).toBe('Buenos Aires')
    expect(cityName(KOLKATA)).toBe('Kolkata')
  })

  it('searches by city or IANA name, prefix matches first', () => {
    const zones = listTimeZones()
    expect(searchTimeZones('kolk', zones)).toEqual([KOLKATA])
    expect(searchTimeZones('new york', zones)[0]).toBe(NY)
    expect(searchTimeZones('america/new', zones)[0]).toBe(NY)
    expect(searchTimeZones('Tokyo', [...FALLBACK_TIME_ZONES])).toEqual([TOKYO])
    expect(searchTimeZones('europe', [...FALLBACK_TIME_ZONES], 3)).toHaveLength(3)
    expect(searchTimeZones('   ', zones)).toEqual([])
  })

  it('exposes sensible defaults', () => {
    expect(DEFAULT_SOURCE_ZONE).toBe(NY)
    expect(DEFAULT_ZONES).toEqual([LONDON, KOLKATA, TOKYO])
  })
})

describe('TIME_ZONE_CONVERTER_META', () => {
  it('describes the tool and has a worked example', () => {
    expect(TIME_ZONE_CONVERTER_META.slug).toBe('time-zone-converter')
    expect(TIME_ZONE_CONVERTER_META.guide?.steps?.length).toBeGreaterThan(0)
    expect(TIME_ZONE_CONVERTER_META.guide?.example).toBeDefined()
  })
})
