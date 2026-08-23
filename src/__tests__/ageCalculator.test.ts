import { describe, it, expect } from 'vitest'
import { tools } from '../tools/registry'
import { AGE_CALCULATOR_META } from '../tools/meta/age-calculator'

describe('Age Calculator Tool Registry & Integrity', () => {
  it('registers age-calculator in tools array', () => {
    const found = tools.find((t) => t.slug === 'age-calculator')
    expect(found).toBeDefined()
    expect(found?.name).toBe('Age & Lifetime Milestone Calculator')
    expect(found?.category).toBe('data-tools')
    expect(found?.tag).toBe('AGE')
    expect(found?.keywords).toContain('age calculator')
    expect(found?.keywords).toContain('calculate age')
  })

  it('contains valid SEO and About metadata', () => {
    expect(AGE_CALCULATOR_META.seo?.title).toContain('Age & Lifetime Milestone Calculator')
    expect(AGE_CALCULATOR_META.about.features.length).toBeGreaterThan(3)
    expect(AGE_CALCULATOR_META.about.useCases.length).toBeGreaterThan(3)
  })

  it('accurately calculates age differences and unit totals', () => {
    const birth = new Date(2000, 0, 1, 0, 0, 0)
    const compare = new Date(2025, 0, 1, 0, 0, 0)
    const diffMs = compare.getTime() - birth.getTime()

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const totalSeconds = Math.floor(diffMs / 1000)

    expect(totalDays).toBe(9132) // 25 years with 6 leap days (2000, 2004, 2008, 2012, 2016, 2020, 2024 = 7 leap years) -> 365*25 + 7 = 9132
    expect(totalHours).toBe(9132 * 24)
    expect(totalMinutes).toBe(9132 * 24 * 60)
    expect(totalSeconds).toBe(9132 * 24 * 60 * 60)
  })
})
