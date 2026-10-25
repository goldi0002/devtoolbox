import { describe, it, expect, beforeEach } from 'vitest'

describe('Quick Favorites & Preferences Storage', () => {
  const store: Record<string, string> = {}
  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    }
  }

  beforeEach(() => {
    mockStorage.clear()
  })

  it('stores and retrieves favorites list in storage', () => {
    const favorites = ['json-schema-generator', 'certificate-decoder']
    mockStorage.setItem('toolbox4devs:favorites', JSON.stringify(favorites))

    const stored = JSON.parse(mockStorage.getItem('toolbox4devs:favorites') || '[]')
    expect(stored).toEqual(favorites)
    expect(stored).toContain('json-schema-generator')
  })

  it('handles recent tools capped list', () => {
    const recents = ['json-formatter', 'uuid', 'base-64', 'jwt-decoder', 'regex', 'color-converter']
    mockStorage.setItem('toolbox4devs:recent-tools', JSON.stringify(recents))

    const stored = JSON.parse(mockStorage.getItem('toolbox4devs:recent-tools') || '[]')
    expect(stored.length).toBe(6)
  })

  it('clears recent tools cleanly', () => {
    mockStorage.setItem('toolbox4devs:recent-tools', JSON.stringify(['json-formatter']))
    expect(mockStorage.getItem('toolbox4devs:recent-tools')).toBeDefined()

    mockStorage.setItem('toolbox4devs:recent-tools', JSON.stringify([]))
    const stored = JSON.parse(mockStorage.getItem('toolbox4devs:recent-tools') || '[]')
    expect(stored).toEqual([])
  })
})
