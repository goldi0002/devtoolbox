import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import { SAMPLE_HEX, getHarmonies, parseColor } from '../../../utils/color'

export default function ColorConverter() {
  const [input, setInput] = useState(SAMPLE_HEX)
  const color = useMemo(() => parseColor(input), [input])
  const harmonies = useMemo(() => getHarmonies(color.rgb), [color.rgb])

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

        <section aria-labelledby="color-harmonies-heading" className="border border-border rounded bg-surface p-4 space-y-4">
          <div>
            <h2 id="color-harmonies-heading" className="text-sm font-semibold text-bright">Color harmonies</h2>
            <p className="text-xs font-mono text-subtle">Hue shifts of {color.hex} in HSL. Click a swatch to use it as the color.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {harmonies.map(harmony => (
              <div key={harmony.kind}>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">{harmony.title}</div>
                <div className="flex flex-wrap gap-2">
                  {harmony.swatches.map(swatch => (
                    <button
                      key={swatch.label}
                      type="button"
                      onClick={() => setInput(swatch.hex)}
                      aria-label={`Use ${harmony.title.toLowerCase()} color ${swatch.hex} (${swatch.label})`}
                      title={`${swatch.hex} (${swatch.label})`}
                      className="flex items-center gap-2 rounded border border-border bg-bg px-2 py-1.5 hover:border-accent transition-colors"
                    >
                      <span className="h-6 w-6 rounded border border-border/60" style={{ backgroundColor: swatch.hex }} aria-hidden="true" />
                      <span className="text-xs font-mono text-bright">{swatch.hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolLayout>
  )
}
