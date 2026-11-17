import { describe, it, expect } from 'vitest'
import {
  CUBIC_BEZIER_PRESETS,
  bezierPoint,
  clamp,
  clampEasing,
  clampX,
  clampY,
  easingValue,
  findPreset,
  formatCubicBezier,
  formatNumber,
  formatTransitionCss,
  fromPlot,
  parseCubicBezier,
  presetById,
  sampleCurve,
  toPlot,
  yDomain,
  type Easing,
} from '../utils/cubicBezier'
import { CUBIC_BEZIER_EDITOR_META } from '../tools/meta/cubic-bezier-editor'

const EASE: Easing = [0.25, 0.1, 0.25, 1]

describe('clamp helpers', () => {
  it('clamps to a range and treats NaN as the lower bound', () => {
    expect(clamp(5, 0, 1)).toBe(1)
    expect(clamp(-3, 0, 1)).toBe(0)
    expect(clamp(0.4, 0, 1)).toBe(0.4)
    expect(clamp(Number.NaN, 0, 1)).toBe(0)
  })

  it('keeps x in [0, 1] but lets y range from -2 to 2', () => {
    expect(clampX(-0.5)).toBe(0)
    expect(clampX(1.5)).toBe(1)
    expect(clampY(-1)).toBe(-1)
    expect(clampY(2.5)).toBe(2)
    expect(clampY(-9)).toBe(-2)
  })

  it('clamps only the x components of an easing when y is in range', () => {
    expect(clampEasing([-0.2, -1, 1.3, 2])).toEqual([0, -1, 1, 2])
  })
})

describe('formatNumber', () => {
  it('rounds to three decimals and drops trailing zeros', () => {
    expect(formatNumber(0.123456)).toBe('0.123')
    expect(formatNumber(0.1)).toBe('0.1')
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(-0.6)).toBe('-0.6')
  })

  it('never prints negative zero', () => {
    expect(formatNumber(-0.0001)).toBe('0')
    expect(formatNumber(-0)).toBe('0')
  })
})

describe('formatCubicBezier and formatTransitionCss', () => {
  it('formats the four control points with comma and space separators', () => {
    expect(formatCubicBezier(EASE)).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)')
    expect(formatCubicBezier([0.68, -0.6, 0.32, 1.6])).toBe('cubic-bezier(0.68, -0.6, 0.32, 1.6)')
  })

  it('wraps the value in a transition-timing-function declaration', () => {
    expect(formatTransitionCss(EASE)).toBe('transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);')
  })
})

describe('parseCubicBezier', () => {
  it('parses a plain cubic-bezier value, tolerating spacing and case', () => {
    const result = parseCubicBezier('  CUBIC-BEZIER( 0.68,-0.6 ,0.32, 1.6 ) ')
    expect(result).toEqual({ ok: true, value: [0.68, -0.6, 0.32, 1.6], clamped: false })
  })

  it('accepts the transition-timing-function declaration with a trailing semicolon', () => {
    const result = parseCubicBezier('transition-timing-function: cubic-bezier(.42, 0, 1, 1);')
    expect(result).toEqual({ ok: true, value: [0.42, 0, 1, 1], clamped: false })
  })

  it('accepts scientific notation', () => {
    const result = parseCubicBezier('cubic-bezier(1e-1, 0, 5e-1, 1)')
    expect(result.ok && result.value).toEqual([0.1, 0, 0.5, 1])
  })

  it('maps CSS keywords to their presets', () => {
    expect(parseCubicBezier('ease-in-out')).toEqual({ ok: true, value: [0.42, 0, 0.58, 1], clamped: false })
    expect(parseCubicBezier('Linear')).toEqual({ ok: true, value: [0, 0, 1, 1], clamped: false })
  })

  it('clamps x values and reports it', () => {
    const result = parseCubicBezier('cubic-bezier(1.5, 0.2, -0.1, 3)')
    expect(result).toEqual({ ok: true, value: [1, 0.2, 0, 2], clamped: true })
  })

  it('rejects empty input, wrong arity, non-numbers and unknown functions', () => {
    expect(parseCubicBezier('   ').ok).toBe(false)
    expect(parseCubicBezier('cubic-bezier(0.1, 0.2, 0.3)')).toEqual({
      ok: false,
      error: 'cubic-bezier() needs exactly four numbers.',
    })
    expect(parseCubicBezier('cubic-bezier(0.1, , 0.3, 0.4)')).toEqual({ ok: false, error: 'A value is missing.' })
    expect(parseCubicBezier('cubic-bezier(0.1, abc, 0.3, 0.4)')).toEqual({ ok: false, error: '"abc" is not a number.' })
    expect(parseCubicBezier('steps(4, end)').ok).toBe(false)
    expect(parseCubicBezier('cubic-bezier(0.1, 0.2, 0.3, 0.4').ok).toBe(false)
  })

  it('round-trips every preset through formatting', () => {
    for (const preset of CUBIC_BEZIER_PRESETS) {
      const parsed = parseCubicBezier(formatCubicBezier(preset.value))
      expect(parsed).toEqual({ ok: true, value: preset.value, clamped: false })
    }
  })
})

describe('presets', () => {
  it('has unique ids and values that the editor accepts without clamping', () => {
    const ids = CUBIC_BEZIER_PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of CUBIC_BEZIER_PRESETS) {
      expect(clampEasing(p.value)).toEqual(p.value)
    }
  })

  it('looks presets up by id', () => {
    expect(presetById('easeInOutBack')?.value).toEqual([0.68, -0.6, 0.32, 1.6])
    expect(presetById('nope')).toBeUndefined()
  })

  it('finds the preset that matches a curve, and nothing for a custom curve', () => {
    expect(findPreset(EASE)?.id).toBe('ease')
    expect(findPreset([0.3, 0.1, 0.25, 1])).toBeUndefined()
  })
})

describe('bezierPoint and easingValue', () => {
  it('starts at (0, 0) and ends at (1, 1) for any control points', () => {
    expect(bezierPoint(EASE, 0)).toEqual({ x: 0, y: 0 })
    const end = bezierPoint(EASE, 1)
    expect(end.x).toBeCloseTo(1, 10)
    expect(end.y).toBeCloseTo(1, 10)
  })

  it('traces the diagonal for a linear curve', () => {
    const mid = bezierPoint([0, 0, 1, 1], 0.5)
    expect(mid.x).toBeCloseTo(0.5, 10)
    expect(mid.y).toBeCloseTo(0.5, 10)
  })

  it('returns progress for a time fraction, matching the linear identity', () => {
    for (const p of [0.1, 0.33, 0.5, 0.9]) {
      expect(easingValue([0, 0, 1, 1], p)).toBeCloseTo(p, 4)
    }
  })

  it('pins the ends and eases in and out as expected', () => {
    expect(easingValue(EASE, 0)).toBe(0)
    expect(easingValue(EASE, 1)).toBe(1)
    expect(easingValue(CUBIC_BEZIER_PRESETS.find(p => p.id === 'ease-in')!.value, 0.5)).toBeLessThan(0.5)
    expect(easingValue(CUBIC_BEZIER_PRESETS.find(p => p.id === 'ease-out')!.value, 0.5)).toBeGreaterThan(0.5)
    expect(easingValue(presetById('easeInOutCubic')!.value, 0.5)).toBeCloseTo(0.5, 3)
  })

  it('overshoots below 0 and above 1 when y is outside [0, 1]', () => {
    const back = presetById('easeOutBack')!.value
    const samples = sampleCurve(back, 200).map(p => p.y)
    expect(Math.max(...samples)).toBeGreaterThan(1)
    const inBack = presetById('easeInBack')!.value
    expect(Math.min(...sampleCurve(inBack, 200).map(p => p.y))).toBeLessThan(0)
  })
})

describe('sampleCurve', () => {
  it('returns samples+1 points from the start to the end of the curve', () => {
    const points = sampleCurve(EASE, 10)
    expect(points).toHaveLength(11)
    expect(points[0]).toEqual({ x: 0, y: 0 })
    expect(points[10].x).toBeCloseTo(1, 10)
  })
})

describe('plot mapping', () => {
  it('maps the unit square corners to the plot corners and back', () => {
    const domain = yDomain([0, 0, 1, 1])
    const origin = toPlot(0, 0, domain)
    const top = toPlot(1, 1, domain)
    expect(origin.px).toBeCloseTo(28, 6)
    expect(origin.py).toBeCloseTo(272 - (0 - domain.min) / (domain.max - domain.min) * 244, 6)
    expect(top.px).toBeCloseTo(272, 6)

    const back = fromPlot(top.px, top.py, domain)
    expect(back.x).toBeCloseTo(1, 6)
    expect(back.y).toBeCloseTo(1, 6)
  })

  it('round-trips an interior point through the plot', () => {
    const e: Easing = [0.3, -1.2, 0.7, 1.8]
    const domain = yDomain(e)
    const { px, py } = toPlot(0.42, -0.5, domain)
    const back = fromPlot(px, py, domain)
    expect(back.x).toBeCloseTo(0.42, 6)
    expect(back.y).toBeCloseTo(-0.5, 6)
  })

  it('covers every control height and the curve, with a margin', () => {
    const domain = yDomain([0.5, -1.5, 0.5, 2])
    expect(domain.min).toBeLessThan(-1.5)
    expect(domain.max).toBeGreaterThan(2)
    for (const p of sampleCurve([0.5, -1.5, 0.5, 2], 50)) {
      expect(p.y).toBeGreaterThanOrEqual(domain.min)
      expect(p.y).toBeLessThanOrEqual(domain.max)
    }
  })

  it('clamps dragged positions to the editor bounds', () => {
    const domain = yDomain(EASE)
    const far = fromPlot(10_000, -10_000, domain)
    expect(far.x).toBe(1)
    expect(far.y).toBe(2)
    expect(fromPlot(-500, 500, domain).x).toBe(0)
  })
})

describe('guide example', () => {
  it('shows the transition declaration the tool really produces for the pasted value', () => {
    const example = CUBIC_BEZIER_EDITOR_META.guide!.example!
    const parsed = parseCubicBezier(example.input)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(formatTransitionCss(parsed.value)).toBe(example.output)
  })
})
