import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GRADIENT,
  GRADIENT_PRESETS,
  MAX_STOPS,
  MIN_STOPS,
  buildBackgroundDeclaration,
  buildGradientValue,
  clampAngle,
  clampPercent,
  createStopBetween,
  formatCssNumber,
  mixHexColors,
  normalizeHexColor,
  removeStopAt,
  sortStops,
  validateStops,
  type GradientConfig,
} from '../utils/cssGradient'
import { CSS_GRADIENT_GENERATOR_META } from '../tools/meta/css-gradient-generator'

const twoStops: GradientConfig = {
  ...DEFAULT_GRADIENT,
  stops: [
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 },
  ],
}

describe('normalizeHexColor', () => {
  it('accepts 6-digit hex and lowercases it', () => {
    expect(normalizeHexColor('#ABCDEF')).toBe('#abcdef')
  })
  it('expands 3-digit shorthand to 6 digits', () => {
    expect(normalizeHexColor('#f0a')).toBe('#ff00aa')
  })
  it('trims surrounding whitespace', () => {
    expect(normalizeHexColor('  #123456 ')).toBe('#123456')
  })
  it('rejects invalid hex text', () => {
    expect(normalizeHexColor('#ggg')).toBeNull()
    expect(normalizeHexColor('#12345')).toBeNull()
    expect(normalizeHexColor('#1234567')).toBeNull()
    expect(normalizeHexColor('123456')).toBeNull()
    expect(normalizeHexColor('red')).toBeNull()
    expect(normalizeHexColor('')).toBeNull()
  })
})

describe('angle and percentage clamping', () => {
  it('clamps angles to 0 through 360', () => {
    expect(clampAngle(-10)).toBe(0)
    expect(clampAngle(0)).toBe(0)
    expect(clampAngle(45.5)).toBe(45.5)
    expect(clampAngle(360)).toBe(360)
    expect(clampAngle(720)).toBe(360)
  })
  it('turns non-finite angles into 0', () => {
    expect(clampAngle(Number.NaN)).toBe(0)
    expect(clampAngle(Number.POSITIVE_INFINITY)).toBe(0)
  })
  it('clamps percentages to 0 through 100', () => {
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(Number.NaN)).toBe(0)
  })
  it('formats numbers with at most two decimals and no trailing zeros', () => {
    expect(formatCssNumber(50)).toBe('50')
    expect(formatCssNumber(33.3333)).toBe('33.33')
    expect(formatCssNumber(12.5)).toBe('12.5')
  })
})

describe('buildGradientValue', () => {
  it('builds a linear gradient with the angle and percentage stops', () => {
    expect(buildGradientValue({ ...twoStops, type: 'linear', angle: 90 })).toBe(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('builds a circle radial gradient at the given center', () => {
    expect(buildGradientValue({ ...twoStops, type: 'radial', shape: 'circle', x: 30, y: 40 })).toBe(
      'radial-gradient(circle at 30% 40%, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('builds an ellipse radial gradient', () => {
    expect(buildGradientValue({ ...twoStops, type: 'radial', shape: 'ellipse', x: 50, y: 20 })).toBe(
      'radial-gradient(ellipse at 50% 20%, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('builds a conic gradient with a starting angle and center', () => {
    expect(buildGradientValue({ ...twoStops, type: 'conic', angle: 45, x: 50, y: 50 })).toBe(
      'conic-gradient(from 45deg at 50% 50%, #ff0000 0%, #0000ff 100%)',
    )
  })

  it('clamps an out-of-range angle in the output', () => {
    expect(buildGradientValue({ ...twoStops, type: 'linear', angle: 400 })).toContain('linear-gradient(360deg,')
    expect(buildGradientValue({ ...twoStops, type: 'linear', angle: -20 })).toContain('linear-gradient(0deg,')
  })

  it('clamps out-of-range stop positions', () => {
    const value = buildGradientValue({
      ...twoStops,
      type: 'linear',
      stops: [
        { color: '#ff0000', position: -10 },
        { color: '#0000ff', position: 120 },
      ],
    })
    expect(value).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
  })

  it('sorts stops by position in the output, whatever the editing order', () => {
    const value = buildGradientValue({
      ...twoStops,
      type: 'linear',
      stops: [
        { color: '#0000ff', position: 100 },
        { color: '#00ff00', position: 50 },
        { color: '#ff0000', position: 0 },
      ],
    })
    expect(value).toBe('linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)')
  })

  it('skips stops with invalid hex and keeps the valid ones', () => {
    const value = buildGradientValue({
      ...twoStops,
      type: 'linear',
      stops: [
        { color: '#ff0000', position: 0 },
        { color: 'not-a-color', position: 40 },
        { color: '#0000ff', position: 100 },
      ],
    })
    expect(value).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
  })

  it('returns null when fewer than two valid stops remain', () => {
    expect(
      buildGradientValue({
        ...twoStops,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: 'oops', position: 100 },
        ],
      }),
    ).toBeNull()
    expect(buildGradientValue({ ...twoStops, stops: [{ color: '#ff0000', position: 0 }] })).toBeNull()
  })

  it('normalizes 3-digit colors in the output', () => {
    expect(buildGradientValue({ ...twoStops, stops: [{ color: '#F00', position: 0 }, { color: '#00F', position: 100 }] })).toBe(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    )
  })
})

describe('buildBackgroundDeclaration', () => {
  it('wraps the gradient in a background declaration', () => {
    expect(buildBackgroundDeclaration(twoStops)).toBe('background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);')
  })
  it('returns null when the gradient cannot be built', () => {
    expect(buildBackgroundDeclaration({ ...twoStops, stops: [] })).toBeNull()
  })
})

describe('validateStops', () => {
  it('reports nothing for a valid stop list', () => {
    expect(validateStops(twoStops.stops)).toEqual([])
  })
  it('names the stop with an invalid hex color', () => {
    expect(validateStops([
      { color: '#ff0000', position: 0 },
      { color: '#zz0000', position: 50 },
      { color: '#0000ff', position: 100 },
    ])).toEqual(['Stop 2 is not a valid hex color. Use #rgb or #rrggbb.'])
  })
  it('reports when there are too few valid stops', () => {
    expect(validateStops([{ color: 'x', position: 0 }, { color: '#fff', position: 100 }])).toContain(
      `A gradient needs at least ${MIN_STOPS} valid color stops.`,
    )
  })
})

describe('sortStops', () => {
  it('orders stops by position without changing the input', () => {
    const input = [
      { color: '#111111', position: 80 },
      { color: '#222222', position: 10 },
    ]
    expect(sortStops(input).map(s => s.color)).toEqual(['#222222', '#111111'])
    expect(input[0].color).toBe('#111111')
  })
  it('keeps the original order for equal positions', () => {
    const input = [
      { color: '#aaaaaa', position: 50 },
      { color: '#bbbbbb', position: 50 },
    ]
    expect(sortStops(input).map(s => s.color)).toEqual(['#aaaaaa', '#bbbbbb'])
  })
})

describe('stop editing helpers', () => {
  it('never removes a stop below the minimum', () => {
    expect(removeStopAt(twoStops.stops, 0)).toBe(twoStops.stops)
    expect(MIN_STOPS).toBe(2)
  })
  it('removes the chosen stop when there are more than the minimum', () => {
    const three = [...twoStops.stops, { color: '#00ff00', position: 50 }]
    expect(removeStopAt(three, 1).map(s => s.color)).toEqual(['#ff0000', '#00ff00'])
  })
  it('places a new stop in the widest gap, colored by mixing its neighbors', () => {
    const stop = createStopBetween([
      { color: '#000000', position: 0 },
      { color: '#ffffff', position: 20 },
      { color: '#ff0000', position: 100 },
    ])
    expect(stop.position).toBe(60)
    expect(stop.color).toBe(mixHexColors('#ffffff', '#ff0000'))
  })
  it('mixes colors channel by channel', () => {
    expect(mixHexColors('#000000', '#ffffff')).toBe('#808080')
    expect(mixHexColors('#zzz', '#ffffff')).toBe('#808080')
  })
  it('allows up to the maximum stop count', () => {
    expect(MAX_STOPS).toBeGreaterThan(MIN_STOPS)
  })
})

describe('presets', () => {
  it('every preset builds a valid background declaration', () => {
    for (const preset of GRADIENT_PRESETS) {
      expect(buildBackgroundDeclaration(preset.config), preset.id).toMatch(/^background: (linear|radial|conic)-gradient\(/)
    }
  })
})

describe('CSS Gradient Generator tool metadata', () => {
  it('uses the expected slug', () => {
    expect(CSS_GRADIENT_GENERATOR_META.slug).toBe('css-gradient-generator')
  })

  it('has a worked example whose output matches the builder', () => {
    const example = CSS_GRADIENT_GENERATOR_META.guide?.example
    expect(example).toBeDefined()
    const config = { ...DEFAULT_GRADIENT, ...JSON.parse(example!.input) }
    expect(buildBackgroundDeclaration(config)).toBe(example!.output)
  })
})
