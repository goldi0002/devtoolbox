import { useMemo, useRef, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import {
  DEFAULT_GRADIENT,
  GRADIENT_PRESETS,
  GRADIENT_TYPE_LABELS,
  MAX_STOPS,
  MIN_STOPS,
  RADIAL_SHAPE_LABELS,
  buildBackgroundDeclaration,
  buildGradientValue,
  clampAngle,
  clampPercent,
  createStopBetween,
  normalizeHexColor,
  removeStopAt,
  validateStops,
  type ColorStop,
  type GradientConfig,
  type GradientType,
  type RadialShape,
} from '../../../utils/cssGradient'

/** A stop in the editor. The id is only a React key, so it never reaches the CSS. */
interface EditableStop extends ColorStop {
  id: number
}

interface EditorState {
  type: GradientType
  angle: number
  shape: RadialShape
  x: number
  y: number
  stops: EditableStop[]
}

const GRADIENT_TYPES = Object.keys(GRADIENT_TYPE_LABELS) as GradientType[]
const RADIAL_SHAPES = Object.keys(RADIAL_SHAPE_LABELS) as RadialShape[]

const INPUT_CLASS =
  'w-full px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500'
const LABEL_CLASS = 'block text-xs font-mono text-subtle mb-2 font-medium'

/** Reads a number typed into a field. Returns null while the field holds text that is not a number. */
function parseNumber(raw: string): number | null {
  const parsed = parseFloat(raw)
  return Number.isNaN(parsed) ? null : parsed
}

export default function CssGradientGenerator() {
  const [state, setState] = useState<EditorState>(() => toEditorState(DEFAULT_GRADIENT, 0))
  const lastId = useRef(DEFAULT_GRADIENT.stops.length)
  const newId = () => {
    lastId.current += 1
    return lastId.current
  }

  const config: GradientConfig = useMemo(
    () => ({
      type: state.type,
      angle: state.angle,
      shape: state.shape,
      x: state.x,
      y: state.y,
      stops: state.stops.map(({ color, position }) => ({ color, position })),
    }),
    [state],
  )

  const declaration = buildBackgroundDeclaration(config)
  const gradientValue = buildGradientValue(config)
  const stopMessages = validateStops(config.stops)
  const showAngle = state.type === 'linear' || state.type === 'conic'
  const showShape = state.type === 'radial'
  const showCenter = state.type === 'radial' || state.type === 'conic'
  const atMinStops = state.stops.length <= MIN_STOPS
  const atMaxStops = state.stops.length >= MAX_STOPS

  const update = (patch: Partial<Omit<EditorState, 'stops'>>) =>
    setState(prev => ({ ...prev, ...patch }))

  const setAngle = (raw: string) => {
    const parsed = parseNumber(raw)
    if (parsed !== null) update({ angle: clampAngle(parsed) })
  }

  const setCenter = (axis: 'x' | 'y', raw: string) => {
    const parsed = parseNumber(raw)
    if (parsed === null) return
    const clamped = clampPercent(parsed)
    update(axis === 'x' ? { x: clamped } : { y: clamped })
  }

  const updateStop = (id: number, patch: Partial<ColorStop>) =>
    setState(prev => ({
      ...prev,
      stops: prev.stops.map(stop => (stop.id === id ? { ...stop, ...patch } : stop)),
    }))

  const addStop = () => {
    const id = newId()
    setState(prev =>
      prev.stops.length >= MAX_STOPS
        ? prev
        : { ...prev, stops: [...prev.stops, { id, ...createStopBetween(prev.stops) }] },
    )
  }

  const removeStop = (index: number) =>
    setState(prev => ({ ...prev, stops: removeStopAt(prev.stops, index) }))

  const applyPreset = (preset: GradientConfig) => {
    const ids = preset.stops.map(() => newId())
    setState({
      type: preset.type,
      angle: clampAngle(preset.angle),
      shape: preset.shape,
      x: clampPercent(preset.x),
      y: clampPercent(preset.y),
      stops: preset.stops.map((stop, i) => ({ ...stop, id: ids[i] })),
    })
  }

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Build linear, radial and conic CSS gradients with color stops, a live preview and copy-ready CSS"
      tag="web"
    >
      <div className="space-y-6">
        <SectionPanel title="Gradient">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gradient-type" className={LABEL_CLASS}>
                Gradient type
              </label>
              <select
                id="gradient-type"
                value={state.type}
                onChange={e => update({ type: e.target.value as GradientType })}
                className={INPUT_CLASS}
              >
                {GRADIENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {GRADIENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {showShape && (
              <div>
                <label htmlFor="gradient-shape" className={LABEL_CLASS}>
                  Shape
                </label>
                <select
                  id="gradient-shape"
                  value={state.shape}
                  onChange={e => update({ shape: e.target.value as RadialShape })}
                  className={INPUT_CLASS}
                >
                  {RADIAL_SHAPES.map(shape => (
                    <option key={shape} value={shape}>
                      {RADIAL_SHAPE_LABELS[shape]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {showAngle && (
              <div className="md:col-span-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-[10rem_minmax(0,1fr)] gap-4 items-end">
                  <div>
                    <label htmlFor="gradient-angle" className={LABEL_CLASS}>
                      Angle (degrees)
                    </label>
                    <input
                      id="gradient-angle"
                      type="number"
                      min={0}
                      max={360}
                      step="any"
                      value={state.angle}
                      onChange={e => setAngle(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <input
                      type="range"
                      aria-label="Angle slider"
                      min={0}
                      max={360}
                      step={1}
                      value={state.angle}
                      onChange={e => setAngle(e.target.value)}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {showCenter && (
              <>
                <div>
                  <label htmlFor="gradient-center-x" className={LABEL_CLASS}>
                    Center X (%)
                  </label>
                  <input
                    id="gradient-center-x"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={state.x}
                    onChange={e => setCenter('x', e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="gradient-center-y" className={LABEL_CLASS}>
                    Center Y (%)
                  </label>
                  <input
                    id="gradient-center-y"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={state.y}
                    onChange={e => setCenter('y', e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </>
            )}
          </div>
        </SectionPanel>

        <SectionPanel title="Color stops">
          <div className="space-y-4">
            <ul className="space-y-3">
              {state.stops.map((stop, index) => {
                const number = index + 1
                const normalized = normalizeHexColor(stop.color)
                const invalid = normalized === null
                return (
                  <li
                    key={stop.id}
                    className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-border bg-surface"
                  >
                    <div>
                      <label htmlFor={`stop-${stop.id}-picker`} className={LABEL_CLASS}>
                        Color {number}
                      </label>
                      <input
                        id={`stop-${stop.id}-picker`}
                        type="color"
                        aria-label={`Stop ${number} color picker`}
                        value={normalized ?? '#000000'}
                        onChange={e => updateStop(stop.id, { color: e.target.value })}
                        className="h-11 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-[10rem]">
                      <label htmlFor={`stop-${stop.id}-hex`} className={LABEL_CLASS}>
                        Hex
                      </label>
                      <input
                        id={`stop-${stop.id}-hex`}
                        type="text"
                        aria-label={`Stop ${number} hex color`}
                        aria-invalid={invalid}
                        value={stop.color}
                        onChange={e => updateStop(stop.id, { color: e.target.value })}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="#6366f1"
                        className={`${INPUT_CLASS} ${invalid ? 'border-amber-500' : ''}`}
                      />
                    </div>
                    <div className="w-28">
                      <label htmlFor={`stop-${stop.id}-position`} className={LABEL_CLASS}>
                        Position (%)
                      </label>
                      <input
                        id={`stop-${stop.id}-position`}
                        type="number"
                        aria-label={`Stop ${number} position (%)`}
                        min={0}
                        max={100}
                        step="any"
                        value={stop.position}
                        onChange={e => {
                          const parsed = parseNumber(e.target.value)
                          if (parsed !== null) updateStop(stop.id, { position: clampPercent(parsed) })
                        }}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove stop ${number}`}
                      disabled={atMinStops}
                      onClick={() => removeStop(index)}
                      className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addStop}
                disabled={atMaxStops}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add color stop
              </button>
              <p className="text-xs text-dim font-mono">
                {state.stops.length} of {MAX_STOPS} stops. Stops are sorted by position in the CSS output.
              </p>
            </div>

            {stopMessages.length > 0 && (
              <ul role="status" className="space-y-1">
                {stopMessages.map(message => (
                  <li key={message} className="text-xs font-mono text-amber-500">
                    {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionPanel>

        <SectionPanel title="Presets">
          <div className="flex flex-wrap gap-2">
            {GRADIENT_PRESETS.map(preset => (
              <button key={preset.id} type="button" onClick={() => applyPreset(preset.config)} className="btn-ghost">
                {preset.name}
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Preview">
          <div
            role="img"
            aria-label="Gradient preview"
            data-testid="gradient-preview"
            className="h-48 w-full rounded-lg border border-border bg-muted"
            style={gradientValue ? { background: gradientValue } : undefined}
          />
        </SectionPanel>

        <SectionPanel title="CSS output" copyText={declaration ?? ''}>
          <pre
            data-testid="gradient-css-output"
            className="p-4 text-sm font-mono text-bright whitespace-pre-wrap break-all"
          >
            {declaration ?? 'Add at least two valid color stops to see the CSS.'}
          </pre>
        </SectionPanel>
      </div>
    </ToolLayout>
  )
}

/** Turns a gradient config into editor state, giving each stop a fresh React key. */
function toEditorState(config: GradientConfig, startId: number): EditorState {
  return {
    type: config.type,
    angle: config.angle,
    shape: config.shape,
    x: config.x,
    y: config.y,
    stops: config.stops.map((stop, i) => ({ ...stop, id: startId + i + 1 })),
  }
}
