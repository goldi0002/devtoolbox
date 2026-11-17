import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import OutputPanel from '../../ui/OutputPanel'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  DEFAULT_LAYER,
  MAX_LAYERS,
  SHADOW_LIMITS,
  SHADOW_PRESETS,
  buildBoxShadow,
  formatBoxShadowCss,
  hexToRgb,
  toHex6,
  validateLayer,
  type ShadowLayer,
} from '../../../utils/boxShadow'

interface LayerDraft {
  id: number
  layer: ShadowLayer
}

let layerCounter = 0
const nextId = () => ++layerCounter

function toDrafts(layers: ShadowLayer[]): LayerDraft[] {
  return layers.map(layer => ({ id: nextId(), layer }))
}

function clampTo(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface NumberControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

/** A slider and a number box bound to the same value. The number box keeps its typed text until blur, so "-" can be typed. */
function NumberControl({ label, value, min, max, step = 1, unit = 'px', onChange }: NumberControlProps) {
  const [draft, setDraft] = useState<string | null>(null)

  const handleType = (text: string) => {
    setDraft(text)
    if (text.trim() === '') return
    const parsed = Number(text)
    if (Number.isFinite(parsed)) onChange(clampTo(parsed, min, max))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-dim font-mono">{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            aria-label={`${label} value`}
            value={draft ?? value}
            min={min}
            max={max}
            step={step}
            onChange={e => handleType(e.target.value)}
            onBlur={() => setDraft(null)}
            className="input-base w-20 text-right font-mono"
          />
          <span className="text-xs text-dim font-mono w-4">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
    </div>
  )
}

interface LayerEditorProps {
  index: number
  count: number
  layer: ShadowLayer
  onChange: (patch: Partial<ShadowLayer>) => void
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
}

function LayerEditor({ index, count, layer, onChange, onMove, onRemove }: LayerEditorProps) {
  const name = `Layer ${index + 1}`
  const errors = validateLayer(layer)
  const pickerValue = toHex6(layer.color) ?? '#000000'
  const colorIsValid = hexToRgb(layer.color) !== null

  return (
    <div role="group" aria-label={name} className="border border-border rounded-md p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-ghost"
            aria-label={`Move ${name} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-ghost"
            aria-label={`Move ${name} down`}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={14} aria-hidden="true" />
          </button>
          <button type="button" className="btn-ghost" aria-label={`Remove ${name}`} onClick={onRemove}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberControl
          label="X offset"
          value={layer.x}
          min={SHADOW_LIMITS.offset.min}
          max={SHADOW_LIMITS.offset.max}
          onChange={x => onChange({ x })}
        />
        <NumberControl
          label="Y offset"
          value={layer.y}
          min={SHADOW_LIMITS.offset.min}
          max={SHADOW_LIMITS.offset.max}
          onChange={y => onChange({ y })}
        />
        <NumberControl
          label="Blur"
          value={layer.blur}
          min={SHADOW_LIMITS.blur.min}
          max={SHADOW_LIMITS.blur.max}
          onChange={blur => onChange({ blur })}
        />
        <NumberControl
          label="Spread"
          value={layer.spread}
          min={SHADOW_LIMITS.spread.min}
          max={SHADOW_LIMITS.spread.max}
          onChange={spread => onChange({ spread })}
        />
        <NumberControl
          label="Opacity"
          value={layer.opacity}
          min={SHADOW_LIMITS.opacity.min}
          max={SHADOW_LIMITS.opacity.max}
          unit="%"
          onChange={opacity => onChange({ opacity })}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <span className="block text-xs text-dim font-mono">Colour</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Colour picker"
              value={pickerValue}
              onChange={e => onChange({ color: e.target.value })}
              className="h-9 w-12 p-0.5 border border-border rounded"
            />
            <input
              type="text"
              aria-label="Colour hex"
              aria-invalid={!colorIsValid}
              value={layer.color}
              spellCheck={false}
              onChange={e => onChange({ color: e.target.value })}
              className="input-base w-28 font-mono"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-dim">
          <input
            type="checkbox"
            checked={layer.inset}
            onChange={e => onChange({ inset: e.target.checked })}
            className="accent-[var(--color-accent)]"
          />
          Inset
        </label>
      </div>

      {errors.map(message => (
        <p key={message} role="alert" className="text-xs text-red-500">
          {name}: {message}
        </p>
      ))}
    </div>
  )
}

export default function BoxShadowGenerator() {
  const [drafts, setDrafts] = useState<LayerDraft[]>(() => toDrafts(SHADOW_PRESETS[1].layers))
  const [canvasColor, setCanvasColor] = useState('#f1f5f9')
  const [boxColor, setBoxColor] = useState('#ffffff')

  const layers = drafts.map(d => d.layer)
  const hasErrors = layers.some(layer => validateLayer(layer).length > 0)
  const css = hasErrors ? '' : formatBoxShadowCss(layers)
  const previewShadow = hasErrors ? 'none' : buildBoxShadow(layers) || 'none'

  const updateLayer = (id: number, patch: Partial<ShadowLayer>) =>
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, layer: { ...d.layer, ...patch } } : d)))

  const moveLayer = (index: number, delta: -1 | 1) =>
    setDrafts(prev => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const removeLayer = (id: number) => setDrafts(prev => prev.filter(d => d.id !== id))

  const addLayer = () =>
    setDrafts(prev => (prev.length >= MAX_LAYERS ? prev : [...prev, { id: nextId(), layer: { ...DEFAULT_LAYER } }]))

  const applyPreset = (presetLayers: ShadowLayer[]) => setDrafts(toDrafts(presetLayers))

  return (
    <ToolLayout
      title="Box Shadow Generator"
      description="Build layered CSS box-shadow values with a live preview and copy the CSS"
      tag="css"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Presets">
          <span className="text-xs text-dim font-mono mr-1">Presets:</span>
          {SHADOW_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              className="btn-ghost"
              title={preset.description}
              onClick={() => applyPreset(preset.layers)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionPanel title={`Layers (${drafts.length} of ${MAX_LAYERS})`}>
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <LayerEditor
                  key={draft.id}
                  index={index}
                  count={drafts.length}
                  layer={draft.layer}
                  onChange={patch => updateLayer(draft.id, patch)}
                  onMove={delta => moveLayer(index, delta)}
                  onRemove={() => removeLayer(draft.id)}
                />
              ))}
              {drafts.length === 0 && (
                <p className="text-sm text-dim">No layers. The shadow is set to none.</p>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={addLayer}
                disabled={drafts.length >= MAX_LAYERS}
              >
                <Plus size={14} aria-hidden="true" className="inline mr-1" />
                Add layer
              </button>
            </div>
          </SectionPanel>

          <div className="space-y-5">
            <SectionPanel title="Preview">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-xs font-mono text-dim">
                  <label className="flex items-center gap-2">
                    Canvas
                    <input
                      type="color"
                      aria-label="Canvas colour"
                      value={canvasColor}
                      onChange={e => setCanvasColor(e.target.value)}
                      className="h-8 w-10 p-0.5 border border-border rounded"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    Box
                    <input
                      type="color"
                      aria-label="Box colour"
                      value={boxColor}
                      onChange={e => setBoxColor(e.target.value)}
                      className="h-8 w-10 p-0.5 border border-border rounded"
                    />
                  </label>
                </div>
                <div
                  className="flex items-center justify-center rounded-lg p-10 min-h-[260px]"
                  style={{ background: canvasColor }}
                >
                  <div
                    data-testid="shadow-preview"
                    className="w-40 h-28 rounded-xl"
                    style={{ background: boxColor, boxShadow: previewShadow }}
                  />
                </div>
              </div>
            </SectionPanel>

            <OutputPanel
              label="CSS"
              value={css}
              language="css"
              error={hasErrors ? 'Fix the highlighted layer(s) to generate CSS.' : ''}
              placeholder="Add a layer to generate CSS."
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
