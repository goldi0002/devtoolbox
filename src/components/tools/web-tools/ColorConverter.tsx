import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

type Rgb = { r: number; g: number; b: number }
type Hsl = { h: number; s: number; l: number }

type ColorState = {
  hex: string
  rgb: Rgb
  hsl: Hsl
  error?: string
}

const SAMPLE_HEX = '#7c3aed'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function componentToHex(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0').toUpperCase()
}

function rgbToHex(rgb: Rgb) {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`
}

function hexToRgb(hex: string): Rgb | null {
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

function rgbToHsl({ r, g, b }: Rgb): Hsl {
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

function hslToRgb({ h, s, l }: Hsl): Rgb {
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

function parseRgb(input: string): Rgb | null {
  const values = input.match(/\d+/g)
  if (!values || values.length < 3) return null
  const [r, g, b] = values.slice(0, 3).map(Number)
  if ([r, g, b].some(value => Number.isNaN(value) || value < 0 || value > 255)) return null
  return { r, g, b }
}

function parseHsl(input: string): Hsl | null {
  const values = input.match(/-?\d+(?:\.\d+)?/g)
  if (!values || values.length < 3) return null
  const [h, s, l] = values.slice(0, 3).map(Number)
  if ([h, s, l].some(value => Number.isNaN(value))) return null
  if (s < 0 || s > 100 || l < 0 || l > 100) return null
  return { h, s, l }
}

function parseColor(input: string): ColorState {
  const trimmed = input.trim()
  const rgb = hexToRgb(trimmed) ?? parseRgb(trimmed) ?? (parseHsl(trimmed) ? hslToRgb(parseHsl(trimmed)!) : null)

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

export default function ColorConverter() {
  const [input, setInput] = useState(SAMPLE_HEX)
  const color = useMemo(() => parseColor(input), [input])

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert HEX, RGB, and HSL values instantly with a live preview"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setInput(SAMPLE_HEX)} className="btn-primary">Load sample</button>
          <button onClick={() => setInput('')} className="btn-ghost">Clear</button>
          <span className="ml-auto text-[10px] font-mono text-subtle">Examples: #0EA5E9 · rgb(14,165,233) · hsl(199, 89%, 48%)</span>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">Color input</label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-base w-full"
            placeholder="#7c3aed"
            spellCheck={false}
          />
          {color.error && <p className="mt-2 text-xs font-mono text-subtle">{color.error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <div className="border border-border rounded overflow-hidden bg-surface">
            <div className="h-48 border-b border-border" style={{ backgroundColor: color.hex }} />
            <div className="p-4 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">Preview</div>
              <div className="text-sm font-mono text-bright">{color.hex}</div>
              <div className="text-xs font-mono text-subtle">rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</div>
              <div className="text-xs font-mono text-subtle">hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'HEX', value: color.hex },
              { label: 'RGB', value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
              { label: 'HSL', value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)` },
            ].map(item => (
              <div key={item.label} className="border border-border rounded bg-surface p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle">{item.label}</span>
                  <CopyButton text={item.value} />
                </div>
                <div className="text-sm font-mono text-bright break-all leading-relaxed">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
