import { describe, it, expect } from 'vitest'
import {
  tools,
  isAvailable,
  isComingSoon,
  getToolBySlug,
  getFeaturedTools,
  getAllAvailableTools,
  getToolCategories,
  categoryLabels,
} from '../tools/registry'

describe('tool registry', () => {
  it('contains unique slugs for every tool', () => {
    const slugs = tools.map((t) => t.slug)
    const uniqueSlugs = new Set(slugs)
    expect(slugs.length).toBe(uniqueSlugs.size)
  })

  it('every tool has valid category and name', () => {
    tools.forEach((t) => {
      expect(t.name).toBeTruthy()
      expect(t.slug).toBeTruthy()
      expect(t.category).toBeTruthy()
      expect(categoryLabels[t.category]).toBeDefined()
    })
  })

  it('correctly identifies available and coming soon tools', () => {
    const jsonTool = getToolBySlug('json-formatter')
    expect(jsonTool).toBeDefined()
    if (jsonTool) {
      expect(isAvailable(jsonTool)).toBe(true)
      expect(isComingSoon(jsonTool)).toBe(false)
    }
  })

  it('retrieves categories correctly', () => {
    const categories = getToolCategories()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories.some((c) => c.category === 'json-tools')).toBe(true)
  })

  it('retrieves featured tools', () => {
    const featured = getFeaturedTools()
    expect(Array.isArray(featured)).toBe(true)
  })

  it('retrieves all available tools', () => {
    const available = getAllAvailableTools()
    expect(available.length).toBeGreaterThan(0)
  })
})
