import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import SectionPanel from '../../ui/SectionPanel'
import {
  CUBIC_BEZIER_PRESETS,
  PLOT_SIZE,
  X_MAX,
  X_MIN,
  Y_MAX,
  Y_MIN,
  clamp,
  findPreset,
  formatCubicBezier,
  formatNumber,
  formatTransitionCss,
  fromPlot,
  parseCubicBezier,
  presetById,
  sampleCurve,
  toPlot,
  yDomain,
  type Easing,
} from '../../../utils/cubicBezier'

const DEFAULT_EASING: Easing = presetById('easeOutBack')!.value
const DURATION_MS = 1200
const TRAVEL_END = 'calc(100% - 2.5rem)'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

interface CoordinateFieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}

/**
 * Labeled numeric field. Typing commits a clamped value as soon as the text is a
 * number, so partial input like "0." does not get overwritten. Up and Down step
 * by 0.01 (0.1 with Shift). Blur shows the committed value.
 */
function CoordinateField({ id, label, value, min, max, onCommit }: CoordinateFieldProps) {
  const [draft, setDraft] = useState(() => formatNumber(value))
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    if (Number(draft) !== value) setDraft(formatNumber(value))
  }

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-dim font-mono mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={draft}
        className="input-base w-full"
        onChange={e => {
          const text = e.target.value
          setDraft(text)
          const parsed = Number(text)
          if (text.trim() !== '' && Number.isFinite(parsed)) onCommit(clamp(parsed, min, max))
        }}
        onKeyDown={e => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
          e.preventDefault()
          const step = e.shiftKey ? 0.1 : 0.01
          const next = clamp(Number((value + (e.key === 'ArrowUp' ? step : -step)).toFixed(3)), min, max)
          onCommit(next)
          setDraft(formatNumber(next))
        }}
        onBlur={() => setDraft(formatNumber(value))}
      />
    </div>
  )
}

/** A box that travels along the timing function. It remounts on each replay. */
function TravelBox({ timing, reducedMotion }: { timing: string; reducedMotion: boolean }) {
  const [atEnd, setAtEnd] = useState(reducedMotion)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) {
      setAtEnd(true)
      return
    }
    // Read layout first so the start position is styled before the move begins.
    boxRef.current?.getBoundingClientRect()
    setAtEnd(true)
  }, [reducedMotion])

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      data-testid="easing-box"
      className="absolute top-2 h-10 w-10 rounded-md bg-[var(--color-accent)]"
      style={{
        left: atEnd ? TRAVEL_END : '0px',
        transition: reducedMotion ? 'none' : `left ${DURATION_MS}ms ${timing}`,
      }}
    />
  )
}

export default function CubicBezierEditor() {
  const uid = useId()
  const [easing, setEasing] = useState<Easing>(DEFAULT_EASING)
  const [pasteText, setPasteText] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [pasteClamped, setPasteClamped] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef<0 | 1 | null>(null)

  const domain = yDomain(easing)
  const cssValue = formatCubicBezier(easing)
  const cssDeclaration = formatTransitionCss(easing)
  const preset = findPreset(easing)
  const curvePoints = sampleCurve(easing, 48)
    .map(p => {
      const { px, py } = toPlot(p.x, p.y, domain)
      return `${px.toFixed(1)},${py.toFixed(1)}`
    })
    .join(' ')
  const handle1 = toPlot(easing[0], easing[1], domain)
  const handle2 = toPlot(easing[2], easing[3], domain)
  const origin = toPlot(0, 0, domain)
  const top = toPlot(1, 1, domain)

  const setComponent = (index: 0 | 1 | 2 | 3, value: number) => {
    setEasing(prev => {
      const next = [...prev] as [number, number, number, number]
      next[index] = value
      return next
    })
  }

  const applyPreset = (value: Easing) => {
    setEasing(value)
    setPasteError(null)
    setPasteClamped(false)
  }

  const handlePaste = (text: string) => {
    setPasteText(text)
    if (!text.trim()) {
      setPasteError(null)
      setPasteClamped(false)
      return
    }
    const result = parseCubicBezier(text)
    if (result.ok) {
      setEasing(result.value)
      setPasteError(null)
      setPasteClamped(result.clamped)
    } else {
      setPasteError(result.error)
      setPasteClamped(false)
    }
  }

  const startDrag = (index: 0 | 1) => (event: ReactPointerEvent<SVGCircleElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    draggingRef.current = index
  }

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const index = draggingRef.current
    const svg = svgRef.current
    if (index === null || !svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * PLOT_SIZE
    const py = ((event.clientY - rect.top) / rect.height) * PLOT_SIZE
    setEasing(prev => {
      const point = fromPlot(px, py, yDomain(prev))
      const next = [...prev] as [number, number, number, number]
      next[index * 2] = point.x
      next[index * 2 + 1] = point.y
      return next
    })
  }

  const endDrag = () => {
    draggingRef.current = null
  }

  return (
    <ToolLayout
      title="Cubic-Bezier Easing Editor"
      description="Shape a CSS easing curve by dragging its handles or typing values, then copy the cubic-bezier() value"
      tag="CSS"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <SectionPanel label="Curve">
            <div className="p-4 space-y-4">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${PLOT_SIZE} ${PLOT_SIZE}`}
                role="img"
                aria-label={`Easing curve ${cssValue}`}
                className="w-full max-w-xs mx-auto touch-none select-none text-dim"
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <rect
                  x={origin.px}
                  y={top.py}
                  width={top.px - origin.px}
                  height={origin.py - top.py}
                  fill="var(--color-accent)"
                  fillOpacity={0.06}
                  stroke="currentColor"
                  strokeOpacity={0.35}
                />
                <line x1={0} x2={PLOT_SIZE} y1={origin.py} y2={origin.py} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
                <line x1={0} x2={PLOT_SIZE} y1={top.py} y2={top.py} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
                <line x1={origin.px} x2={origin.px} y1={0} y2={PLOT_SIZE} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
                <line x1={top.px} x2={top.px} y1={0} y2={PLOT_SIZE} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
                <line x1={origin.px} y1={origin.py} x2={handle1.px} y2={handle1.py} stroke="currentColor" strokeOpacity={0.5} />
                <line x1={top.px} y1={top.py} x2={handle2.px} y2={handle2.py} stroke="currentColor" strokeOpacity={0.5} />
                <polyline points={curvePoints} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} strokeLinejoin="round" />
                <circle
                  cx={handle1.px}
                  cy={handle1.py}
                  r={7}
                  fill="var(--color-accent)"
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={startDrag(0)}
                />
                <circle
                  cx={handle2.px}
                  cy={handle2.py}
                  r={7}
                  fill="var(--color-accent)"
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={startDrag(1)}
                />
              </svg>
              <p className="text-xs text-dim text-center">
                Drag the two handles, or type the values below. {preset ? `Matches preset ${preset.name}.` : 'Custom curve.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <CoordinateField id={`${uid}-x1`} label="x1" value={easing[0]} min={X_MIN} max={X_MAX} onCommit={v => setComponent(0, v)} />
                <CoordinateField id={`${uid}-y1`} label="y1" value={easing[1]} min={Y_MIN} max={Y_MAX} onCommit={v => setComponent(1, v)} />
                <CoordinateField id={`${uid}-x2`} label="x2" value={easing[2]} min={X_MIN} max={X_MAX} onCommit={v => setComponent(2, v)} />
                <CoordinateField id={`${uid}-y2`} label="y2" value={easing[3]} min={Y_MIN} max={Y_MAX} onCommit={v => setComponent(3, v)} />
              </div>
              <p className="text-xs text-dim">
                x is limited to 0 to 1. y can go from -2 to 2 so the curve can overshoot. Up and Down change the focused value by 0.01, or 0.1 with Shift.
              </p>
            </div>
          </SectionPanel>

          <SectionPanel label="Presets & paste">
            <div className="p-4 space-y-4">
              <div role="group" aria-label="Presets" className="flex flex-wrap gap-2">
                {CUBIC_BEZIER_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={preset?.id === p.id}
                    onClick={() => applyPreset(p.value)}
                    className={preset?.id === p.id ? 'btn-primary' : 'btn-ghost'}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor={`${uid}-paste`} className="block text-xs text-dim font-mono mb-1.5">
                  Paste cubic-bezier() or a CSS keyword
                </label>
                <input
                  id={`${uid}-paste`}
                  type="text"
                  value={pasteText}
                  onChange={e => handlePaste(e.target.value)}
                  placeholder="cubic-bezier(0.68, -0.6, 0.32, 1.6)"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={pasteError ? true : undefined}
                  className="input-base w-full"
                />
              </div>
              {pasteError && <ErrorBanner message={pasteError} />}
              {pasteClamped && (
                <p role="status" className="text-xs text-dim">
                  Some values were outside the editor range and were clamped (x to 0 to 1, y to -2 to 2).
                </p>
              )}
            </div>
          </SectionPanel>
        </div>

        <div className="space-y-5">
          <SectionPanel label="Preview">
            <div className="p-4 space-y-3">
              <div className="relative h-14 overflow-hidden rounded-md border border-border bg-surface">
                <TravelBox key={runKey} timing={cssValue} reducedMotion={reducedMotion} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-xs text-dim">
                  {reducedMotion ? 'Reduced motion is on, so the box shows only its end position.' : `Plays over ${DURATION_MS} ms.`}
                </p>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={reducedMotion}
                  onClick={() => setRunKey(k => k + 1)}
                >
                  Replay
                </button>
              </div>
            </div>
          </SectionPanel>

          <SectionPanel label="CSS output">
            <div className="p-4 space-y-3 text-xs font-mono">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <code data-testid="css-timing" className="break-all">{cssValue}</code>
                <CopyButton text={cssValue} label="Copy cubic-bezier" />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <code data-testid="css-declaration" className="break-all">{cssDeclaration}</code>
                <CopyButton text={cssDeclaration} label="Copy declaration" />
              </div>
            </div>
          </SectionPanel>
        </div>
      </div>
    </ToolLayout>
  )
}
