import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import JsonTreeView from './JsonTreeView'
import JsonTableView from './JsonTableView'
import JsonStatsPanel from './JsonStatsPanel'
import { tools } from '../../../tools/registry'
import { useHashData } from '../../../hooks/useHashData'
import { JsonDataShare } from '../../../types/share'
import { getErrorMessage } from '../../../utils/errors'
import {
  FormatOptions,
  JsonStats,
  JsonErrorDetail,
  IndentOption,
  SortKeyMode,
  CaseMode,
  analyzeJsonError,
  autoRepairJson,
  computeJsonStats,
  formatJsonData,
  queryJsonData,
  jsonToTypeScript,
  generateSampleJson,
  escapeJsonString,
  unescapeJsonString
} from '../../../utils/jsonEngine'
import { processJsonInWorker } from '../../../utils/jsonWorkerService'
import {
  Sparkles,
  Braces,
  Minimize2,
  Wrench,
  ArrowDownAZ,
  Filter,
  Layers,
  Table,
  BarChart3,
  Code2,
  FileDown,
  FileCode,
  Copy,
  Check,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Sparkle,
  Split,
  Eye
} from 'lucide-react'
import YAML from 'yaml'

const INITIAL_SAMPLE = generateSampleJson('ecommerce')

type ViewMode = 'split' | 'code' | 'tree' | 'table' | 'stats'
type QueryEngine = 'path' | 'jsexpr' | 'search'

export default function JsonFormatter() {
  const [input, setInput] = useState(INITIAL_SAMPLE)
  const [output, setOutput] = useState('')
  const [errorDetail, setErrorDetail] = useState<JsonErrorDetail | null>(null)
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [stats, setStats] = useState<JsonStats | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [execTime, setExecTime] = useState<number>(0)

  // Layout and Display Views
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  // Formatting & Transformation Options
  const [indent, setIndent] = useState<IndentOption>(2)
  const [sortKeys, setSortKeys] = useState<SortKeyMode>('none')
  const [caseMode, setCaseMode] = useState<CaseMode>('none')
  const [removeNulls, setRemoveNulls] = useState(false)
  const [removeEmptyStrings, setRemoveEmptyStrings] = useState(false)
  const [escapeUnicode, setEscapeUnicode] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Query & Filter Bar
  const [filterQuery, setFilterQuery] = useState('')
  const [queryEngine, setQueryEngine] = useState<QueryEngine>('path')
  const [queryError, setQueryError] = useState<string | null>(null)
  const [queryMatchCount, setQueryMatchCount] = useState<number | null>(null)

  // Export / Convert states
  const [copiedAction, setCopiedAction] = useState<string | null>(null)

  const meta = tools.find(t => t.slug === 'json-formatter')
  const processingRef = useRef(0)

  useHashData<JsonDataShare>((value) => {
    if (value.input && typeof value.input === 'string') {
      setInput(value.input)
      if (value.meta?.mode === 'minify') setIndent('minified')
    }
  })

  // Format options payload
  const formatOptions: FormatOptions = useMemo(() => ({
    indent,
    sortKeys,
    caseMode,
    removeNulls,
    removeEmptyStrings,
    escapeUnicode
  }), [indent, sortKeys, caseMode, removeNulls, removeEmptyStrings, escapeUnicode])

  // Core Non-Blocking Processing Loop
  const handleProcess = useCallback(async (
    currentInput = input,
    opts = formatOptions,
    query = filterQuery,
    engine = queryEngine
  ) => {
    const runId = ++processingRef.current
    const trimmed = currentInput.trim()

    if (!trimmed) {
      setOutput('')
      setParsedJson(null)
      setStats(null)
      setErrorDetail(null)
      setIsValid(true)
      setQueryError(null)
      setQueryMatchCount(null)
      return
    }

    setIsProcessing(true)

    try {
      // 1. Initial validation test
      let parsed: any
      try {
        parsed = JSON.parse(currentInput)
      } catch {
        // Detailed error analysis
        const err = analyzeJsonError(currentInput)
        setErrorDetail(err)
        setIsValid(false)
        setParsedJson(null)
        setStats(null)
        setIsProcessing(false)
        return
      }

      setIsValid(true)
      setErrorDetail(null)

      // 2. Query/Filter step if query is provided
      let dataToFormat = parsed
      if (query.trim()) {
        const qRes = queryJsonData(parsed, query, engine)
        if (qRes.error) {
          setQueryError(qRes.error)
          setQueryMatchCount(0)
        } else {
          setQueryError(null)
          setQueryMatchCount(qRes.matchCount)
          dataToFormat = qRes.data
        }
      } else {
        setQueryError(null)
        setQueryMatchCount(null)
      }

      setParsedJson(dataToFormat)

      // 3. Process formatting in Web Worker or synchronous fallback
      const start = performance.now()
      const formatted = formatJsonData(dataToFormat, opts)
      const computedStats = computeJsonStats(dataToFormat, currentInput)
      const duration = Math.max(0.1, Number((performance.now() - start).toFixed(1)))

      if (processingRef.current === runId) {
        setOutput(formatted)
        setStats(computedStats)
        setExecTime(duration)
        setIsProcessing(false)
      }
    } catch (err: any) {
      if (processingRef.current === runId) {
        setIsValid(false)
        setErrorDetail({
          message: getErrorMessage(err, 'Failed to format JSON'),
          line: 1,
          column: 1,
          offset: 0,
          snippet: ''
        })
        setIsProcessing(false)
      }
    }
  }, [input, formatOptions, filterQuery, queryEngine])

  // Debounced auto-run on change
  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcess(input, formatOptions, filterQuery, queryEngine)
    }, 80)
    return () => clearTimeout(timer)
  }, [input, formatOptions, filterQuery, queryEngine, handleProcess])

  // Auto Repair JSON
  const handleAutoRepair = () => {
    const repaired = autoRepairJson(input)
    setInput(repaired)
    handleProcess(repaired, formatOptions, filterQuery, queryEngine)
  }

  // Load Preset Samples
  const handleLoadSample = (sampleType: 'ecommerce' | 'github' | 'broken' | 'large_benchmark' | 'weather') => {
    const sample = generateSampleJson(sampleType)
    setInput(sample)
    setFilterQuery('')
    setQueryError(null)
  }

  // Quick Action: Escape / Unescape String
  const handleEscapeToggle = () => {
    try {
      if (input.trim().startsWith('"') && input.trim().endsWith('"')) {
        const unescaped = unescapeJsonString(input)
        setInput(unescaped)
      } else {
        const escaped = escapeJsonString(output || input)
        setInput(escaped)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Quick Action: Download JSON file
  const handleDownloadJson = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `formatted_${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export to TypeScript Definitions
  const handleCopyTypeScript = () => {
    if (!parsedJson) return
    try {
      const tsCode = jsonToTypeScript(parsedJson, 'RootData')
      navigator.clipboard.writeText(tsCode)
      setCopiedAction('typescript')
      setTimeout(() => setCopiedAction(null), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  // Export to YAML
  const handleCopyYaml = () => {
    if (!parsedJson) return
    try {
      const yamlStr = YAML.stringify(parsedJson)
      navigator.clipboard.writeText(yamlStr)
      setCopiedAction('yaml')
      setTimeout(() => setCopiedAction(null), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const getShareData = (): JsonDataShare => ({
    input,
    output,
    tool: {
      name: meta?.name || 'JSON Formatter',
      description: meta?.description || 'Format, validate, query, or minify JSON data on the client.',
      category: meta?.category || 'json-tools',
      slug: meta?.slug || 'json-formatter',
      url: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '',
    },
    meta: {
      mode: indent === 'minified' ? 'minify' : 'format',
      createdAt: Date.now(),
    },
  })

  return (
    <ToolLayout
      title={meta?.name || 'JSON Formatter & Validator'}
      description={meta?.description || 'High-performance non-blocking JSON beautifier, validator, query filter, tree explorer, and repair tool.'}
      tag="json"
    >
      <div className="space-y-4">
        {/* ── Main Toolbar ────────────────────────────────────────── */}
        <div className="p-3 bg-surface border border-border rounded-xl shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Beautify (2 spaces) */}
              <button
                onClick={() => {
                  setIndent(2)
                  handleProcess(input, { ...formatOptions, indent: 2 })
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  indent === 2
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-bright'
                }`}
                title="Format with 2 space indentation"
              >
                <Braces size={14} />
                <span>2 Spaces</span>
              </button>

              {/* Beautify (4 spaces) */}
              <button
                onClick={() => {
                  setIndent(4)
                  handleProcess(input, { ...formatOptions, indent: 4 })
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  indent === 4
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-bright'
                }`}
                title="Format with 4 space indentation"
              >
                <Braces size={14} />
                <span>4 Spaces</span>
              </button>

              {/* Minify */}
              <button
                onClick={() => {
                  setIndent('minified')
                  handleProcess(input, { ...formatOptions, indent: 'minified' })
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  indent === 'minified'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-bright'
                }`}
                title="Minify JSON into single compact line"
              >
                <Minimize2 size={14} />
                <span>Minify</span>
              </button>

              {/* Auto Repair if invalid */}
              {!isValid && (
                <button
                  onClick={handleAutoRepair}
                  className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5 animate-pulse"
                  title="Auto-repair unquoted keys, single quotes, trailing commas, comments, and Python literals"
                >
                  <Wrench size={14} />
                  <span>Auto-Repair JSON</span>
                </button>
              )}

              {/* Sort Keys Toggle */}
              <div className="relative inline-block">
                <select
                  value={sortKeys}
                  onChange={(e) => setSortKeys(e.target.value as SortKeyMode)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all appearance-none cursor-pointer pr-7 ${
                    sortKeys !== 'none'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-muted/40 hover:bg-muted text-bright border border-border'
                  }`}
                  title="Sort object keys recursively"
                >
                  <option value="none">Sort: Off</option>
                  <option value="asc">Sort: A → Z</option>
                  <option value="desc">Sort: Z → A</option>
                  <option value="natural">Sort: Natural</option>
                  <option value="length">Sort: Length</option>
                </select>
                <ArrowDownAZ size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-dim" />
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1 border ${
                  showAdvancedOptions || caseMode !== 'none' || removeNulls || removeEmptyStrings
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-muted/40 hover:bg-muted text-dim border-border'
                }`}
                title="Toggle case conversion and cleaning options"
              >
                <SlidersHorizontal size={13} />
                <span>Transforms</span>
              </button>
            </div>

            {/* Right: Sample Presets & Status Benchmark */}
            <div className="flex items-center gap-2">
              {/* Execution time pill */}
              {execTime > 0 && isValid && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap size={11} />
                  <span>{execTime}ms</span>
                </div>
              )}

              {/* Sample Generator Dropdown */}
              <div className="relative inline-block">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleLoadSample(e.target.value as any)
                      e.target.value = ''
                    }
                  }}
                  defaultValue=""
                  className="bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-bright hover:bg-muted focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>Load Sample JSON...</option>
                  <option value="ecommerce">E-Commerce API Payload</option>
                  <option value="github">GitHub Repository API</option>
                  <option value="large_benchmark">1,000 Records Benchmark</option>
                  <option value="broken">Broken JSON (Test Auto-Repair)</option>
                  <option value="weather">Weather Forecast GeoJSON</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Transformations Collapsible Bar */}
          {showAdvancedOptions && (
            <div className="pt-2.5 border-t border-border flex flex-wrap items-center gap-4 text-xs font-mono text-dim animate-in fade-in duration-150">
              {/* Case Conversion */}
              <div className="flex items-center gap-1.5">
                <span>Key Case:</span>
                <select
                  value={caseMode}
                  onChange={(e) => setCaseMode(e.target.value as CaseMode)}
                  className="bg-muted/50 border border-border rounded px-2 py-1 text-bright text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">Original</option>
                  <option value="camel">camelCase</option>
                  <option value="snake">snake_case</option>
                  <option value="kebab">kebab-case</option>
                  <option value="pascal">PascalCase</option>
                  <option value="constant">CONSTANT_CASE</option>
                </select>
              </div>

              {/* Indent Tab option */}
              <div className="flex items-center gap-1.5">
                <span>Indent:</span>
                <select
                  value={String(indent)}
                  onChange={(e) => {
                    const val = e.target.value
                    setIndent(val === '\t' ? '\t' : (val === 'minified' ? 'minified' : Number(val) as IndentOption))
                  }}
                  className="bg-muted/50 border border-border rounded px-2 py-1 text-bright text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="2">2 Spaces</option>
                  <option value="3">3 Spaces</option>
                  <option value="4">4 Spaces</option>
                  <option value="\t">Tab</option>
                  <option value="minified">Minified (Compact)</option>
                </select>
              </div>

              {/* Cleaning Checkboxes */}
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-bright">
                <input
                  type="checkbox"
                  checked={removeNulls}
                  onChange={(e) => setRemoveNulls(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-0"
                />
                <span>Remove Nulls</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer hover:text-bright">
                <input
                  type="checkbox"
                  checked={removeEmptyStrings}
                  onChange={(e) => setRemoveEmptyStrings(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-0"
                />
                <span>Remove Empty Strings</span>
              </label>

              {/* Quick Escape / Unescape */}
              <button
                onClick={handleEscapeToggle}
                className="px-2 py-1 rounded bg-muted/40 hover:bg-muted text-bright border border-border transition-colors text-xs"
                title="Escape quotes and newlines for embedding in strings or unescape JSON string"
              >
                Escape / Unescape String
              </button>
            </div>
          )}

          {/* ── Filter & Query Bar ─────────────────────────────────── */}
          <div className="pt-2.5 border-t border-border flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-mono text-dim">
              <Filter size={13} className="text-indigo-400" />
              <span>Query:</span>
            </div>

            {/* Query Engine Type Selector */}
            <select
              value={queryEngine}
              onChange={(e) => setQueryEngine(e.target.value as QueryEngine)}
              className="bg-muted/50 border border-border rounded px-2 py-1 text-bright text-xs font-mono focus:outline-none"
            >
              <option value="path">JSONPath / Dot Path (e.g. $.data.products[*].name)</option>
              <option value="jsexpr">JavaScript Expression (e.g. x =&gt; x.price &gt; 100)</option>
              <option value="search">Full-Text / Regex Match (e.g. /processor/i)</option>
            </select>

            {/* Query Input */}
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={
                  queryEngine === 'path'
                    ? 'Enter path expression (e.g. data.products[0], items.*.id)...'
                    : queryEngine === 'jsexpr'
                    ? 'Enter filter expression (e.g. x => x.score > 4)...'
                    : 'Search keys and values across entire JSON tree...'
                }
                className="w-full px-3 py-1 bg-muted/30 border border-border rounded text-xs font-mono text-bright placeholder-dim/50 focus:outline-none focus:border-indigo-500"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-dim hover:text-bright text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Query Result Count or Error Badge */}
            {queryMatchCount !== null && !queryError && filterQuery && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono">
                {queryMatchCount} {queryMatchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
            {queryError && (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono truncate max-w-xs">
                Query error: {queryError}
              </span>
            )}
          </div>
        </div>

        {/* ── Error Banner With Precise Location & Repair ────────── */}
        {!isValid && errorDetail && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl font-mono text-xs text-rose-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-rose-400">
                <span>Syntax Error at Line {errorDetail.line}, Column {errorDetail.column}</span>
              </div>
              <button
                onClick={handleAutoRepair}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Wrench size={13} />
                <span>Fix with Auto-Repair</span>
              </button>
            </div>

            <p className="text-dim">{errorDetail.message}</p>

            {errorDetail.snippet && (
              <pre className="p-2.5 bg-black/40 rounded border border-rose-500/20 text-rose-300 overflow-x-auto whitespace-pre">
                {errorDetail.snippet}
              </pre>
            )}

            {errorDetail.suggestion && (
              <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <Sparkle size={13} className="shrink-0 mt-0.5 text-amber-400" />
                <span><strong>Suggestion:</strong> {errorDetail.suggestion}</span>
              </div>
            )}
          </div>
        )}

        {/* ── View Mode Selector Tabs & Export Actions ───────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-dim hover:text-bright hover:bg-muted/40'
              }`}
            >
              <Split size={13} />
              <span>Split Editor</span>
            </button>

            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'tree'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-dim hover:text-bright hover:bg-muted/40'
              }`}
            >
              <Layers size={13} />
              <span>Tree Explorer</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-dim hover:text-bright hover:bg-muted/40'
              }`}
            >
              <Table size={13} />
              <span>Table Grid</span>
            </button>

            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'stats'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-dim hover:text-bright hover:bg-muted/40'
              }`}
            >
              <BarChart3 size={13} />
              <span>Schema & Stats</span>
            </button>
          </div>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2">
            {/* TypeScript Interface */}
            <button
              onClick={handleCopyTypeScript}
              disabled={!isValid || !parsedJson}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface hover:bg-muted text-dim hover:text-bright border border-border transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Generate & copy TypeScript interfaces"
            >
              {copiedAction === 'typescript' ? <Check size={13} className="text-emerald-400" /> : <FileCode size={13} className="text-sky-400" />}
              <span>{copiedAction === 'typescript' ? 'TS Copied!' : 'Copy TS'}</span>
            </button>

            {/* YAML Export */}
            <button
              onClick={handleCopyYaml}
              disabled={!isValid || !parsedJson}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface hover:bg-muted text-dim hover:text-bright border border-border transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Convert & copy as YAML"
            >
              {copiedAction === 'yaml' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-amber-400" />}
              <span>{copiedAction === 'yaml' ? 'YAML Copied!' : 'Copy YAML'}</span>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJson}
              disabled={!output}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface hover:bg-muted text-dim hover:text-bright border border-border transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Download formatted JSON file"
            >
              <FileDown size={13} className="text-emerald-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* ── Active View Rendering ───────────────────────────────── */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Input Editor */}
            <div className="space-y-2">
              <CodeInput
                value={input}
                onChange={setInput}
                language="json"
                label="Raw JSON Input"
                placeholder="Paste or drop JSON here..."
                minHeight="420px"
                maxHeight="650px"
                sampleValue={INITIAL_SAMPLE}
                sampleLabel="Load Sample"
              />
            </div>

            {/* Output Formatted View */}
            <div className="space-y-2">
              <CodeBlock
                code={output}
                language="json"
                label={
                  filterQuery
                    ? `filtered.json (${queryMatchCount ?? 0} matches)`
                    : indent === 'minified'
                    ? 'minified.json'
                    : 'formatted.json'
                }
                status={isProcessing ? 'loading' : isValid ? 'ready' : 'error'}
                minHeight="420px"
                maxHeight="650px"
                shareTool={getShareData()}
              />
            </div>
          </div>
        )}

        {viewMode === 'tree' && (
          <div className="space-y-4">
            {isValid && parsedJson ? (
              <JsonTreeView data={parsedJson} maxInitialDepth={2} />
            ) : (
              <div className="p-8 text-center bg-[#1e1e1e] rounded-xl border border-border text-[#808080] font-mono text-xs">
                <p>Enter valid JSON in the editor to inspect the interactive tree hierarchy.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="space-y-4">
            {isValid && parsedJson ? (
              <JsonTableView data={parsedJson} />
            ) : (
              <div className="p-8 text-center bg-[#1e1e1e] rounded-xl border border-border text-[#808080] font-mono text-xs">
                <p>Enter valid JSON in the editor to inspect tabular data.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-4">
            {stats ? (
              <JsonStatsPanel stats={stats} />
            ) : (
              <div className="p-8 text-center bg-[#1e1e1e] rounded-xl border border-border text-[#808080] font-mono text-xs">
                <p>Provide valid JSON to view structure metrics and memory footprint analytics.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
