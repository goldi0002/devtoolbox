import { describe, it, expect } from 'vitest'
import { getEditorLanguageExtension } from '../lib/editorLanguage'

describe('editorLanguage helper', () => {
  it('returns appropriate extensions for supported languages', () => {
    expect(getEditorLanguageExtension('javascript').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('ts').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('json').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('html').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('css').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('sql').length).toBeGreaterThan(0)
    expect(getEditorLanguageExtension('markdown').length).toBeGreaterThan(0)
  })

  it('returns empty array for plain text or unknown language', () => {
    expect(getEditorLanguageExtension('text')).toEqual([])
    expect(getEditorLanguageExtension('unknown-lang')).toEqual([])
    expect(getEditorLanguageExtension('')).toEqual([])
  })
})
