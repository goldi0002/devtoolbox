import { describe, it, expect } from 'vitest'
import { getToolBySlug } from '../tools/registry'

describe('CSV/TXT Viewer Tool setup', () => {
  it('has proper tool metadata conforming to ToolMeta interface', () => {
    const tool = getToolBySlug('csv-txt-viewer')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('Large CSV & TXT File Table Viewer')
    expect(tool?.slug).toBe('csv-txt-viewer')
    expect(tool?.category).toBe('data-tools')
    expect(tool?.tag).toBe('DATA')
    expect(tool?.status).toBe('stable')
    expect(tool?.toolComponent).toBeDefined()
    expect(tool?.seo?.title).toBeDefined()
    expect(tool?.about.features.length).toBeGreaterThan(2)
    expect(tool?.about.useCases.length).toBeGreaterThan(1)
  })
})
