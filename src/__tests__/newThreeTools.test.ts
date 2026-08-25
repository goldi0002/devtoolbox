import { describe, it, expect } from 'vitest'
import { tools } from '../tools/registry'
import { getAllAvailableTools } from '../tools/registry'

describe('New Tools Suite (WCAG Contrast Checker, SemVer Calculator, JSON to SQL)', () => {
  it('registers all 3 new tools in the client-side registry', () => {
    const slugs = tools.map(t => t.slug)
    expect(slugs).toContain('wcag-contrast-checker')
    expect(slugs).toContain('semver-calculator')
    expect(slugs).toContain('json-to-sql')
  })

  it('registers all 3 new tools in the node/SSG registry', () => {
    const nodeTools = getAllAvailableTools()
    const nodeSlugs = nodeTools.map(t => t.slug)
    expect(nodeSlugs).toContain('wcag-contrast-checker')
    expect(nodeSlugs).toContain('semver-calculator')
    expect(nodeSlugs).toContain('json-to-sql')
  })

  it('has consistent metadata, valid categories, and valid about sections', () => {
    const wcag = tools.find(t => t.slug === 'wcag-contrast-checker')
    expect(wcag).toBeDefined()
    expect(wcag?.category).toBe('web-tools')
    expect(wcag?.about?.features.length).toBeGreaterThan(2)

    const semver = tools.find(t => t.slug === 'semver-calculator')
    expect(semver).toBeDefined()
    expect(semver?.category).toBe('data-tools')
    expect(semver?.about?.useCases.length).toBeGreaterThan(2)

    const jsonToSql = tools.find(t => t.slug === 'json-to-sql')
    expect(jsonToSql).toBeDefined()
    expect(jsonToSql?.category).toBe('data-tools')
    expect(jsonToSql?.about?.tip).toBeTruthy()
  })

  it('verifies exact total tool count matches across registries', () => {
    expect(tools.length).toBe(getAllAvailableTools().length)
    expect(tools.length).toBeGreaterThanOrEqual(57)
  })
})
