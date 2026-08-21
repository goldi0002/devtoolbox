import { describe, it, expect } from 'vitest'
import { tools, getToolBySlug } from '../tools/registry'
import { getAllAvailableTools } from '../tools/registry-node'

describe('QR Code Generator Tool (#60)', () => {
  it('registers exactly 60 tools in client registry', () => {
    expect(tools.length).toBe(60)
  })

  it('registers exactly 60 tools in Node SSG registry', () => {
    expect(getAllAvailableTools().length).toBe(60)
  })

  it('contains qr-code-generator with proper metadata', () => {
    const tool = getToolBySlug('qr-code-generator')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('QR Code Generator')
    expect(tool?.category).toBe('generate-tools')
    expect(tool?.keywords.length).toBeGreaterThan(4)
    expect(tool?.about.features.length).toBeGreaterThan(3)
  })

  it('ensures all 60 tools have unique slugs and valid categories', () => {
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
