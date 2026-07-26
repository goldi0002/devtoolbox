import { describe, it, expect } from 'vitest'
import {
  tools,
  categoryLabels,
  isAvailable,
  isCommingSoon,
  getToolBadge,
  getAvailableToolsByCategory,
  getToolBySlug,
  getFeaturedTools,
  getAllAvailableTools,
  getToolCategories,
} from './registry'
import { ToolMeta } from './tool-meta'

const makeTool = (overrides: Partial<ToolMeta> = {}): ToolMeta => ({
  slug: 'sample',
  name: 'Sample',
  description: 'A sample tool',
  about: { summary: '', useCases: [], features: [] },
  category: 'text-tools',
  tag: 'sample',
  keywords: [],
  ...overrides,
})

describe('isAvailable', () => {
  it('treats stable, beta and status-less tools as available', () => {
    expect(isAvailable(makeTool({ status: 'stable' }))).toBe(true)
    expect(isAvailable(makeTool({ status: 'beta' }))).toBe(true)
    expect(isAvailable(makeTool({ status: undefined }))).toBe(true)
  })

  it('treats coming-soon and deprecated tools as unavailable', () => {
    expect(isAvailable(makeTool({ status: 'coming-soon' }))).toBe(false)
    expect(isAvailable(makeTool({ status: 'deprecated' }))).toBe(false)
  })
})

describe('isCommingSoon', () => {
  it('is true only for coming-soon tools', () => {
    expect(isCommingSoon(makeTool({ status: 'coming-soon' }))).toBe(true)
    expect(isCommingSoon(makeTool({ status: 'stable' }))).toBe(false)
    expect(isCommingSoon(makeTool())).toBe(false)
  })
})

describe('getToolBadge', () => {
  it('prioritises coming-soon with an eta', () => {
    expect(getToolBadge(makeTool({ status: 'coming-soon', eta: 'Q2 2026' }))).toBe('Coming Q2 2026')
  })

  it('falls back to "Soon" for coming-soon without an eta', () => {
    expect(getToolBadge(makeTool({ status: 'coming-soon' }))).toBe('Soon')
  })

  it('labels beta and deprecated tools', () => {
    expect(getToolBadge(makeTool({ status: 'beta' }))).toBe('Beta')
    expect(getToolBadge(makeTool({ status: 'deprecated' }))).toBe('Deprecated')
  })

  it('shows a New badge for new tools', () => {
    expect(getToolBadge(makeTool({ isNew: true }))).toBe('New')
  })

  it('returns null when there is nothing noteworthy', () => {
    expect(getToolBadge(makeTool({ status: 'stable' }))).toBeNull()
  })
})

describe('registry queries over real tool data', () => {
  it('exposes a non-empty tool list', () => {
    expect(tools.length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = tools.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('getAllAvailableTools returns only available tools', () => {
    const available = getAllAvailableTools()
    expect(available.every(isAvailable)).toBe(true)
    expect(available.length).toBe(tools.filter(isAvailable).length)
  })

  it('getFeaturedTools returns only featured, available tools', () => {
    for (const tool of getFeaturedTools()) {
      expect(tool.featured).toBe(true)
      expect(isAvailable(tool)).toBe(true)
    }
  })

  it('getToolBySlug finds an existing tool and misses unknown slugs', () => {
    const first = tools[0]
    expect(getToolBySlug(first.slug)).toBe(first)
    expect(getToolBySlug('definitely-not-a-real-slug')).toBeUndefined()
  })

  it('getAvailableToolsByCategory filters by category and availability', () => {
    const category = tools[0].category
    const result = getAvailableToolsByCategory(category)
    for (const tool of result) {
      expect(tool.category).toBe(category)
      expect(isAvailable(tool)).toBe(true)
    }
  })

  it('getToolCategories returns unique categories with labels', () => {
    const categories = getToolCategories()
    const keys = categories.map(c => c.category)
    expect(new Set(keys).size).toBe(keys.length)
    for (const { category, label } of categories) {
      expect(label).toBe(categoryLabels[category])
    }
  })
})
