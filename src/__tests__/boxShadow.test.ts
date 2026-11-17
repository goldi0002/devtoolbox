import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LAYER,
  SHADOW_PRESETS,
  buildBoxShadow,
  colorToRgba,
  formatBoxShadowCss,
  formatLength,
  hexToRgb,
  layerToCss,
  toHex6,
  validateLayer,
  type ShadowLayer,
} from '../utils/boxShadow'
import { BOX_SHADOW_GENERATOR_META } from '../tools/meta/box-shadow-generator'

const shadow = (partial: Partial<ShadowLayer> = {}): ShadowLayer => ({ ...DEFAULT_LAYER, ...partial })

describe('hexToRgb and toHex6', () => {
  it('parses #rrggbb and #rgb, with or without the leading #', () => {
    expect(hexToRgb('#1A2B3C')).toEqual({ r: 26, g: 43, b: 60 })
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 })
  })

  it('rejects anything that is not a hex colour', () => {
    expect(hexToRgb('red')).toBeNull()
    expect(hexToRgb('#12')).toBeNull()
    expect(hexToRgb('#12345')).toBeNull()
    expect(hexToRgb('')).toBeNull()
  })

  it('normalises to lowercase #rrggbb for colour pickers', () => {
    expect(toHex6('#ABC')).toBe('#aabbcc')
    expect(toHex6('#1A2B3C')).toBe('#1a2b3c')
    expect(toHex6('nope')).toBeNull()
  })
})

describe('colorToRgba', () => {
  it('converts colour and opacity percentage to rgba', () => {
    expect(colorToRgba('#000000', 20)).toBe('rgba(0, 0, 0, 0.2)')
    expect(colorToRgba('#1f2937', 33.3)).toBe('rgba(31, 41, 55, 0.33)')
  })

  it('keeps fully opaque and fully transparent endpoints', () => {
    expect(colorToRgba('#ffffff', 100)).toBe('rgba(255, 255, 255, 1)')
    expect(colorToRgba('#ffffff', 0)).toBe('rgba(255, 255, 255, 0)')
  })

  it('clamps opacity to 0-100 and returns null for an invalid colour', () => {
    expect(colorToRgba('#000000', 150)).toBe('rgba(0, 0, 0, 1)')
    expect(colorToRgba('#000000', -5)).toBe('rgba(0, 0, 0, 0)')
    expect(colorToRgba('blue', 50)).toBeNull()
  })
})

describe('formatLength', () => {
  it('writes zero without a unit, including negative zero', () => {
    expect(formatLength(0)).toBe('0')
    expect(formatLength(-0)).toBe('0')
    expect(formatLength(-0.001)).toBe('0')
  })

  it('adds px and rounds to two decimals', () => {
    expect(formatLength(4)).toBe('4px')
    expect(formatLength(-2)).toBe('-2px')
    expect(formatLength(0.333)).toBe('0.33px')
  })
})

describe('layerToCss', () => {
  it('builds offset, blur, spread and colour in CSS order', () => {
    expect(layerToCss(shadow({ x: 0, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 20 }))).toBe(
      '0 4px 8px 0 rgba(0, 0, 0, 0.2)'
    )
  })

  it('puts inset first when the toggle is on', () => {
    expect(layerToCss(shadow({ x: 0, y: 1, blur: 2, spread: 0, color: '#1f2937', opacity: 10, inset: true }))).toBe(
      'inset 0 1px 2px 0 rgba(31, 41, 55, 0.1)'
    )
  })

  it('writes zero values without units', () => {
    expect(layerToCss(shadow({ x: 0, y: 0, blur: 0, spread: 0, opacity: 0 }))).toBe('0 0 0 0 rgba(0, 0, 0, 0)')
  })

  it('keeps negative offsets and spread, which CSS allows', () => {
    expect(layerToCss(shadow({ x: -6, y: -3, blur: 10, spread: -2, color: '#000000', opacity: 50 }))).toBe(
      '-6px -3px 10px -2px rgba(0, 0, 0, 0.5)'
    )
  })

  it('throws for an invalid layer instead of producing broken CSS', () => {
    expect(() => layerToCss(shadow({ color: 'not-a-colour' }))).toThrow(/hex value/)
    expect(() => layerToCss(shadow({ blur: -1 }))).toThrow(/cannot be negative/)
  })
})

describe('buildBoxShadow', () => {
  it('returns an empty string for no layers', () => {
    expect(buildBoxShadow([])).toBe('')
  })

  it('joins multiple layers with a comma, first layer on top', () => {
    const css = buildBoxShadow([
      shadow({ y: 1, blur: 2, opacity: 10 }),
      shadow({ y: 4, blur: 8, opacity: 20, inset: true }),
    ])
    expect(css).toBe('0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 4px 8px 0 rgba(0, 0, 0, 0.2)')
  })
})

describe('formatBoxShadowCss', () => {
  it('gives box-shadow: none when there are no layers', () => {
    expect(formatBoxShadowCss([])).toBe('box-shadow: none;')
  })

  it('writes a single layer on one line', () => {
    expect(formatBoxShadowCss([shadow({ y: 2, blur: 4, opacity: 10 })])).toBe(
      'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);'
    )
  })

  it('writes multiple layers one per line', () => {
    expect(formatBoxShadowCss([shadow({ y: 1, blur: 2, opacity: 10 }), shadow({ y: 4, blur: 8, opacity: 20 })])).toBe(
      'box-shadow:\n  0 1px 2px 0 rgba(0, 0, 0, 0.1),\n  0 4px 8px 0 rgba(0, 0, 0, 0.2);'
    )
  })
})

describe('validateLayer', () => {
  it('accepts the default layer', () => {
    expect(validateLayer(DEFAULT_LAYER)).toEqual([])
  })

  it('reports bad colour, negative blur, out-of-range opacity and non-numbers', () => {
    expect(validateLayer(shadow({ color: 'xyz' }))).toEqual(['color must be a hex value such as #1a2b3c'])
    expect(validateLayer(shadow({ blur: -4 }))).toEqual(['blur cannot be negative'])
    expect(validateLayer(shadow({ opacity: 101 }))).toEqual(['opacity must be between 0 and 100'])
    expect(validateLayer(shadow({ x: Number.NaN }))).toEqual(['x must be a number'])
  })
})

describe('SHADOW_PRESETS', () => {
  it('has unique ids and every preset builds valid CSS', () => {
    const ids = SHADOW_PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const preset of SHADOW_PRESETS) {
      expect(preset.layers.length).toBeGreaterThan(0)
      for (const layer of preset.layers) expect(validateLayer(layer)).toEqual([])
      expect(formatBoxShadowCss(preset.layers)).toMatch(/^box-shadow:\s.+;$/s)
    }
  })

  it('includes an inset preset and a multi-layer preset', () => {
    expect(SHADOW_PRESETS.some(p => p.layers.some(l => l.inset))).toBe(true)
    expect(SHADOW_PRESETS.some(p => p.layers.length > 1)).toBe(true)
  })
})

describe('Box Shadow guide example', () => {
  it('matches what the tool produces', () => {
    const example = BOX_SHADOW_GENERATOR_META.guide?.example
    expect(example).toBeDefined()
    const layers = JSON.parse(example?.input ?? '[]') as ShadowLayer[]
    expect(formatBoxShadowCss(layers)).toBe(example?.output)
  })
})
