/** Control points of a CSS cubic-bezier(x1, y1, x2, y2) timing function. */
export type Easing = readonly [x1: number, y1: number, x2: number, y2: number]

/** CSS requires x (time) to stay in [0, 1]; y (progress) may leave it to overshoot. */
export const X_MIN = 0
export const X_MAX = 1
/** Bounds for y in the editor. CSS itself accepts any finite y. */
export const Y_MIN = -2
export const Y_MAX = 2

export const PLOT_SIZE = 300
export const PLOT_PADDING = 28

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function clampX(x: number): number {
  return clamp(x, X_MIN, X_MAX)
}

export function clampY(y: number): number {
  return clamp(y, Y_MIN, Y_MAX)
}

export function clampEasing(e: Easing): Easing {
  return [clampX(e[0]), clampY(e[1]), clampX(e[2]), clampY(e[3])]
}

/** Rounds to `digits` decimals and drops trailing zeros. Never returns "-0". */
export function formatNumber(n: number, digits = 3): string {
  const rounded = Number(n.toFixed(digits))
  return rounded === 0 ? '0' : String(rounded)
}

export function formatCubicBezier(e: Easing): string {
  return `cubic-bezier(${e.map(v => formatNumber(v)).join(', ')})`
}

export function formatTransitionCss(e: Easing): string {
  return `transition-timing-function: ${formatCubicBezier(e)};`
}

export interface CubicBezierPreset {
  id: string
  name: string
  value: Easing
}

/** CSS keyword timing functions plus common easings from easings.net. */
export const CUBIC_BEZIER_PRESETS: readonly CubicBezierPreset[] = [
  { id: 'linear', name: 'linear', value: [0, 0, 1, 1] },
  { id: 'ease', name: 'ease', value: [0.25, 0.1, 0.25, 1] },
  { id: 'ease-in', name: 'ease-in', value: [0.42, 0, 1, 1] },
  { id: 'ease-out', name: 'ease-out', value: [0, 0, 0.58, 1] },
  { id: 'ease-in-out', name: 'ease-in-out', value: [0.42, 0, 0.58, 1] },
  { id: 'easeOutCubic', name: 'easeOutCubic', value: [0.33, 1, 0.68, 1] },
  { id: 'easeInOutCubic', name: 'easeInOutCubic', value: [0.65, 0, 0.35, 1] },
  { id: 'easeInBack', name: 'easeInBack', value: [0.36, 0, 0.66, -0.56] },
  { id: 'easeOutBack', name: 'easeOutBack', value: [0.34, 1.56, 0.64, 1] },
  { id: 'easeInOutBack', name: 'easeInOutBack', value: [0.68, -0.6, 0.32, 1.6] },
]

export function presetById(id: string): CubicBezierPreset | undefined {
  return CUBIC_BEZIER_PRESETS.find(p => p.id === id)
}

/** The preset whose values match `e` after the same rounding used for output, if any. */
export function findPreset(e: Easing): CubicBezierPreset | undefined {
  const key = formatCubicBezier(e)
  return CUBIC_BEZIER_PRESETS.find(p => formatCubicBezier(p.value) === key)
}

export type ParseResult =
  | { ok: true; value: Easing; clamped: boolean }
  | { ok: false; error: string }

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i
const CSS_KEYWORDS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']

/**
 * Parses `cubic-bezier(x1, y1, x2, y2)`, optionally prefixed with
 * `transition-timing-function:` and ending in `;`, or one of the CSS keywords.
 * x values outside [0, 1] are clamped and reported through `clamped`.
 */
export function parseCubicBezier(input: string): ParseResult {
  let text = input.trim().replace(/;$/, '').trim()
  text = text.replace(/^transition-timing-function\s*:\s*/i, '').trim()
  if (!text) return { ok: false, error: 'Paste a cubic-bezier(x1, y1, x2, y2) value or a CSS keyword.' }

  const keyword = text.toLowerCase()
  if (CSS_KEYWORDS.includes(keyword)) {
    return { ok: true, value: presetById(keyword)!.value, clamped: false }
  }

  const match = /^cubic-bezier\(([^)]*)\)$/i.exec(text)
  if (!match) return { ok: false, error: 'Expected cubic-bezier(x1, y1, x2, y2) or a CSS keyword such as ease-in.' }

  const parts = match[1].split(',').map(part => part.trim())
  if (parts.length !== 4) return { ok: false, error: 'cubic-bezier() needs exactly four numbers.' }
  const bad = parts.find(part => !NUMBER.test(part))
  if (bad !== undefined) return { ok: false, error: bad ? `"${bad}" is not a number.` : 'A value is missing.' }

  const raw = parts.map(Number) as [number, number, number, number]
  const value = clampEasing(raw)
  const clamped = value.some((v, i) => v !== raw[i])
  return { ok: true, value, clamped }
}

/** Bernstein form of one coordinate with endpoints fixed at 0 and 1. */
function bezierCoordinate(t: number, p1: number, p2: number): number {
  const u = 1 - t
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t
}

/** Point on the curve at parameter t in [0, 1]. The curve runs from (0, 0) to (1, 1). */
export function bezierPoint(e: Easing, t: number): { x: number; y: number } {
  return { x: bezierCoordinate(t, e[0], e[2]), y: bezierCoordinate(t, e[1], e[3]) }
}

/**
 * Progress value (y) at time fraction `progress` (x), the way a CSS transition
 * samples its timing function. Solves x(t) = progress by bisection, which is
 * reliable because x is monotonic when x1 and x2 are within [0, 1].
 */
export function easingValue(e: Easing, progress: number): number {
  if (progress <= 0) return 0
  if (progress >= 1) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (bezierCoordinate(mid, e[0], e[2]) < progress) lo = mid
    else hi = mid
  }
  return bezierCoordinate((lo + hi) / 2, e[1], e[3])
}

/** Evenly spaced points along the curve, used to draw it. */
export function sampleCurve(e: Easing, samples = 64): { x: number; y: number }[] {
  return Array.from({ length: samples + 1 }, (_, i) => bezierPoint(e, i / samples))
}

export interface YDomain {
  min: number
  max: number
}

/** Base vertical range. It stays fixed for typical curves so dragging a handle does not rescale the plot under the pointer. */
const BASE_DOMAIN: YDomain = { min: -1, max: 2 }
const DOMAIN_MARGIN = 0.1

/**
 * Vertical range of the plot: the base range, widened when a control point
 * falls outside it. The curve lies in the convex hull of its points, so it is
 * never clipped.
 */
export function yDomain(e: Easing): YDomain {
  const low = Math.min(0, 1, e[1], e[3])
  const high = Math.max(0, 1, e[1], e[3])
  return {
    min: Math.min(BASE_DOMAIN.min, low - DOMAIN_MARGIN),
    max: Math.max(BASE_DOMAIN.max, high + DOMAIN_MARGIN),
  }
}

const INNER = PLOT_SIZE - 2 * PLOT_PADDING

/** Maps a curve coordinate to SVG pixels for the given y range. */
export function toPlot(x: number, y: number, domain: YDomain): { px: number; py: number } {
  return {
    px: PLOT_PADDING + x * INNER,
    py: PLOT_SIZE - PLOT_PADDING - ((y - domain.min) / (domain.max - domain.min)) * INNER,
  }
}

/** Inverse of toPlot. x is clamped to [0, 1] and y to the editor bounds. */
export function fromPlot(px: number, py: number, domain: YDomain): { x: number; y: number } {
  const x = clampX((px - PLOT_PADDING) / INNER)
  const y = domain.min + ((PLOT_SIZE - PLOT_PADDING - py) / INNER) * (domain.max - domain.min)
  return { x, y: clampY(y) }
}
