import { useState, useMemo } from 'react'
import { convertCssUnit, generateClampCss } from '../../utils/cssUnits'
import CopyButton from '../CopyButton'
import { Ruler, Maximize2, Sparkles, Layers } from 'lucide-react'

export default function CssUnitConverter() {
  const [val, setVal] = useState<number>(16)
  const [unit, setUnit] = useState<'px' | 'rem' | 'em' | 'vw' | 'vh' | 'percent' | 'pt'>('px')
  const [baseFontSize, setBaseFontSize] = useState<number>(16)
  const [viewportWidth, setViewportWidth] = useState<number>(1920)
  const [viewportHeight, setViewportHeight] = useState<number>(1080)

  // Fluid Clamp Generator State
  const [clampMinPx, setClampMinPx] = useState(16)
  const [clampMaxPx, setClampMaxPx] = useState(32)
  const [clampMinVw, setClampMinVw] = useState(375)
  const [clampMaxVw, setClampMaxVw] = useState(1440)

  const conversion = useMemo(() => {
    return convertCssUnit(val || 0, unit, baseFontSize, viewportWidth, viewportHeight)
  }, [val, unit, baseFontSize, viewportWidth, viewportHeight])

  const clampCss = useMemo(() => {
    return generateClampCss(clampMinPx, clampMaxPx, clampMinVw, clampMaxVw, baseFontSize)
  }, [clampMinPx, clampMaxPx, clampMinVw, clampMaxVw, baseFontSize])

  return (
    <div className="space-y-6">
      {/* ── Top Converter & Settings ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="unit-val" className="block text-xs font-mono text-subtle mb-2 font-medium">
              Value to Convert
            </label>
            <div className="flex gap-2">
              <input
                id="unit-val"
                type="number"
                step="any"
                value={val}
                onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
              >
                <option value="px">px (Pixels)</option>
                <option value="rem">rem (Root EM)</option>
                <option value="em">em</option>
                <option value="vw">vw (Viewport Width)</option>
                <option value="vh">vh (Viewport Height)</option>
                <option value="percent">% (Percentage)</option>
                <option value="pt">pt (Points)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="base-font" className="block text-xs font-mono text-subtle mb-2 font-medium">
              Base Font Size (px)
            </label>
            <input
              id="base-font"
              type="number"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(parseFloat(e.target.value) || 16)}
              className="w-full px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Viewport Settings */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/50 text-xs font-mono text-dim">
          <span>Viewport Context:</span>
          <div className="flex items-center gap-2">
            <label className="text-muted">Width:</label>
            <input
              type="number"
              value={viewportWidth}
              onChange={(e) => setViewportWidth(parseFloat(e.target.value) || 1920)}
              className="w-20 px-2 py-1 bg-muted/30 border border-border rounded text-bright text-center"
            />
            <span>px</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-muted">Height:</label>
            <input
              type="number"
              value={viewportHeight}
              onChange={(e) => setViewportHeight(parseFloat(e.target.value) || 1080)}
              className="w-20 px-2 py-1 bg-muted/30 border border-border rounded text-bright text-center"
            />
            <span>px</span>
          </div>
        </div>
      </div>

      {/* ── Conversion Matrix ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Pixels (px)</span>
            <span className="text-lg font-bold font-mono text-bright">{conversion.px}px</span>
          </div>
          <CopyButton text={`${conversion.px}px`} />
        </div>

        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Root EM (rem)</span>
            <span className="text-lg font-bold font-mono text-indigo-400">{conversion.rem}rem</span>
          </div>
          <CopyButton text={`${conversion.rem}rem`} />
        </div>

        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Viewport Width (vw)</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{conversion.vw}vw</span>
          </div>
          <CopyButton text={`${conversion.vw}vw`} />
        </div>

        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Points (pt)</span>
            <span className="text-lg font-bold font-mono text-amber-400">{conversion.pt}pt</span>
          </div>
          <CopyButton text={`${conversion.pt}pt`} />
        </div>
      </div>

      {/* ── Tailwind Matching & CSS Helpers ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Tailwind Spacing Equivalent</span>
            <span className="text-sm font-bold font-mono text-indigo-300">{conversion.tailwindWidth}</span>
          </div>
          <CopyButton text={conversion.tailwindWidth} />
        </div>

        <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Tailwind Font Size</span>
            <span className="text-sm font-bold font-mono text-indigo-300">{conversion.tailwindText}</span>
          </div>
          <CopyButton text={conversion.tailwindText} />
        </div>
      </div>

      {/* ── Fluid Typography clamp() Generator ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <Maximize2 size={14} className="text-indigo-400" />
            Fluid Typography & Spacing CSS clamp() Formula Generator
          </h3>
          <CopyButton text={`font-size: ${clampCss};`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-subtle block mb-1">Min Value (px)</label>
            <input
              type="number"
              value={clampMinPx}
              onChange={(e) => setClampMinPx(parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-muted/40 border border-border rounded text-bright"
            />
          </div>

          <div>
            <label className="text-subtle block mb-1">Max Value (px)</label>
            <input
              type="number"
              value={clampMaxPx}
              onChange={(e) => setClampMaxPx(parseFloat(e.target.value) || 0)}
              className="w-full p-2 bg-muted/40 border border-border rounded text-bright"
            />
          </div>

          <div>
            <label className="text-subtle block mb-1">Min Viewport (px)</label>
            <input
              type="number"
              value={clampMinVw}
              onChange={(e) => setClampMinVw(parseFloat(e.target.value) || 375)}
              className="w-full p-2 bg-muted/40 border border-border rounded text-bright"
            />
          </div>

          <div>
            <label className="text-subtle block mb-1">Max Viewport (px)</label>
            <input
              type="number"
              value={clampMaxVw}
              onChange={(e) => setClampMaxVw(parseFloat(e.target.value) || 1440)}
              className="w-full p-2 bg-muted/40 border border-border rounded text-bright"
            />
          </div>
        </div>

        <div className="p-3.5 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
          <code className="text-xs font-mono text-emerald-400 select-all font-semibold">{clampCss}</code>
          <CopyButton text={clampCss} />
        </div>
      </div>
    </div>
  )
}
