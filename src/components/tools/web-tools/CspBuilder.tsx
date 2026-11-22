import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import CopyButton from '../../CopyButton'
import StatCard from '../../ui/StatCard'
import {
  CSP_DIRECTIVE_CATALOG,
  CSP_PRESETS,
  QUICK_SOURCE_TOKENS,
  auditCsp,
  formatCspOutputs,
  normalizeCspToken,
  parseCspHeader,
  type CspDirectiveEntry,
} from '../../../utils/csp'

type Mode = 'builder' | 'parse'
type ExportFormat = 'http' | 'nginx' | 'apache' | 'express' | 'meta'

const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'builder', label: 'Visual Builder' },
  { value: 'parse', label: 'Parse & Audit Header' },
]

const EXPORT_OPTIONS: ReadonlyArray<{ value: ExportFormat; label: string }> = [
  { value: 'http', label: 'HTTP Header' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'apache', label: 'Apache' },
  { value: 'express', label: 'Express' },
  { value: 'meta', label: 'HTML <meta>' },
]

export default function CspBuilder() {
  const [mode, setMode] = useState<Mode>('builder')
  const [directives, setDirectives] = useState<CspDirectiveEntry[]>(() =>
    CSP_PRESETS[0].directives.map(d => ({ name: d.name, values: [...d.values] }))
  )
  const [reportOnly, setReportOnly] = useState<boolean>(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('http')
  const [rawHeaderInput, setRawHeaderInput] = useState<string>(
    "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; img-src * data:"
  )
  const [newDirectiveName, setNewDirectiveName] = useState<string>('worker-src')
  const [customSourceDrafts, setCustomSourceDrafts] = useState<Record<string, string>>({})

  const parsedInput = useMemo(() => parseCspHeader(rawHeaderInput), [rawHeaderInput])

  const activeDirectives = mode === 'parse' ? parsedInput.directives : directives
  const activeReportOnly = mode === 'parse' ? parsedInput.reportOnly : reportOnly

  const findings = useMemo(() => {
    const duplicates = mode === 'parse' ? parsedInput.duplicateDirectives : []
    return auditCsp(activeDirectives, duplicates)
  }, [activeDirectives, mode, parsedInput.duplicateDirectives])

  const outputs = useMemo(
    () => formatCspOutputs(activeDirectives, activeReportOnly),
    [activeDirectives, activeReportOnly]
  )

  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length
  const infoCount = findings.filter(f => f.severity === 'info').length

  const applyPreset = (presetId: string) => {
    const preset = CSP_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setDirectives(preset.directives.map(d => ({ name: d.name, values: [...d.values] })))
    setMode('builder')
  }

  const loadParsedIntoBuilder = () => {
    setDirectives(parsedInput.directives.map(d => ({ name: d.name, values: [...d.values] })))
    setReportOnly(parsedInput.reportOnly)
    setMode('builder')
  }

  const toggleToken = (directiveName: string, token: string) => {
    setDirectives(prev =>
      prev.map(d => {
        if (d.name !== directiveName) return d
        const exists = d.values.includes(token)
        if (exists) {
          return { ...d, values: d.values.filter(v => v !== token) }
        }
        if (token === "'none'") {
          return { ...d, values: ["'none'"] }
        }
        return { ...d, values: [...d.values.filter(v => v !== "'none'"), token] }
      })
    )
  }

  const addCustomSource = (directiveName: string) => {
    const raw = (customSourceDrafts[directiveName] ?? '').trim()
    if (!raw) return
    const tokens = raw.split(/\s+/).map(normalizeCspToken).filter(Boolean)
    setDirectives(prev =>
      prev.map(d => {
        if (d.name !== directiveName) return d
        const merged = Array.from(new Set([...d.values.filter(v => v !== "'none'"), ...tokens]))
        return { ...d, values: merged }
      })
    )
    setCustomSourceDrafts(prev => ({ ...prev, [directiveName]: '' }))
  }

  const removeSource = (directiveName: string, token: string) => {
    setDirectives(prev =>
      prev.map(d => (d.name === directiveName ? { ...d, values: d.values.filter(v => v !== token) } : d))
    )
  }

  const removeDirective = (directiveName: string) => {
    setDirectives(prev => prev.filter(d => d.name !== directiveName))
  }

  const addDirective = () => {
    const target = availableToAdd.some(d => d.name === newDirectiveName)
      ? newDirectiveName
      : availableToAdd[0]?.name
    if (!target) return
    if (directives.some(d => d.name === target)) return
    const meta = CSP_DIRECTIVE_CATALOG.find(m => m.name === target)
    const defaultValues = meta?.booleanOnly ? [] : meta?.supportsSources ? ["'self'"] : []
    setDirectives(prev => [...prev, { name: target, values: defaultValues }])
  }

  const availableToAdd = CSP_DIRECTIVE_CATALOG.filter(
    item => !directives.some(d => d.name === item.name)
  )

  const currentExportSnippet =
    exportFormat === 'http'
      ? outputs.httpHeader
      : exportFormat === 'nginx'
        ? outputs.nginx
        : exportFormat === 'apache'
          ? outputs.apache
          : exportFormat === 'express'
            ? outputs.express
            : outputs.metaTag

  return (
    <ToolLayout
      title="CSP Header Builder & Analyzer"
      description="Build Content-Security-Policy headers visually, audit existing policies for XSS risks, and export server snippets"
      tag="security"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Workspace mode" className="flex flex-wrap gap-2">
            <ToggleGroup options={MODE_OPTIONS} value={mode} onChange={setMode} />
          </div>
          <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={activeReportOnly}
              disabled={mode === 'parse'}
              onChange={e => setReportOnly(e.target.checked)}
            />
            Report-Only mode (Content-Security-Policy-Report-Only)
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="CSP presets">
          <span className="text-xs font-mono text-dim mr-1">Starter Presets:</span>
          {CSP_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              className="btn-ghost text-xs py-1.5 px-3"
              title={preset.description}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {mode === 'parse' ? (
          <SectionPanel
            title="Paste Existing CSP Header"
            action={
              <button
                type="button"
                className="btn-primary text-xs py-1 px-3"
                disabled={parsedInput.directives.length === 0}
                onClick={loadParsedIntoBuilder}
              >
                Edit in Visual Builder
              </button>
            }
          >
            <div className="space-y-3">
              <TextAreaField
                label="Content-Security-Policy Header"
                value={rawHeaderInput}
                onChange={setRawHeaderInput}
                rows={4}
                placeholder="Content-Security-Policy: default-src 'self'; script-src 'self'"
              />
              {parsedInput.warnings.length > 0 && (
                <ul className="space-y-1">
                  {parsedInput.warnings.map((w, idx) => (
                    <li key={idx} className="text-xs font-mono text-amber-400">
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionPanel>
        ) : (
          <SectionPanel title={`Directives (${directives.length})`}>
            <div className="space-y-3">
              {directives.map(entry => {
                const meta = CSP_DIRECTIVE_CATALOG.find(m => m.name === entry.name)
                const isBoolean = Boolean(meta?.booleanOnly)
                const supportsSources = meta?.supportsSources ?? true
                return (
                  <div key={entry.name} className="border border-border rounded-md p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-sm font-semibold text-bright">{entry.name}</span>
                        {meta && <p className="text-xs text-dim mt-0.5">{meta.description}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDirective(entry.name)}
                        aria-label={`Remove ${entry.name}`}
                        className="btn-ghost p-1.5"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>

                    {!isBoolean && (
                      <>
                        {entry.values.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {entry.values.map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => removeSource(entry.name, val)}
                                title={`Remove ${val}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-accent/40 bg-accent-soft text-xs font-mono text-bright hover:border-rose-400"
                              >
                                <span>{val}</span>
                                <span aria-hidden="true" className="text-dim">×</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-mono text-subtle">No sources configured yet.</p>
                        )}

                        {supportsSources && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {QUICK_SOURCE_TOKENS.map(tok => {
                              const active = entry.values.includes(tok)
                              return (
                                <button
                                  key={tok}
                                  type="button"
                                  onClick={() => toggleToken(entry.name, tok)}
                                  aria-pressed={active}
                                  className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${
                                    active
                                      ? 'border-accent bg-accent text-accent-fg'
                                      : 'border-border bg-surface text-dim hover:text-bright hover:border-accent/50'
                                  }`}
                                >
                                  {tok}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <form
                          onSubmit={e => {
                            e.preventDefault()
                            addCustomSource(entry.name)
                          }}
                          className="flex gap-2 pt-1"
                        >
                          <input
                            type="text"
                            aria-label={`Add source to ${entry.name}`}
                            value={customSourceDrafts[entry.name] ?? ''}
                            onChange={e =>
                              setCustomSourceDrafts(prev => ({ ...prev, [entry.name]: e.target.value }))
                            }
                            placeholder={
                              supportsSources
                                ? "Add domain, nonce, or hash (e.g. https://api.example.com 'nonce-abc')"
                                : 'Add endpoint or group name'
                            }
                            className="input-base text-xs"
                          />
                          <button type="submit" className="btn-ghost text-xs whitespace-nowrap shrink-0">
                            Add
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )
              })}

              {availableToAdd.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <select
                    aria-label="Select directive to add"
                    value={availableToAdd.some(d => d.name === newDirectiveName) ? newDirectiveName : availableToAdd[0].name}
                    onChange={e => setNewDirectiveName(e.target.value)}
                    className="input-base w-auto min-w-[220px] text-xs"
                  >
                    {availableToAdd.map(d => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addDirective}
                    className="btn-primary text-xs"
                  >
                    <Plus size={14} aria-hidden="true" />
                    Add directive
                  </button>
                </div>
              )}
            </div>
          </SectionPanel>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionPanel title="Generated Policy & Server Config" copyText={currentExportSnippet}>
            <div className="space-y-4">
              <div role="group" aria-label="Export format" className="flex flex-wrap gap-1.5">
                <ToggleGroup options={EXPORT_OPTIONS} value={exportFormat} onChange={setExportFormat} />
              </div>

              <pre
                data-testid="csp-export-output"
                className="p-3 rounded border border-border bg-surface text-xs font-mono text-bright whitespace-pre-wrap break-all min-h-[96px]"
              >
                {currentExportSnippet || 'Add at least one directive to generate a policy.'}
              </pre>

              {exportFormat === 'meta' && outputs.metaWarnings.length > 0 && (
                <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                  {outputs.metaWarnings.map((warn, i) => (
                    <p key={i} className="text-xs font-mono text-amber-400">
                      {warn}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-mono text-dim pt-1">
                <span>Raw policy value ({outputs.headerValue.length} chars)</span>
                <CopyButton text={outputs.headerValue} label="Copy value only" />
              </div>
            </div>
          </SectionPanel>

          <SectionPanel title="Security Audit">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <StatCard label="High Risk" value={highCount} valueClassName="tabular-nums" />
                <StatCard label="Medium" value={mediumCount} valueClassName="tabular-nums" />
                <StatCard label="Hardening Tips" value={infoCount} valueClassName="tabular-nums" />
              </div>

              {findings.length === 0 ? (
                <div className="p-3.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center gap-2.5 text-xs font-sans">
                  <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
                  <span>No common CSP weaknesses detected for the configured directives.</span>
                </div>
              ) : (
                <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {findings.map((finding, idx) => (
                    <li
                      key={`${finding.directive}-${idx}`}
                      className="rounded border border-border bg-surface p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono">
                        {finding.severity === 'high' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <ShieldAlert size={13} aria-hidden="true" />
                            High
                          </span>
                        )}
                        {finding.severity === 'medium' && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                            <AlertTriangle size={13} aria-hidden="true" />
                            Medium
                          </span>
                        )}
                        {finding.severity === 'info' && (
                          <span className="inline-flex items-center gap-1 text-sky-400 font-semibold">
                            <Info size={13} aria-hidden="true" />
                            Tip
                          </span>
                        )}
                        <span className="text-subtle">·</span>
                        <span className="text-bright">{finding.directive}</span>
                      </div>
                      <div className="text-xs font-sans font-semibold text-bright">{finding.title}</div>
                      <p className="text-xs font-sans text-dim">{finding.recommendation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionPanel>
        </div>
      </div>
    </ToolLayout>
  )
}
