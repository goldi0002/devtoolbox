import { describe, it, expect } from 'vitest'
import {
  getCachedEditorLanguage,
  loadEditorLanguageExtension,
  resolveEditorLanguage,
} from '../lib/editorLanguage'

describe('editorLanguage helper', () => {
  it('resolves language names and aliases', () => {
    expect(resolveEditorLanguage('JS')).toBe('javascript')
    expect(resolveEditorLanguage('tsx')).toBe('typescript')
    expect(resolveEditorLanguage(' md ')).toBe('markdown')
    expect(resolveEditorLanguage('svg')).toBe('xml')
    expect(resolveEditorLanguage('text')).toBeNull()
    expect(resolveEditorLanguage('')).toBeNull()
  })

  it('loads extensions for supported languages', async () => {
    for (const lang of ['javascript', 'ts', 'json', 'html', 'css', 'xml', 'sql', 'markdown']) {
      expect((await loadEditorLanguageExtension(lang)).length).toBeGreaterThan(0)
    }
  })

  it('returns empty array for plain text or unknown language', async () => {
    expect(await loadEditorLanguageExtension('text')).toEqual([])
    expect(await loadEditorLanguageExtension('unknown-lang')).toEqual([])
    expect(await loadEditorLanguageExtension('')).toEqual([])
  })

  it('caches loaded languages for synchronous reuse', async () => {
    const loaded = await loadEditorLanguageExtension('css')
    expect(getCachedEditorLanguage('css')).toBe(loaded)
    expect(getCachedEditorLanguage('unknown-lang')).toEqual([])
  })
})
