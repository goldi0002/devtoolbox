import { describe, it, expect } from 'vitest'
import { getHarmonies, hexToRgb, hslToRgb, parseColor, rgbToHex, rgbToHsl, rotateHue } from '../utils/color'

const harmoniesOf = (hex: string) =>
  Object.fromEntries(getHarmonies(hexToRgb(hex)!).map((h) => [h.kind, h.swatches.map((s) => s.hex)]))

describe('color conversion', () => {
  it('parses HEX, short HEX, RGB and HSL to the same normalized values', () => {
    const expected = { hex: '#7C3AED', rgb: { r: 124, g: 58, b: 237 }, hsl: { h: 262, s: 83, l: 58 } }
    expect(parseColor('#7c3aed')).toEqual(expected)
    expect(parseColor('rgb(124, 58, 237)')).toEqual(expected)
    expect(parseColor('#abc').hex).toBe('#AABBCC')
    expect(parseColor('hsl(0, 100%, 50%)').hex).toBe('#FF0000')
    expect(parseColor('hsl(262, 83%, 58%)').hex).toBe(rgbToHex(hslToRgb({ h: 262, s: 83, l: 58 })))
    expect(parseColor('HSL(120,100%,25%)').hex).toBe('#008000')
  })

  it('does not read an out-of-range HSL value as RGB', () => {
    expect(parseColor('hsl(0, 150%, 50%)').error).toContain('valid HEX, RGB, or HSL')
  })

  it('reports invalid input and falls back to the sample color', () => {
    const result = parseColor('not a color')
    expect(result.error).toContain('valid HEX, RGB, or HSL')
    expect(result.hex.toUpperCase()).toBe('#7C3AED')
  })

  it('round-trips primaries through HSL exactly', () => {
    for (const hex of ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000']) {
      expect(rgbToHex(hslToRgb(rgbToHsl(hexToRgb(hex)!)))).toBe(hex)
    }
  })
})

describe('getHarmonies', () => {
  it('returns complementary, analogous and triadic groups in order', () => {
    const groups = getHarmonies(hexToRgb('#FF0000')!)
    expect(groups.map((g) => g.kind)).toEqual(['complementary', 'analogous', 'triadic'])
    expect(groups.map((g) => g.swatches.map((s) => s.label))).toEqual([['+180°'], ['−30°', '+30°'], ['+120°', '+240°']])
  })

  it('rotates the hue of pure red by the standard HSL shifts', () => {
    expect(harmoniesOf('#FF0000')).toEqual({
      complementary: ['#00FFFF'],
      analogous: ['#FF0080', '#FF8000'],
      triadic: ['#00FF00', '#0000FF'],
    })
  })

  it('keeps saturation and lightness while shifting hue', () => {
    const base = rgbToHsl(hexToRgb('#7C3AED')!)
    for (const { swatches } of getHarmonies(hexToRgb('#7C3AED')!)) {
      for (const { hex } of swatches) {
        const hsl = rgbToHsl(hexToRgb(hex)!)
        expect(Math.abs(hsl.s - base.s)).toBeLessThanOrEqual(1)
        expect(Math.abs(hsl.l - base.l)).toBeLessThanOrEqual(1)
      }
    }
    const complement = rgbToHsl(hexToRgb(harmoniesOf('#7C3AED').complementary[0])!)
    expect(Math.abs(complement.h - ((base.h + 180) % 360))).toBeLessThanOrEqual(1)
  })

  it('leaves greys unchanged, since they have no hue', () => {
    expect(harmoniesOf('#808080')).toEqual({
      complementary: ['#808080'],
      analogous: ['#808080', '#808080'],
      triadic: ['#808080', '#808080'],
    })
  })

  it('wraps negative hue shifts', () => {
    expect(rgbToHsl(rotateHue(hexToRgb('#FF8000')!, -60)).h).toBe(330)
  })
})
