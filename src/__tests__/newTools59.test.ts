import { describe, it, expect } from 'vitest'
import { tools, getToolBySlug } from '../tools/registry'
import { getAllAvailableTools } from '../tools/registry-node'

describe('New Tools (#58 and #59): Docker Run to Compose & SVG to JSX', () => {
  it('registers tools in client registry', () => {
    expect(tools.length).toBeGreaterThanOrEqual(59)
  })

  it('registers tools in Node SSG registry', () => {
    expect(getAllAvailableTools().length).toBeGreaterThanOrEqual(59)
  })

  it('contains docker-run-to-compose with proper metadata', () => {
    const tool = getToolBySlug('docker-run-to-compose')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('Docker Run to Compose Converter')
    expect(tool?.category).toBe('generate-tools')
    expect(tool?.keywords.length).toBeGreaterThan(3)
    expect(tool?.about.features.length).toBeGreaterThan(2)
  })

  it('contains svg-to-jsx with proper metadata', () => {
    const tool = getToolBySlug('svg-to-jsx')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('SVG to JSX / React Converter')
    expect(tool?.category).toBe('web-tools')
    expect(tool?.keywords.length).toBeGreaterThan(3)
    expect(tool?.about.features.length).toBeGreaterThan(2)
  })

  it('ensures all 59 tools have unique slugs and defined properties', () => {
    const slugs = new Set<string>()
    tools.forEach(t => {
      expect(t.slug).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.category).toBeTruthy()
      expect(slugs.has(t.slug)).toBe(false)
      slugs.add(t.slug)
    })
  })
})
