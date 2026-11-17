export interface ShadowLayer {
  /** Horizontal offset in px. Negative values move the shadow left. */
  x: number
  /** Vertical offset in px. Negative values move the shadow up. */
  y: number
  /** Blur radius in px. Never negative. */
  blur: number
  /** Spread radius in px. May be negative. */
  spread: number
  /** Hex colour, `#rgb` or `#rrggbb`. */
  color: string
  /** Opacity as a percentage from 0 to 100. */
  opacity: number
  /** Draw the shadow inside the box instead of outside it. */
  inset: boolean
}

export const MAX_LAYERS = 8

export const SHADOW_LIMITS = {
  offset: { min: -100, max: 100 },
  blur: { min: 0, max: 200 },
  spread: { min: -100, max: 100 },
  opacity: { min: 0, max: 100 },
} as const

export const DEFAULT_LAYER: ShadowLayer = {
  x: 0,
  y: 4,
  blur: 8,
  spread: 0,
  color: '#000000',
  opacity: 20,
  inset: false,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Parses `#rgb` or `#rrggbb` (the leading # is optional). Returns null for anything else. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  let digits = match[1]
  if (digits.length === 3) digits = digits.split('').map(c => c + c).join('')
  const n = parseInt(digits, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Normalises a valid hex colour to lowercase `#rrggbb`, the form `<input type="color">` accepts. */
export function toHex6(hex: string): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const part = (v: number) => v.toString(16).padStart(2, '0')
  return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`
}

/** Converts a hex colour and an opacity percentage to `rgba(r, g, b, a)`. Returns null for an invalid colour. */
export function colorToRgba(hex: string, opacityPercent: number): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const alpha = Number((clamp(opacityPercent, 0, 100) / 100).toFixed(2))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/** Formats a length. Zero is written without a unit, which CSS accepts for lengths. */
export function formatLength(px: number): string {
  const rounded = Math.round(px * 100) / 100
  if (rounded === 0) return '0'
  return `${rounded}px`
}

/** Returns human-readable problems with one layer. An empty array means the layer can be turned into CSS. */
export function validateLayer(layer: ShadowLayer): string[] {
  const errors: string[] = []
  const numericKeys = ['x', 'y', 'blur', 'spread', 'opacity'] as const
  for (const key of numericKeys) {
    if (!Number.isFinite(layer[key])) errors.push(`${key} must be a number`)
  }
  if (Number.isFinite(layer.blur) && layer.blur < 0) errors.push('blur cannot be negative')
  if (Number.isFinite(layer.opacity) && (layer.opacity < 0 || layer.opacity > 100)) {
    errors.push('opacity must be between 0 and 100')
  }
  if (!hexToRgb(layer.color)) errors.push('color must be a hex value such as #1a2b3c')
  return errors
}

/** Builds one box-shadow layer, e.g. `inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)`. Throws if the layer is invalid. */
export function layerToCss(layer: ShadowLayer): string {
  const [first] = validateLayer(layer)
  if (first) throw new Error(first)
  const color = colorToRgba(layer.color, layer.opacity)
  if (!color) throw new Error('color must be a hex value such as #1a2b3c')
  return [
    layer.inset ? 'inset' : '',
    formatLength(layer.x),
    formatLength(layer.y),
    formatLength(layer.blur),
    formatLength(layer.spread),
    color,
  ]
    .filter(Boolean)
    .join(' ')
}

/** Joins every layer into one box-shadow value, first layer on top. An empty list gives an empty string. */
export function buildBoxShadow(layers: ShadowLayer[]): string {
  return layers.map(layerToCss).join(', ')
}

/** The full CSS declaration for the layers, ready to paste. Multi-layer output is one layer per line. */
export function formatBoxShadowCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'box-shadow: none;'
  if (layers.length === 1) return `box-shadow: ${buildBoxShadow(layers)};`
  return `box-shadow:\n${layers.map(layerToCss).map(css => `  ${css}`).join(',\n')};`
}

export interface ShadowPreset {
  id: string
  label: string
  description: string
  layers: ShadowLayer[]
}

const layer = (partial: Partial<ShadowLayer>): ShadowLayer => ({ ...DEFAULT_LAYER, ...partial })

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: 'subtle',
    label: 'Subtle',
    description: 'One faint shadow for cards and panels.',
    layers: [layer({ x: 0, y: 1, blur: 3, spread: 0, opacity: 12 })],
  },
  {
    id: 'elevated',
    label: 'Elevated',
    description: 'Two layers that lift a card off the page.',
    layers: [
      layer({ x: 0, y: 4, blur: 6, spread: -1, opacity: 10 }),
      layer({ x: 0, y: 12, blur: 24, spread: -4, opacity: 18 }),
    ],
  },
  {
    id: 'inset',
    label: 'Inset',
    description: 'A pressed-in shadow for wells and input fields.',
    layers: [layer({ x: 0, y: 2, blur: 6, spread: 0, opacity: 25, inset: true })],
  },
  {
    id: 'layered',
    label: 'Layered',
    description: 'Four stacked layers that fade out smoothly.',
    layers: [
      layer({ x: 0, y: 1, blur: 1, spread: 0, opacity: 10 }),
      layer({ x: 0, y: 2, blur: 4, spread: 0, opacity: 10 }),
      layer({ x: 0, y: 4, blur: 8, spread: 0, opacity: 10 }),
      layer({ x: 0, y: 8, blur: 16, spread: 0, opacity: 10 }),
    ],
  },
]
