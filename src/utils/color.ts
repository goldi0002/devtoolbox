export type Rgb = { r: number; g: number; b: number }
export type Hsl = { h: number; s: number; l: number }

export type ColorState = {
  hex: string
  rgb: Rgb
  hsl: Hsl
  error?: string
}

export const SAMPLE_HEX = '#7c3aed'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function componentToHex(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0').toUpperCase()
}

export function rgbToHex(rgb: Rgb) {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(normalized)) return null
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))

    switch (max) {
      case rr:
        h = 60 * (((gg - bb) / delta) % 6)
        break
      case gg:
        h = 60 * ((bb - rr) / delta + 2)
        break
      default:
        h = 60 * ((rr - gg) / delta + 4)
    }
  }

  return {
    h: Math.round(h < 0 ? h + 360 : h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hh = ((h % 360) + 360) % 360
  const ss = clamp(s, 0, 100) / 100
  const ll = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2

  let rr = 0
  let gg = 0
  let bb = 0

  if (hh < 60) [rr, gg, bb] = [c, x, 0]
  else if (hh < 120) [rr, gg, bb] = [x, c, 0]
  else if (hh < 180) [rr, gg, bb] = [0, c, x]
  else if (hh < 240) [rr, gg, bb] = [0, x, c]
  else if (hh < 300) [rr, gg, bb] = [x, 0, c]
  else [rr, gg, bb] = [c, 0, x]

  return {
    r: Math.round((rr + m) * 255),
    g: Math.round((gg + m) * 255),
    b: Math.round((bb + m) * 255),
  }
}

export function parseRgb(input: string): Rgb | null {
  const values = input.match(/\d+/g)
  if (!values || values.length < 3) return null
  const [r, g, b] = values.slice(0, 3).map(Number)
  if ([r, g, b].some(value => Number.isNaN(value) || value < 0 || value > 255)) return null
  return { r, g, b }
}

export function parseHsl(input: string): Hsl | null {
  const values = input.match(/-?\d+(?:\.\d+)?/g)
  if (!values || values.length < 3) return null
  const [h, s, l] = values.slice(0, 3).map(Number)
  if ([h, s, l].some(value => Number.isNaN(value))) return null
  if (s < 0 || s > 100 || l < 0 || l > 100) return null
  return { h, s, l }
}

export function parseColor(input: string): ColorState {
  const trimmed = input.trim()
  // HSL must be recognised by its prefix: its three numbers also look like an RGB triple.
  const hsl = /^hsla?\s*\(/i.test(trimmed) ? parseHsl(trimmed) : null
  const rgb = hexToRgb(trimmed) ?? (hsl ? hslToRgb(hsl) : /^hsla?\s*\(/i.test(trimmed) ? null : parseRgb(trimmed))

  if (!trimmed) {
    const sampleRgb = hexToRgb(SAMPLE_HEX)!
    return { hex: SAMPLE_HEX, rgb: sampleRgb, hsl: rgbToHsl(sampleRgb) }
  }

  if (!rgb) {
    const sampleRgb = hexToRgb(SAMPLE_HEX)!
    return {
      hex: SAMPLE_HEX,
      rgb: sampleRgb,
      hsl: rgbToHsl(sampleRgb),
      error: 'Enter a valid HEX, RGB, or HSL color value.',
    }
  }

  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
  }
}

export type HarmonyKind = 'complementary' | 'analogous' | 'triadic'

export interface HarmonySwatch {
  label: string
  hex: string
}

export interface Harmony {
  kind: HarmonyKind
  title: string
  swatches: HarmonySwatch[]
}

const HARMONY_SHIFTS: { kind: HarmonyKind; title: string; shifts: [number, string][] }[] = [
  { kind: 'complementary', title: 'Complementary', shifts: [[180, '+180°']] },
  { kind: 'analogous', title: 'Analogous', shifts: [[-30, '−30°'], [30, '+30°']] },
  { kind: 'triadic', title: 'Triadic', shifts: [[120, '+120°'], [240, '+240°']] },
]

/** Rotates the hue of an RGB color in HSL space, keeping saturation and lightness. */
export function rotateHue(rgb: Rgb, degrees: number): Rgb {
  const hsl = rgbToHsl(rgb)
  return hslToRgb({ ...hsl, h: (((hsl.h + degrees) % 360) + 360) % 360 })
}

/** Complementary (+180°), analogous (±30°) and triadic (+120°, +240°) colors for a base color. */
export function getHarmonies(rgb: Rgb): Harmony[] {
  return HARMONY_SHIFTS.map(({ kind, title, shifts }) => ({
    kind,
    title,
    swatches: shifts.map(([degrees, label]) => ({ label, hex: rgbToHex(rotateHue(rgb, degrees)) })),
  }))
}
