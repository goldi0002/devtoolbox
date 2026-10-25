import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  PIPELINE_OPERATIONS,
  PipelineStep,
  executePipeline,
  serializePipelineToHash,
  deserializePipelineFromHash,
} from '../../utils/pipelineEngine'
import { DEV_RECIPES, DevRecipe } from '../../data/recipes'
import {
  Play,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  AlertCircle,
  FileCode,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react'

interface DevFlowStudioProps {
  initialRecipe?: DevRecipe
  initialInput?: string
}

export default function DevFlowStudio({ initialRecipe, initialInput }: DevFlowStudioProps) {
  const [input, setInput] = useState<string>(() => {
    return initialInput ?? initialRecipe?.sampleInput ?? '{"auth":{"token":"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjg5MjF9.x"},"status":"ok"}'
  })

  const [steps, setSteps] = useState<PipelineStep[]>(() => {
    if (initialRecipe) {
      return initialRecipe.steps.map(s => ({ ...s, id: s.id || `step-${Math.random().toString(36).slice(2, 7)}` }))
    }
    return [
      {
        id: 'step-1',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2, sortKeys: false },
      },
      {
        id: 'step-2',
        operationId: 'extract-json-key',
        enabled: true,
        options: { path: 'auth.token' },
      },
      {
        id: 'step-3',
        operationId: 'jwt-decode',
        enabled: true,
        options: { section: 'payload' },
      },
    ]
  })

  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [selectedOpToAdd, setSelectedOpToAdd] = useState(PIPELINE_OPERATIONS[0].id)
  const [expandedStepPreviews, setExpandedStepPreviews] = useState<Record<string, boolean>>({})

  // Read pipeline from URL hash on mount if present
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.slice(1)
    if (hash && hash.startsWith('recipe=')) {
      const parsed = deserializePipelineFromHash(hash.replace(/^recipe=/, ''))
      if (parsed) {
        setInput(parsed.input)
        setSteps(parsed.steps)
      }
    }
  }, [])

  // Execute pipeline synchronously
  const execution = useMemo(() => {
    return executePipeline(input, steps)
  }, [input, steps])

  const totalExecutionTime = useMemo(() => {
    return execution.results.reduce((acc, r) => acc + r.executionTimeMs, 0).toFixed(2)
  }, [execution])

  // Step Management
  const handleToggleStep = useCallback((id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }, [])

  const handleRemoveStep = useCallback((id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setSteps(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return updated
    })
  }, [])

  const handleUpdateOption = useCallback((stepId: string, key: string, value: any) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s
      return {
        ...s,
        options: {
          ...s.options,
          [key]: value,
        },
      }
    }))
  }, [])

  const handleAddStep = useCallback(() => {
    const op = PIPELINE_OPERATIONS.find(o => o.id === selectedOpToAdd)
    if (!op) return
    const newStep: PipelineStep = {
      id: `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      operationId: op.id,
      enabled: true,
      options: { ...op.defaultOptions },
    }
    setSteps(prev => [...prev, newStep])
  }, [selectedOpToAdd])

  const handleLoadRecipe = useCallback((recipe: DevRecipe) => {
    setInput(recipe.sampleInput)
    setSteps(recipe.steps.map(s => ({ ...s, id: `step-${Math.random().toString(36).slice(2, 7)}` })))
  }, [])

  const handleShare = useCallback(() => {
    const hash = serializePipelineToHash({ input, steps })
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#recipe=${hash}`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }, [input, steps])

  const handleCopyOutput = useCallback(() => {
    if (!execution.finalOutput) return
    navigator.clipboard.writeText(execution.finalOutput)
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 2000)
  }, [execution.finalOutput])

  const handleDownloadOutput = useCallback(() => {
    if (!execution.finalOutput) return
    const blob = new Blob([execution.finalOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pipeline-output-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [execution.finalOutput])

  const toggleStepPreview = useCallback((stepId: string) => {
    setExpandedStepPreviews(prev => ({ ...prev, [stepId]: !prev[stepId] }))
  }, [])

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner & Recipe Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-bright">DevFlow Multi-Tool Pipeline</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>100% In-Browser Memory</span>
            <span aria-hidden="true">·</span>
            <span>Zero Server Requests</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-accent">{steps.filter(s => s.enabled).length} Active Steps</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalExecutionTime} ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick Recipe Switcher */}
          <select
            aria-label="Load pre-built recipe"
            className="flex-1 sm:flex-initial text-xs px-3 py-2 rounded-lg border border-border bg-canvas text-bright focus:outline-hidden focus:ring-1 focus:ring-accent"
            onChange={(e) => {
              const r = DEV_RECIPES.find(x => x.slug === e.target.value)
              if (r) handleLoadRecipe(r)
            }}
            defaultValue=""
          >
            <option value="" disabled>Load Pre-built Recipe...</option>
            {DEV_RECIPES.map(r => (
              <option key={r.slug} value={r.slug}>{r.shortTitle}</option>
            ))}
          </select>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted/40 text-bright transition-colors whitespace-nowrap shrink-0"
            title="Share pipeline configuration via compressed URL hash"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Recipe</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input and Step Chain (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 1. Input Source Box */}
          <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-bright">Source Input Payload</span>
                <span className="text-[11px] font-mono text-muted tabular-nums">({input.length} chars)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInput('')}
                  className="text-xs text-muted hover:text-bright transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setInput(initialRecipe?.sampleInput ?? '{"auth":{"token":"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjg5MjF9.x"},"status":"ok"}')}
                  className="text-xs text-accent hover:underline transition-colors"
                >
                  Reset Demo
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw JSON, Base64 string, JWT token, or log lines here..."
              rows={5}
              className="w-full p-3 font-mono text-xs bg-canvas text-bright focus:outline-hidden resize-y"
            />
          </div>

          {/* 2. Step Pipeline Sequence */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-bright uppercase tracking-wide">Transformation Pipeline</span>
              <span className="text-xs text-muted font-mono tabular-nums">{steps.length} sequential operations</span>
            </div>

            {steps.map((step, idx) => {
              const op = PIPELINE_OPERATIONS.find(o => o.id === step.operationId)
              const stepResult = execution.results.find(r => r.stepId === step.id)
              const isPreviewOpen = !!expandedStepPreviews[step.id]

              return (
                <div
                  key={step.id}
                  className={`flex flex-col rounded-xl border transition-all ${
                    !step.enabled
                      ? 'border-border/40 bg-surface/40 opacity-60'
                      : stepResult?.error
                      ? 'border-rose-500/50 bg-rose-500/5'
                      : 'border-border bg-surface'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 gap-2 border-b border-border/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono text-muted tabular-nums">0{idx + 1}.</span>
                      <span className="text-xs font-semibold text-bright truncate">
                        {op?.name || step.operationId}
                      </span>
                      {stepResult && (
                        <span className="text-[10px] font-mono text-muted tabular-nums hidden sm:inline">
                          {stepResult.executionTimeMs} ms
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Step Preview Toggle */}
                      {stepResult && !stepResult.error && (
                        <button
                          onClick={() => toggleStepPreview(step.id)}
                          className="p-1 rounded text-muted hover:text-bright transition-colors"
                          title="Toggle intermediate step output"
                          aria-label="Toggle intermediate step output"
                        >
                          {isPreviewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Enable / Disable Switch */}
                      <button
                        onClick={() => handleToggleStep(step.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                          step.enabled ? 'bg-accent/10 text-accent' : 'bg-muted/40 text-muted'
                        }`}
                      >
                        {step.enabled ? 'Active' : 'Bypassed'}
                      </button>

                      {/* Move Up */}
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveStep(idx, 'up')}
                        className="p-1 rounded text-muted hover:text-bright disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move step up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        disabled={idx === steps.length - 1}
                        onClick={() => handleMoveStep(idx, 'down')}
                        className="p-1 rounded text-muted hover:text-bright disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move step down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-1 rounded text-muted hover:text-rose-500 transition-colors ml-1"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Step Options Area (if applicable) */}
                  {step.enabled && (
                    <div className="px-3.5 py-2.5 bg-canvas/30 text-xs flex flex-wrap items-center gap-4">
                      {/* JSON Prettify Options */}
                      {step.operationId === 'json-prettify' && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted">Indent:</span>
                            <select
                              value={Number(step.options.indent) || 2}
                              onChange={(e) => handleUpdateOption(step.id, 'indent', Number(e.target.value))}
                              className="text-xs px-2 py-1 rounded border border-border bg-canvas text-bright"
                            >
                              <option value={2}>2 Spaces</option>
                              <option value={4}>4 Spaces</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer text-muted hover:text-bright">
                            <input
                              type="checkbox"
                              checked={!!step.options.sortKeys}
                              onChange={(e) => handleUpdateOption(step.id, 'sortKeys', e.target.checked)}
                              className="rounded border-border text-accent focus:ring-accent"
                            />
                            <span>Sort Object Keys</span>
                          </label>
                        </>
                      )}

                      {/* JSON Extract Key Option */}
                      {step.operationId === 'extract-json-key' && (
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-muted shrink-0">Key Path:</span>
                          <input
                            type="text"
                            value={String(step.options.path ?? '')}
                            onChange={(e) => handleUpdateOption(step.id, 'path', e.target.value)}
                            placeholder="e.g. data.token or results.0.id"
                            className="flex-1 text-xs px-2.5 py-1 rounded border border-border bg-canvas text-bright font-mono"
                          />
                        </div>
                      )}

                      {/* JWT Section Option */}
                      {step.operationId === 'jwt-decode' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted">Extract:</span>
                          <div className="flex items-center gap-1 p-0.5 bg-muted/30 rounded border border-border">
                            {['payload', 'header', 'all'].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => handleUpdateOption(step.id, 'section', sec)}
                                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                                  step.options.section === sec ? 'bg-accent text-white font-medium' : 'text-muted hover:text-bright'
                                }`}
                              >
                                {sec.charAt(0).toUpperCase() + sec.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regex Replace Options */}
                      {step.operationId === 'regex-replace' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted shrink-0">Pattern:</span>
                            <input
                              type="text"
                              value={String(step.options.pattern ?? '')}
                              onChange={(e) => handleUpdateOption(step.id, 'pattern', e.target.value)}
                              placeholder="e.g. \\s+"
                              className="w-full text-xs px-2 py-1 rounded border border-border bg-canvas font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted shrink-0">Replace:</span>
                            <input
                              type="text"
                              value={String(step.options.replacement ?? '')}
                              onChange={(e) => handleUpdateOption(step.id, 'replacement', e.target.value)}
                              placeholder="replacement"
                              className="w-full text-xs px-2 py-1 rounded border border-border bg-canvas font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* Regex Extract Options */}
                      {step.operationId === 'regex-extract' && (
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-muted shrink-0">Regex Pattern:</span>
                          <input
                            type="text"
                            value={String(step.options.pattern ?? '')}
                            onChange={(e) => handleUpdateOption(step.id, 'pattern', e.target.value)}
                            placeholder="e.g. [a-zA-Z0-9._%+-]+@..."
                            className="flex-1 text-xs px-2.5 py-1 rounded border border-border bg-canvas text-bright font-mono"
                          />
                        </div>
                      )}

                      {/* Case Transform Options */}
                      {step.operationId === 'case-transform' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted">Target Case:</span>
                          <select
                            value={String(step.options.targetCase || 'snake')}
                            onChange={(e) => handleUpdateOption(step.id, 'targetCase', e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-border bg-canvas text-bright font-mono"
                          >
                            <option value="snake">snake_case</option>
                            <option value="camel">camelCase</option>
                            <option value="pascal">PascalCase</option>
                            <option value="kebab">kebab-case</option>
                            <option value="lower">lowercase</option>
                            <option value="upper">UPPERCASE</option>
                          </select>
                        </div>
                      )}

                      {/* String Clean Options */}
                      {step.operationId === 'string-clean' && (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <label className="flex items-center gap-1 cursor-pointer text-muted hover:text-bright">
                            <input
                              type="checkbox"
                              checked={!!step.options.trimLines}
                              onChange={(e) => handleUpdateOption(step.id, 'trimLines', e.target.checked)}
                              className="rounded text-accent"
                            />
                            <span>Trim Lines</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-muted hover:text-bright">
                            <input
                              type="checkbox"
                              checked={!!step.options.removeBlank}
                              onChange={(e) => handleUpdateOption(step.id, 'removeBlank', e.target.checked)}
                              className="rounded text-accent"
                            />
                            <span>Remove Empty</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-muted hover:text-bright">
                            <input
                              type="checkbox"
                              checked={!!step.options.unique}
                              onChange={(e) => handleUpdateOption(step.id, 'unique', e.target.checked)}
                              className="rounded text-accent"
                            />
                            <span>Deduplicate</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-muted hover:text-bright">
                            <input
                              type="checkbox"
                              checked={!!step.options.sort}
                              onChange={(e) => handleUpdateOption(step.id, 'sort', e.target.checked)}
                              className="rounded text-accent"
                            />
                            <span>Sort Alphabetically</span>
                          </label>
                        </div>
                      )}

                      {!['json-prettify', 'extract-json-key', 'jwt-decode', 'regex-replace', 'regex-extract', 'case-transform', 'string-clean'].includes(step.operationId) && (
                        <span className="text-muted text-[11px]">{op?.description}</span>
                      )}
                    </div>
                  )}

                  {/* Step Error Display */}
                  {stepResult?.error && (
                    <div className="px-3.5 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{stepResult.error}</span>
                    </div>
                  )}

                  {/* Intermediate Step Output Preview */}
                  {isPreviewOpen && stepResult && !stepResult.error && (
                    <div className="p-3 bg-canvas border-t border-border/60">
                      <div className="flex items-center justify-between mb-1.5 text-[11px] text-muted font-mono">
                        <span>Intermediate Step Output</span>
                        <span>{stepResult.output.length} characters</span>
                      </div>
                      <pre className="max-h-36 overflow-auto text-xs font-mono text-bright p-2 rounded bg-surface border border-border/40 whitespace-pre-wrap break-all">
                        {stepResult.output || '(empty output)'}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add Step Action Strip */}
            <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border bg-surface/50">
              <select
                aria-label="Select operation to append"
                value={selectedOpToAdd}
                onChange={(e) => setSelectedOpToAdd(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-canvas text-bright focus:outline-hidden"
              >
                {PIPELINE_OPERATIONS.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.category})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append Step</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Final Pipeline Output (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${execution.hasError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span className="text-xs font-semibold text-bright">Final Pipeline Output</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyOutput}
                  disabled={!execution.finalOutput}
                  className="flex items-center gap-1 text-xs text-bright hover:text-accent disabled:opacity-40 transition-colors"
                >
                  {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadOutput}
                  disabled={!execution.finalOutput}
                  className="flex items-center gap-1 text-xs text-bright hover:text-accent disabled:opacity-40 transition-colors"
                  title="Download final output as text file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Output Text View */}
            <div className="relative">
              <textarea
                readOnly
                value={execution.finalOutput}
                placeholder="Final transformed output will appear here automatically..."
                rows={16}
                className="w-full p-3 font-mono text-xs bg-canvas text-bright focus:outline-hidden resize-none whitespace-pre-wrap break-all"
              />
            </div>

            {/* Output Meta Footer */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-muted/10 border-t border-border/60 text-[11px] text-muted font-mono">
              <div className="flex items-center gap-2">
                <span className="tabular-nums">{execution.finalOutput.length} chars</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{execution.finalOutput ? execution.finalOutput.split('\n').length : 0} lines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="tabular-nums">{totalExecutionTime} ms latency</span>
              </div>
            </div>
          </div>

          {/* Value Proposition Note */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface text-xs flex flex-col gap-2">
            <span className="font-semibold text-bright">Why Developers Love DevFlow Pipelines:</span>
            <ul className="flex flex-col gap-1.5 text-muted list-disc list-inside">
              <li>Chain unlimited formatting, decoding, and hashing tasks.</li>
              <li>Eliminates copying and pasting across 4 browser tabs.</li>
              <li>Zero network calls — sensitive tokens stay inside your local browser.</li>
              <li>Share exact pipeline setups with your engineering team via URL.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
