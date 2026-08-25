import { describe, it, expect } from 'vitest'
import { tools, getToolBySlug } from '../tools/registry'
import { getAllAvailableTools } from '../tools/registry'

describe('Tool registry count after adding QR Code Scanner and new tools', () => {
  it('registers exactly 69 tools in client registry', () => {
    expect(tools.length).toBe(69)
  })

  it('registers exactly 69 tools in Node SSG registry', () => {
    expect(getAllAvailableTools().length).toBe(69)
  })

  it('contains qr-code-generator with proper metadata', () => {
    const tool = getToolBySlug('qr-code-generator')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('QR Code Generator')
    expect(tool?.category).toBe('generate-tools')
    expect(tool?.keywords.length).toBeGreaterThan(4)
    expect(tool?.about.features.length).toBeGreaterThan(3)
  })

  it("contains gitignore-generator with proper metadata", () => {
    const tool = getToolBySlug("gitignore-generator")
    expect(tool).toBeDefined()
    expect(tool?.name).toBe(".gitignore Generator")
    expect(tool?.category).toBe("generate-tools")
    expect(tool?.toolComponent).toBeDefined()
  })

  it('ensures all 69 tools have unique slugs and valid categories', () => {
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
