import { describe, it, expect } from 'vitest'
import {
  CHANGE_TYPE_STYLES,
  formatMonth,
  getChangelog,
  getStyledChangelog,
  getChangelogByMonth,
  getStyledChangelogByMonth,
  getChangelogByType,
  getRecentChangelog,
  getChangelogStats,
} from './changelog'

describe('formatMonth', () => {
  it('formats a valid YYYY-MM string into a human-readable month', () => {
    expect(formatMonth('2026-03')).toBe('March 2026')
    expect(formatMonth('2026-01')).toBe('January 2026')
    expect(formatMonth('2026-12')).toBe('December 2026')
  })

  it('returns the input unchanged when the month index is out of range', () => {
    expect(formatMonth('2026-13')).toBe('2026-13')
    expect(formatMonth('2026-00')).toBe('2026-00')
  })
})

describe('getChangelog', () => {
  it('returns a non-empty list sorted newest first', () => {
    const entries = getChangelog()
    expect(entries.length).toBeGreaterThan(0)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].date >= entries[i].date).toBe(true)
    }
  })
})

describe('getStyledChangelog', () => {
  it('attaches the correct style string for every entry type', () => {
    for (const entry of getStyledChangelog()) {
      expect(entry.style).toBe(CHANGE_TYPE_STYLES[entry.type])
    }
  })

  it('preserves the number of entries', () => {
    expect(getStyledChangelog()).toHaveLength(getChangelog().length)
  })
})

describe('getChangelogByMonth', () => {
  it('groups entries by their YYYY-MM prefix', () => {
    const grouped = getChangelogByMonth()
    let total = 0
    for (const [key, entries] of grouped) {
      expect(key).toMatch(/^\d{4}-\d{2}$/)
      for (const entry of entries) {
        expect(entry.date.slice(0, 7)).toBe(key)
      }
      total += entries.length
    }
    expect(total).toBe(getChangelog().length)
  })
})

describe('getStyledChangelogByMonth', () => {
  it('groups by month and attaches styles', () => {
    const grouped = getStyledChangelogByMonth()
    for (const entries of grouped.values()) {
      for (const entry of entries) {
        expect(entry.style).toBe(CHANGE_TYPE_STYLES[entry.type])
      }
    }
  })
})

describe('getChangelogByType', () => {
  it('returns only entries of the requested type', () => {
    const newEntries = getChangelogByType('new')
    expect(newEntries.length).toBeGreaterThan(0)
    expect(newEntries.every(e => e.type === 'new')).toBe(true)
  })

  it('returns an empty array for a type with no entries', () => {
    expect(getChangelogByType('improved')).toEqual([])
  })
})

describe('getRecentChangelog', () => {
  it('returns the N most recent styled entries', () => {
    const recent = getRecentChangelog(2)
    expect(recent).toHaveLength(2)
    expect(recent[0].date).toBe(getChangelog()[0].date)
    expect(recent[0].style).toBe(CHANGE_TYPE_STYLES[recent[0].type])
  })

  it('defaults to three entries', () => {
    expect(getRecentChangelog()).toHaveLength(3)
  })

  it('caps at the total number of entries', () => {
    const all = getChangelog().length
    expect(getRecentChangelog(all + 10)).toHaveLength(all)
  })
})

describe('getChangelogStats', () => {
  it('reports totals that match the underlying data', () => {
    const stats = getChangelogStats()
    const entries = getChangelog()
    expect(stats.total).toBe(entries.length)
    expect(stats.new).toBe(entries.filter(e => e.type === 'new').length)
    expect(stats.improved).toBe(entries.filter(e => e.type === 'improved').length)
    expect(stats.fixed).toBe(entries.filter(e => e.type === 'fixed').length)
    expect(stats.new + stats.improved + stats.fixed).toBe(stats.total)
  })
})
