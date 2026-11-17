/** Gradient kinds the generator can build. */
export type GradientType = 'linear' | 'radial' | 'conic'

/** Shape of a radial gradient. */
export type RadialShape = 'circle' | 'ellipse'

export const GRADIENT_TYPE_LABELS: Record<GradientType, string> = {
  linear: 'Linear',
  radial: 'Radial',
  conic: 'Conic',
}

export const RADIAL_SHAPE_LABELS: Record<RadialShape, string> = {
  circle: 'Circle',
  ellipse: 'Ellipse',
}

/** A gradient needs at least two stops, and the editor caps the count to keep the form usable. */
export const MIN_STOPS = 2
export const MAX_STOPS = 8

/** A color stop. `color` is the text the user typed; `position` is a percentage along the gradient. */
export interface ColorStop {
  color: string
  position: number
}

export interface GradientConfig {
  type: GradientType
  /** Degrees, 0 to 360. Used by linear (direction) and conic (start angle). */
  angle: number
  /** Used by radial gradients only. */
  shape: RadialShape
  /** Horizontal center, percentage. Used by radial and conic gradients. */
  x: number
  /** Vertical center, percentage. Used by radial and conic gradients. */
  y: number
  stops: ColorStop[]
}

export interface GradientPreset {
  id: string
  name: string
  config: GradientConfig
}

export const DEFAULT_GRADIENT: GradientConfig = {
  type: 'linear',
  angle: 90,
  shape: 'circle',
  x: 50,
  y: 50,
  stops: [
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 },
  ],
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Returns the color as lowercase #rrggbb, expanding #rgb shorthand.
 * Returns null when the text is not a 3- or 6-digit hex color.
 */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim()
  if (!HEX_COLOR.test(trimmed)) return null
  let digits = trimmed.slice(1).toLowerCase()
  if (digits.length === 3) digits = digits.split('').map(ch => ch + ch).join('')
  return `#${digits}`
}

/** Clamps an angle to 0–360 degrees. Non-finite input (NaN, Infinity) becomes 0. */
export function clampAngle(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(360, Math.max(0, value))
}

/** Clamps a percentage to 0–100. Non-finite input becomes 0. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

/** Formats a number for CSS, rounded to two decimals with no trailing zeros. */
export function formatCssNumber(value: number): string {
  return String(Math.round(value * 100) / 100)
}

/** Returns a new array of stops sorted by position. Equal positions keep their original order. */
export function sortStops<T extends ColorStop>(stops: T[]): T[] {
  return stops
    .map((stop, index) => ({ stop, index }))
    .sort((a, b) => a.stop.position - b.stop.position || a.index - b.index)
    .map(({ stop }) => stop)
}

/**
 * Human-readable problems with a stop list, or an empty array when it can build a gradient.
 * Positions outside 0–100 are not reported because they are clamped when the CSS is built.
 */
export function validateStops(stops: ColorStop[]): string[] {
  const messages: string[] = []
  let validCount = 0
  stops.forEach((stop, index) => {
    if (normalizeHexColor(stop.color) === null) {
      messages.push(`Stop ${index + 1} is not a valid hex color. Use #rgb or #rrggbb.`)
    } else {
      validCount += 1
    }
  })
  if (validCount < MIN_STOPS) {
    messages.push(`A gradient needs at least ${MIN_STOPS} valid color stops.`)
  }
  return messages
}

/** Valid stops only, with normalized colors, clamped positions and sorted order. */
function usableStops(stops: ColorStop[]): ColorStop[] {
  const usable = stops.flatMap(stop => {
    const color = normalizeHexColor(stop.color)
    return color ? [{ color, position: clampPercent(stop.position) }] : []
  })
  return sortStops(usable)
}

/**
 * Builds the CSS gradient function, such as `linear-gradient(90deg, #6366f1 0%, #ec4899 100%)`.
 * Invalid stops are skipped. Returns null when fewer than two valid stops remain.
 */
export function buildGradientValue(config: GradientConfig): string | null {
  const stops = usableStops(config.stops)
  if (stops.length < MIN_STOPS) return null

  const colorList = stops
    .map(stop => `${stop.color} ${formatCssNumber(stop.position)}%`)
    .join(', ')
  const angle = formatCssNumber(clampAngle(config.angle))
  const x = formatCssNumber(clampPercent(config.x))
  const y = formatCssNumber(clampPercent(config.y))

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorList})`
    case 'radial': {
      const shape = config.shape === 'ellipse' ? 'ellipse' : 'circle'
      return `radial-gradient(${shape} at ${x}% ${y}%, ${colorList})`
    }
    case 'conic':
      return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${colorList})`
    default:
      return null
  }
}

/** The full declaration to paste into a stylesheet, or null when the gradient cannot be built. */
export function buildBackgroundDeclaration(config: GradientConfig): string | null {
  const value = buildGradientValue(config)
  return value === null ? null : `background: ${value};`
}

/** Removes the stop at `index`, but never below the minimum. Returns the input array when refused. */
export function removeStopAt<T>(stops: T[], index: number): T[] {
  if (stops.length <= MIN_STOPS) return stops
  return stops.filter((_, i) => i !== index)
}

/** Averages two hex colors channel by channel. Falls back to mid gray if either is invalid. */
export function mixHexColors(a: string, b: string): string {
  const first = normalizeHexColor(a)
  const second = normalizeHexColor(b)
  if (!first || !second) return '#808080'
  const channels = [1, 3, 5].map(start => {
    const mixed = (parseInt(first.slice(start, start + 2), 16) + parseInt(second.slice(start, start + 2), 16)) / 2
    return Math.round(mixed).toString(16).padStart(2, '0')
  })
  return `#${channels.join('')}`
}

/**
 * A new stop placed at the midpoint of the widest gap between neighboring stops,
 * colored with the mix of those two neighbors. Used by the "Add color stop" button.
 */
export function createStopBetween(stops: ColorStop[]): ColorStop {
  const sorted = sortStops(stops.map(stop => ({ ...stop, position: clampPercent(stop.position) })))
  if (sorted.length < 2) return { color: '#ffffff', position: 50 }

  let widest = 0
  let widestGap = -Infinity
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const gap = sorted[i + 1].position - sorted[i].position
    if (gap > widestGap) {
      widestGap = gap
      widest = i
    }
  }
  const from = sorted[widest]
  const to = sorted[widest + 1]
  return {
    color: mixHexColors(from.color, to.color),
    position: (from.position + to.position) / 2,
  }
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    config: {
      ...DEFAULT_GRADIENT,
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#ff7e5f', position: 0 },
        { color: '#feb47b', position: 100 },
      ],
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    config: {
      ...DEFAULT_GRADIENT,
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#22d3ee', position: 0 },
        { color: '#a78bfa', position: 50 },
        { color: '#f472b6', position: 100 },
      ],
    },
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    config: {
      ...DEFAULT_GRADIENT,
      type: 'radial',
      shape: 'ellipse',
      x: 50,
      y: 20,
      stops: [
        { color: '#fef3c7', position: 0 },
        { color: '#1f2937', position: 100 },
      ],
    },
  },
  {
    id: 'ocean-depth',
    name: 'Ocean depth',
    config: {
      ...DEFAULT_GRADIENT,
      type: 'radial',
      shape: 'circle',
      x: 30,
      y: 30,
      stops: [
        { color: '#38bdf8', position: 0 },
        { color: '#1e3a8a', position: 100 },
      ],
    },
  },
  {
    id: 'color-wheel',
    name: 'Color wheel',
    config: {
      ...DEFAULT_GRADIENT,
      type: 'conic',
      angle: 0,
      x: 50,
      y: 50,
      stops: [
        { color: '#ef4444', position: 0 },
        { color: '#eab308', position: 17 },
        { color: '#22c55e', position: 33 },
        { color: '#06b6d4', position: 50 },
        { color: '#3b82f6', position: 67 },
        { color: '#d946ef', position: 83 },
        { color: '#ef4444', position: 100 },
      ],
    },
  },
]
