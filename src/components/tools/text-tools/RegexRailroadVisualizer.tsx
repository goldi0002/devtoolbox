import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextInputField from '../../ui/TextInputField'
import TextAreaField from '../../ui/TextAreaField'
import ErrorBanner from '../../ui/ErrorBanner'
import CopyButton from '../../CopyButton'
import {
  explainRegexAst,
  parseRegexToAst,
  renderRegexRailroadSvg,
} from '../../../utils/regexRailroad'

interface RegexPreset {
  label: string
  pattern: string
  flags: string
  sample: string
}

const PRESETS: RegexPreset[] = [
  {
    label: 'Email',
    pattern: '^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})$',
    flags: 'gm',
    sample: 'ada@analytical-engine.org\ninvalid-email@\nsupport@toolbox4devs.com',
  },
  {
    label: 'SemVer',
    pattern: '^v?(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?$',
    flags: 'gm',
    sample: 'v2.4.0-beta.1\n1.0.0\nnot-semver',
  },
  {
    label: 'ISO Date',
    pattern: '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])(?:T(\\d{2}):(\\d{2}):(\\d{2})Z)?',
    flags: 'g',
    sample: 'Deployed 2026-11-21T21:30:00Z, rollback planned 2026-12-01',
  },
  {
    label: 'IPv4 Address',
    pattern: '\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}\\b',
    flags: 'g',
    sample: 'Primary 10.0.12.42, fallback 192.168.1.254, invalid 999.1.1.1',
  },
  {
    label: 'JWT Structure',
    pattern: '^(?<header>[A-Za-z0-9_-]+)\\.(?<payload>[A-Za-z0-9_-]+)\\.(?<sig>[A-Za-z0-9_-]+)$',
    flags: 'm',
    sample: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature123',
  },
]

const FLAG_ITEMS = [
  { key: 'g', label: 'global' },
  { key: 'i', label: 'case-insensitive' },
  { key: 'm', label: 'multiline' },
  { key: 's', label: 'dotAll' },
  { key: 'u', label: 'unicode' },
]

export default function RegexRailroadVisualizer() {
  const [pattern, setPattern] = useState<string>(PRESETS[0].pattern)
  const [flags, setFlags] = useState<string>(PRESETS[0].flags)
  const [testText, setTestText] = useState<string>(PRESETS[0].sample)
  const [zoom, setZoom] = useState<number>(100)

  const regexValidation = useMemo(() => {
    if (!pattern) return { regex: null as RegExp | null, error: '' }
    try {
      return { regex: new RegExp(pattern, flags), error: '' }
    } catch (err) {
      return {
        regex: null,
        error: err instanceof Error ? err.message : 'Invalid regular expression.',
      }
    }
  }, [pattern, flags])

  const diagram = useMemo(() => renderRegexRailroadSvg(pattern), [pattern])

  const explanations = useMemo(() => {
    if (!pattern) return []
    const ast = parseRegexToAst(pattern)
    return explainRegexAst(ast)
  }, [pattern])

  const liveMatches = useMemo(() => {
    const r = regexValidation.regex
    if (!r || !testText) return []
    const matches: { match: string; index: number }[] = []
    if (r.flags.includes('g')) {
      const clone = new RegExp(r.source, r.flags)
      let m: RegExpExecArray | null
      while ((m = clone.exec(testText)) !== null) {
        matches.push({ match: m[0], index: m.index })
        if (m[0].length === 0) clone.lastIndex++
        if (matches.length >= 100) break
      }
    } else {
      const m = r.exec(testText)
      if (m) matches.push({ match: m[0], index: m.index })
    }
    return matches
  }, [regexValidation.regex, testText])

  const toggleFlag = (f: string) => {
    setFlags(prev => (prev.includes(f) ? prev.replace(f, '') : prev + f))
  }

  const handleDownloadSvg = () => {
    const blob = new Blob([diagram.svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `regex-railroad-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Regex Railroad Visualizer & Explainer"
      description="Render interactive SVG railroad state diagrams, token-by-token plain-English breakdowns, and live matches for any regex"
      tag="regex"
    >
      <div className="space-y-6">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-subtle">Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPattern(p.pattern)
                setFlags(p.flags)
                setTestText(p.sample)
              }}
              className="btn-ghost text-xs py-1 px-2.5"
            >
              {p.label}
            </button>
          ))}
        </div>

        <SectionPanel title="Regular Expression">
          <div className="space-y-4">
            <TextInputField
              label="Regex Pattern"
              value={pattern}
              onChange={setPattern}
              placeholder="e.g. ^([a-z0-9-]+)@([a-z0-9.-]+)$"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-mono text-dim mr-1">Flags:</span>
                {FLAG_ITEMS.map(f => {
                  const active = flags.includes(f.key)
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggleFlag(f.key)}
                      aria-pressed={active}
                      className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                        active
                          ? 'bg-accent text-accent-fg border-accent font-semibold'
                          : 'bg-surface border-border text-dim hover:text-bright'
                      }`}
                    >
                      {f.key} · {f.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-subtle">Zoom:</span>
                {[75, 100, 125, 150].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setZoom(pct)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border tabular-nums ${
                      zoom === pct
                        ? 'bg-accent-soft text-accent border-accent/50 font-semibold'
                        : 'bg-surface border-border text-dim hover:text-bright'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {regexValidation.error && <ErrorBanner message={regexValidation.error} />}
          </div>
        </SectionPanel>

        {/* Railroad Diagram Canvas */}
        <SectionPanel
          title={`SVG Railroad Diagram (${diagram.width}×${diagram.height}px)`}
          action={
            <div className="flex items-center gap-2">
              <CopyButton text={diagram.svgMarkup} />
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5"
                title="Download Railroad Diagram as SVG"
                aria-label="Download Railroad Diagram as SVG"
              >
                <Download size={13} />
                <span>SVG</span>
              </button>
            </div>
          }
        >
          <div className="overflow-auto rounded-lg border border-border bg-[#0b1120] p-4 min-h-[120px] flex items-center">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'left center',
              }}
              dangerouslySetInnerHTML={{ __html: diagram.svgMarkup }}
            />
          </div>
          <p className="text-[11px] font-mono text-subtle mt-2">
            Green circle = start · Hollow indigo circle = accept · Dashed upper rail = optional bypass · Amber lower rail = repetition loop
          </p>
        </SectionPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Plain-English Breakdown */}
          <SectionPanel title={`Token Breakdown (${explanations.length} steps)`}>
            {explanations.length === 0 ? (
              <p className="text-xs font-mono text-subtle py-6 text-center">
                Enter a pattern to view its token-by-token breakdown.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                {explanations.map((item, idx) => (
                  <div key={`${item.token}-${idx}`} className="py-2 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] text-muted tabular-nums w-5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <code className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-accent shrink-0 max-w-[140px] truncate">
                        {item.token}
                      </code>
                      <span className="font-sans text-dim">{item.description}</span>
                    </div>
                    <span className="text-[10px] font-mono text-subtle shrink-0 mt-0.5">
                      {item.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

          {/* Live Test String */}
          <SectionPanel title={`Live Match Test (${liveMatches.length} matched)`}>
            <div className="space-y-3">
              <TextAreaField
                label="Test Input"
                value={testText}
                onChange={setTestText}
                className="textarea-base h-32 font-mono text-xs"
              />
              {liveMatches.length > 0 ? (
                <ul className="max-h-40 overflow-y-auto divide-y divide-border/50 text-xs font-mono">
                  {liveMatches.map((m, idx) => (
                    <li key={`${m.index}-${idx}`} className="py-1.5 flex items-center justify-between gap-3">
                      <span className="text-bright truncate">{m.match || '(empty match)'}</span>
                      <span className="text-subtle shrink-0 tabular-nums">index {m.index}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-mono text-subtle">
                  {pattern && !regexValidation.error ? 'No matches in test input.' : 'Enter a valid regex and test text.'}
                </p>
              )}
            </div>
          </SectionPanel>
        </div>
      </div>
    </ToolLayout>
  )
}
