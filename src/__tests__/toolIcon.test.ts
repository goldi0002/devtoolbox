import { describe, it, expect } from 'vitest'
import {
  resolveToolIcon,
  ICON_MAP,
  SLUG_ICON_MAP,
  CATEGORY_ICON_MAP,
  CATEGORY_STYLE_MAP,
} from '../lib/icons'
import { tools } from '../tools/registry'
import { Braces, Fingerprint, Globe, Wrench } from 'lucide-react'

describe('centralized tool icon library strategy', () => {
  it('resolves explicit icon name when provided', () => {
    const icon = resolveToolIcon('Braces')
    expect(icon).toBe(Braces)
  })

  it('resolves icon by slug accurately for tools in the registry', () => {
    expect(resolveToolIcon(undefined, 'json-formatter')).toBe(Braces)
    expect(resolveToolIcon(undefined, 'sha-256')).toBe(Fingerprint)
    expect(resolveToolIcon(undefined, 'curl-converter')).toBe(Globe)
  })

  it('falls back to category default when slug is unknown', () => {
    const icon = resolveToolIcon(undefined, 'unknown-custom-slug', 'json-tools')
    expect(icon).toBe(Braces)
  })

  it('falls back to Wrench when both slug and category are undefined or unknown', () => {
    const icon = resolveToolIcon(undefined, 'non-existent-tool', 'non-existent-category')
    expect(icon).toBe(Wrench)
  })

  it('every category in the tool registry has a valid icon in CATEGORY_ICON_MAP', () => {
    const categories = Array.from(new Set(tools.map((t) => t.category)))
    categories.forEach((cat) => {
      expect(CATEGORY_ICON_MAP[cat]).toBeDefined()
    })
  })

  it('every category has matching badge styling tokens in CATEGORY_STYLE_MAP', () => {
    const categories = Array.from(new Set(tools.map((t) => t.category)))
    categories.forEach((cat) => {
      const style = CATEGORY_STYLE_MAP[cat]
      expect(style).toBeDefined()
      expect(style.text).toContain('text-')
      expect(style.bg).toContain('bg-')
      expect(style.border).toContain('border-')
    })
  })

  it('every registered tool in tools has a resolvable icon', () => {
    tools.forEach((tool) => {
      const resolved = resolveToolIcon(tool.icon, tool.slug, tool.category)
      expect(resolved).toBeDefined()
      expect(typeof resolved).toBe('object') // Lucide components are React forwardRef objects
    })
  })
})
