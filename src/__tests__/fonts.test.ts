import { describe, it, expect } from 'vitest'
import {
  SANS_FONTS,
  MONO_FONTS,
  getInitialSansFont,
  getInitialMonoFont
} from '../utils/fonts'

describe('Font Switcher & Custom Typography utilities', () => {
  it('provides default standard typography choices', () => {
    expect(SANS_FONTS.length).toBeGreaterThanOrEqual(4)
    expect(MONO_FONTS.length).toBeGreaterThanOrEqual(3)
    expect(SANS_FONTS.some(f => f.id === 'dm-sans')).toBe(true)
    expect(MONO_FONTS.some(f => f.id === 'jetbrains-mono')).toBe(true)
  })

  it('initializes with default fonts if in node/non-browser environment', () => {
    expect(getInitialSansFont()).toBe('dm-sans')
    expect(getInitialMonoFont()).toBe('jetbrains-mono')
  })

  it('contains valid CSS font families for every choice', () => {
    SANS_FONTS.forEach(font => {
      expect(font.id).toBeTruthy()
      expect(font.label).toBeTruthy()
      expect(font.family).toBeTruthy()
      expect(font.sample).toBeTruthy()
    })

    MONO_FONTS.forEach(font => {
      expect(font.id).toBeTruthy()
      expect(font.label).toBeTruthy()
      expect(font.family).toBeTruthy()
      expect(font.sample).toBeTruthy()
    })
  })
})
