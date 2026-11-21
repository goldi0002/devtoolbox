import { describe, it, expect } from 'vitest'
import { parseSemVer, compareSemVer } from '../utils/semver'
import { evaluateComparatorRange, hasComparatorOperator } from '../utils/semverRange'

const check = (version: string, range: string) =>
  evaluateComparatorRange(parseSemVer(version), range)?.satisfies

describe('SemVer shared parse/compare', () => {
  it('orders versions by SemVer 2.0.0 precedence', () => {
    const v = (s: string) => parseSemVer(s)
    expect(compareSemVer(v('1.0.0-alpha'), v('1.0.0'))).toBeLessThan(0)
    expect(compareSemVer(v('1.0.0-alpha.1'), v('1.0.0-alpha.beta'))).toBeLessThan(0)
    expect(compareSemVer(v('1.0.0-rc.2'), v('1.0.0-rc.10'))).toBeLessThan(0)
    expect(compareSemVer(v('1.0.0+build.1'), v('1.0.0+build.2'))).toBe(0)
  })
})

describe('comparison operators', () => {
  it('supports >, >=, <, <= and =', () => {
    expect(check('2.0.0', '>1.9.9')).toBe(true)
    expect(check('2.0.0', '>2.0.0')).toBe(false)
    expect(check('2.0.0', '>=2.0.0')).toBe(true)
    expect(check('1.9.9', '<2.0.0')).toBe(true)
    expect(check('2.0.0', '<2.0.0')).toBe(false)
    expect(check('2.0.0', '<=2.0.0')).toBe(true)
    expect(check('2.0.1', '<=2.0.0')).toBe(false)
    expect(check('1.2.3', '=1.2.3')).toBe(true)
    expect(check('1.2.4', '=1.2.3')).toBe(false)
  })

  it('accepts a space between the operator and the version', () => {
    expect(check('1.5.0', '>= 1.2.0')).toBe(true)
    expect(check('1.5.0', '< 2.0.0')).toBe(true)
  })

  it('accepts a leading v on the comparator version', () => {
    expect(check('1.5.0', '>=v1.2.0')).toBe(true)
  })

  it('compares numeric parts numerically, not as strings', () => {
    expect(check('10.0.0', '>9.0.0')).toBe(true)
    expect(check('1.10.0', '>1.9.0')).toBe(true)
  })

  it('ignores build metadata', () => {
    expect(check('1.2.0+build.5', '>=1.2.0')).toBe(true)
    expect(check('1.2.0+build.5', '>1.2.0')).toBe(false)
  })
})

describe('space-separated AND sets', () => {
  it('requires every comparator to hold', () => {
    expect(check('1.5.0', '>=1.2.0 <2.0.0')).toBe(true)
    expect(check('1.2.0', '>=1.2.0 <2.0.0')).toBe(true)
    expect(check('1.1.9', '>=1.2.0 <2.0.0')).toBe(false)
    expect(check('2.0.0', '>=1.2.0 <2.0.0')).toBe(false)
  })

  it('handles operator/version spacing inside a set', () => {
    expect(check('1.5.0', '>= 1.2.0 < 2.0.0')).toBe(true)
    expect(check('2.0.0', '>= 1.2.0 < 2.0.0')).toBe(false)
  })

  it('treats a bare version inside a set as exact', () => {
    expect(check('1.2.3', '1.2.3 >=1.0.0')).toBe(true)
    expect(check('1.2.4', '1.2.3 >=1.0.0')).toBe(false)
  })
})

describe('pre-release versions', () => {
  it('matches the Prerelease RC preset: 2.0.0-rc.1 satisfies >=2.0.0-alpha', () => {
    expect(check('2.0.0-rc.1', '>=2.0.0-alpha')).toBe(true)
  })

  it('orders pre-release tags within the same tuple', () => {
    expect(check('2.0.0-alpha', '>=2.0.0-alpha')).toBe(true)
    expect(check('2.0.0-alpha.1', '>=2.0.0-alpha')).toBe(true)
    expect(check('2.0.0-beta', '>=2.0.0-alpha')).toBe(true)
    expect(check('2.0.0-alpha', '>2.0.0-alpha')).toBe(false)
    expect(check('2.0.0-rc.1', '<2.0.0-beta')).toBe(false)
    expect(check('2.0.0-beta', '<2.0.0-rc.1')).toBe(true)
  })

  it('treats a release as greater than its pre-releases', () => {
    expect(check('2.0.0', '>2.0.0-rc.1')).toBe(true)
    expect(check('2.0.0', '<=2.0.0-rc.1')).toBe(false)
  })

  it('does not match a pre-release when no comparator names a pre-release on that tuple', () => {
    expect(check('2.0.0-rc.1', '>=1.0.0')).toBe(false)
    expect(check('2.0.0-rc.1', '<3.0.0')).toBe(false)
    expect(check('2.0.0-rc.1', '>=1.0.0 <3.0.0')).toBe(false)
  })

  it('still matches a pre-release inside an AND set that names a pre-release on the same tuple', () => {
    expect(check('2.0.0-rc.1', '>=2.0.0-alpha <2.0.0')).toBe(true)
    expect(check('2.0.0-rc.1', '>=2.0.0-alpha <2.0.0-rc.1')).toBe(false)
  })

  it('explains the pre-release rule', () => {
    const result = evaluateComparatorRange(parseSemVer('2.0.0-rc.1'), '>=1.0.0')
    expect(result?.satisfies).toBe(false)
    expect(result?.explanation).toContain('only matches when a comparator names a pre-release')
  })
})

describe('OR clauses and existing forms', () => {
  it('returns null for ranges without comparison operators so existing handling applies', () => {
    expect(evaluateComparatorRange(parseSemVer('1.4.2'), '^1.2.0')).toBeNull()
    expect(evaluateComparatorRange(parseSemVer('0.3.5'), '~0.3.0')).toBeNull()
    expect(evaluateComparatorRange(parseSemVer('1.4.2'), '*')).toBeNull()
    expect(evaluateComparatorRange(parseSemVer('1.2.3'), '1.2.3')).toBeNull()
    expect(hasComparatorOperator('^1.2.0')).toBe(false)
    expect(hasComparatorOperator('>=1.2.0')).toBe(true)
  })

  it('reports an invalid version without a comparator error', () => {
    const result = evaluateComparatorRange(parseSemVer('1.2'), '>=1.0.0')
    expect(result).toEqual({ satisfies: false, explanation: 'Invalid version string' })
  })

  it('rejects comparators without a full version', () => {
    const partial = evaluateComparatorRange(parseSemVer('1.5.0'), '>=1.2')
    expect(partial?.satisfies).toBe(false)
    expect(partial?.explanation).toContain('Invalid comparator ">=1.2"')

    const dangling = evaluateComparatorRange(parseSemVer('1.5.0'), '>=')
    expect(dangling?.satisfies).toBe(false)
  })
})
