import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import { tools } from '../../../tools/registry'
import { Check, X, Sparkles, RefreshCw, Palette, Eye, Copy, ArrowLeftRight } from 'lucide-react'
import CopyButton from '../../CopyButton'

// Helper: Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '').trim()
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  return null
}

// Helper: Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// Calculate relative luminance according to WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map(val => {
    const v = val / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB
}

// Calculate Contrast Ratio
function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Color blindness simulation matrices (Brettel / Machado)
type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

function simulateColorBlindness(rgb: { r: number; g: number; b: number }, type: ColorBlindnessType): { r: number; g: number; b: number } {
  const { r, g, b } = rgb
  switch (type) {
    case 'protanopia': // Red blind
      return {
        r: 0.56667 * r + 0.43333 * g + 0.0 * b,
        g: 0.55833 * r + 0.44167 * g + 0.0 * b,
        b: 0.0 * r + 0.24167 * g + 0.75833 * b,
      }
    case 'deuteranopia': // Green blind
      return {
        r: 0.625 * r + 0.375 * g + 0.0 * b,
        g: 0.7 * r + 0.3 * g + 0.0 * b,
        b: 0.0 * r + 0.3 * g + 0.7 * b,
      }
    case 'tritanopia': // Blue blind
      return {
        r: 0.95 * r + 0.05 * g + 0.0 * b,
        g: 0.0 * r + 0.43333 * g + 0.56667 * b,
        b: 0.0 * r + 0.475 * g + 0.525 * b,
      }
    case 'achromatopsia': { // Monochromacy
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      return { r: gray, g: gray, b: gray }
    }
    case 'normal':
    default:
      return rgb
  }
}

// Auto-adjust foreground to reach target contrast ratio
function suggestAccessibleColor(
  fgRgb: { r: number; g: number; b: number },
  bgRgb: { r: number; g: number; b: number },
  targetRatio: number = 4.5
): string {
  const bgL = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  const isBgDark = bgL < 0.5
  
  const currentRatio = getContrastRatio(fgRgb, bgRgb)
  if (currentRatio >= targetRatio) return rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b)

  // Step towards lighter or darker
  for (let step = 1; step <= 100; step++) {
    const factor = step / 100
    const candidate = isBgDark
      ? {
          r: fgRgb.r + (255 - fgRgb.r) * factor,
          g: fgRgb.g + (255 - fgRgb.g) * factor,
          b: fgRgb.b + (255 - fgRgb.b) * factor,
        }
      : {
          r: fgRgb.r * (1 - factor),
          g: fgRgb.g * (1 - factor),
          b: fgRgb.b * (1 - factor),
        }
    const ratio = getContrastRatio(candidate, bgRgb)
    if (ratio >= targetRatio) {
      return rgbToHex(candidate.r, candidate.g, candidate.b)
    }
  }

  return isBgDark ? '#FFFFFF' : '#000000'
}

const PRESETS = [
  { name: 'ToolBox Dark', fg: '#E4E4E7', bg: '#0F0F11' },
  { name: 'Indigo Accent', fg: '#6366F1', bg: '#0F0F11' },
  { name: 'Emerald on Dark', fg: '#34D399', bg: '#18181B' },
  { name: 'Classic Clean', fg: '#18181B', bg: '#FFFFFF' },
  { name: 'Blue on Light', fg: '#2563EB', bg: '#F8FAFC' },
  { name: 'Amber Warning', fg: '#F59E0B', bg: '#1E1E24' },
  { name: 'Catppuccin Mocha', fg: '#CDD6F4', bg: '#1E1E2E' },
  { name: 'GitHub Dark', fg: '#F0F6FC', bg: '#0D1117' },
]

export default function WcagContrastChecker() {
  const [fgColor, setFgColor] = useState('#E4E4E7')
  const [bgColor, setBgColor] = useState('#0F0F11')
  const [visionMode, setVisionMode] = useState<ColorBlindnessType>('normal')
  const [copiedSummary, setCopiedSummary] = useState(false)

  const meta = tools.find(t => t.slug === 'wcag-contrast-checker')

  const fgRgb = useMemo(() => hexToRgb(fgColor) || { r: 228, g: 228, b: 231 }, [fgColor])
  const bgRgb = useMemo(() => hexToRgb(bgColor) || { r: 15, g: 15, b: 17 }, [bgColor])

  const simulatedFg = useMemo(() => simulateColorBlindness(fgRgb, visionMode), [fgRgb, visionMode])
  const simulatedBg = useMemo(() => simulateColorBlindness(bgRgb, visionMode), [bgRgb, visionMode])

  const simulatedFgHex = useMemo(() => rgbToHex(simulatedFg.r, simulatedFg.g, simulatedFg.b), [simulatedFg])
  const simulatedBgHex = useMemo(() => rgbToHex(simulatedBg.r, simulatedBg.g, simulatedBg.b), [simulatedBg])

  const contrastRatio = useMemo(() => {
    return getContrastRatio(simulatedFg, simulatedBg)
  }, [simulatedFg, simulatedBg])

  const roundedRatio = contrastRatio.toFixed(2)

  // Evaluation criteria
  const normalTextAA = contrastRatio >= 4.5
  const normalTextAAA = contrastRatio >= 7.0
  const largeTextAA = contrastRatio >= 3.0
  const largeTextAAA = contrastRatio >= 4.5
  const uiComponentAA = contrastRatio >= 3.0

  const suggestedAA = useMemo(() => suggestAccessibleColor(fgRgb, bgRgb, 4.5), [fgRgb, bgRgb])
  const suggestedAAA = useMemo(() => suggestAccessibleColor(fgRgb, bgRgb, 7.0), [fgRgb, bgRgb])

  const handleSwap = () => {
    const oldFg = fgColor
    setFgColor(bgColor)
    setBgColor(oldFg)
  }

  const handleCopyReport = () => {
    const report = `WCAG 2.1 Contrast Report
Foreground: ${fgColor}
Background: ${bgColor}
Contrast Ratio: ${roundedRatio}:1
Vision Mode: ${visionMode.toUpperCase()}
• Normal Text AA (≥ 4.5:1): ${normalTextAA ? 'PASS' : 'FAIL'}
• Normal Text AAA (≥ 7.0:1): ${normalTextAAA ? 'PASS' : 'FAIL'}
• Large Text AA (≥ 3.0:1): ${largeTextAA ? 'PASS' : 'FAIL'}
• Large Text AAA (≥ 4.5:1): ${largeTextAAA ? 'PASS' : 'FAIL'}
• UI Components & Icons (≥ 3.0:1): ${uiComponentAA ? 'PASS' : 'FAIL'}
Generated by ToolBox4Devs (https://toolbox4devs.com/wcag-contrast-checker)`

    navigator.clipboard.writeText(report)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  return (
    <ToolLayout
      title={meta?.name || 'WCAG 2.1 Color Contrast Checker'}
      description={meta?.description || 'Test foreground and background color combinations against WCAG 2.1 AA and AAA standards with live UI simulation.'}
      tag="CONTRAST"
    >
      <div className="space-y-6">
        {/* Preset Palette Chips */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-dim mr-2">
            <Palette size={14} className="text-accent" />
            <span>Presets:</span>
          </div>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setFgColor(preset.fg)
                setBgColor(preset.bg)
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border/50 transition-colors"
            >
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: preset.fg }} />
                <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: preset.bg }} />
              </span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Color Inputs & Hero Contrast Score */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foreground Input */}
                <div>
                  <label className="block text-xs font-mono text-dim mb-1.5 font-medium">
                    Foreground Color (Text / Icon)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        placeholder="#FFFFFF"
                        className="w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
                      />
                    </div>
                    <input
                      type="color"
                      value={hexToRgb(fgColor) ? fgColor : '#000000'}
                      onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                    />
                  </div>
                </div>

                {/* Background Input */}
                <div>
                  <label className="block text-xs font-mono text-dim mb-1.5 font-medium">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#000000"
                        className="w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
                      />
                    </div>
                    <input
                      type="color"
                      value={hexToRgb(bgColor) ? bgColor : '#000000'}
                      onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Actions & Color Blindness filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border transition-colors"
                  >
                    <ArrowLeftRight size={13} />
                    Swap Colors
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border transition-colors"
                  >
                    {copiedSummary ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    {copiedSummary ? 'Copied Report' : 'Copy Report'}
                  </button>
                </div>

                {/* Color Blindness Simulation Dropdown */}
                <div className="flex items-center gap-2 text-xs font-mono text-dim">
                  <Eye size={14} className="text-accent" />
                  <span>Vision:</span>
                  <select
                    value={visionMode}
                    onChange={(e) => setVisionMode(e.target.value as ColorBlindnessType)}
                    className="bg-bg border border-border rounded px-2 py-1 text-bright text-xs font-mono focus:outline-none focus:border-accent"
                  >
                    <option value="normal">Normal Vision</option>
                    <option value="protanopia">Protanopia (Red-Blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                    <option value="achromatopsia">Achromatopsia (Monochrome)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Smart Suggestions & Auto-Fix */}
            {contrastRatio < 4.5 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
                  <Sparkles size={14} />
                  <span>Accessible Color Recommendations (Auto-Fix)</span>
                </div>
                <p className="text-xs text-dim">
                  Current combination fails WCAG AA standards. Click below to adjust to the nearest compliant foreground tone:
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setFgColor(suggestedAA)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full border border-amber-300" style={{ backgroundColor: suggestedAA }} />
                    <span>Fix for AA (4.5:1) → {suggestedAA}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFgColor(suggestedAAA)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full border border-amber-300" style={{ backgroundColor: suggestedAAA }} />
                    <span>Fix for AAA (7.0:1) → {suggestedAAA}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contrast Score Card Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="p-5 bg-surface border border-border rounded-xl flex-1 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Contrast Ratio</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-md font-semibold ${
                      contrastRatio >= 7
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : contrastRatio >= 4.5
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : contrastRatio >= 3.0
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {contrastRatio >= 7
                      ? 'AAA Very High'
                      : contrastRatio >= 4.5
                      ? 'AA Compliant'
                      : contrastRatio >= 3.0
                      ? 'Large Text Only'
                      : 'Fails Standards'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-bright tracking-tight">
                    {roundedRatio}
                  </span>
                  <span className="text-2xl font-mono text-dim">: 1</span>
                </div>

                {visionMode !== 'normal' && (
                  <p className="text-[11px] font-mono text-amber-400">
                    Simulating {visionMode.toUpperCase()} color perception
                  </p>
                )}
              </div>

              {/* Compliance Checklist Grid */}
              <div className="mt-5 pt-4 border-t border-border/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dim">Normal Text AA (≥ 4.5:1)</span>
                  <span className={`flex items-center gap-1 font-semibold ${normalTextAA ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {normalTextAA ? <Check size={14} /> : <X size={14} />}
                    {normalTextAA ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dim">Normal Text AAA (≥ 7.0:1)</span>
                  <span className={`flex items-center gap-1 font-semibold ${normalTextAAA ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {normalTextAAA ? <Check size={14} /> : <X size={14} />}
                    {normalTextAAA ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dim">Large Text AA (≥ 3.0:1)</span>
                  <span className={`flex items-center gap-1 font-semibold ${largeTextAA ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {largeTextAA ? <Check size={14} /> : <X size={14} />}
                    {largeTextAA ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dim">Large Text AAA (≥ 4.5:1)</span>
                  <span className={`flex items-center gap-1 font-semibold ${largeTextAAA ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {largeTextAAA ? <Check size={14} /> : <X size={14} />}
                    {largeTextAAA ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dim">UI Components / Icons (≥ 3.0:1)</span>
                  <span className={`flex items-center gap-1 font-semibold ${uiComponentAA ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {uiComponentAA ? <Check size={14} /> : <X size={14} />}
                    {uiComponentAA ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Visual Component Preview Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Real-World Component Previews</span>
            <span className="text-xs font-mono text-dim">
              Foreground: {simulatedFgHex} · Background: {simulatedBgHex}
            </span>
          </div>

          <div
            className="p-6 sm:p-8 rounded-xl border border-border transition-colors space-y-6 shadow-sm overflow-hidden"
            style={{
              backgroundColor: simulatedBgHex,
              color: simulatedFgHex,
            }}
          >
            {/* Heading & Paragraph */}
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Large Display Heading (18pt+ / 24px)
              </h2>
              <p className="text-sm sm:text-base leading-relaxed opacity-95">
                This is a regular body text paragraph demonstrating readability at standard font sizes (14–16px).
                Good contrast ensures all users, including individuals with low vision or varying ambient lighting, can read your content effortlessly.
              </p>
            </div>

            {/* Interactive Components Demo */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-transform active:scale-95"
                style={{
                  backgroundColor: simulatedFgHex,
                  color: simulatedBgHex,
                }}
              >
                Filled Button Action
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold border"
                style={{
                  borderColor: simulatedFgHex,
                  color: simulatedFgHex,
                }}
              >
                Outlined Secondary
              </button>

              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-medium border"
                style={{
                  borderColor: simulatedFgHex,
                  color: simulatedFgHex,
                }}
              >
                Status Badge Pill
              </span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
