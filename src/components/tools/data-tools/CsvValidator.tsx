import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Copy,
  Table as TableIcon,
  ShieldCheck,
  Sliders,
  Type,
  Hash,
  Calendar,
  ListFilter
} from 'lucide-react'
import SectionPanel from '../../ui/SectionPanel'
import StatCard from '../../ui/StatCard'
import {
  ColumnDataType,
  ColumnRule,
  ValidationError,
  ValidationSummary,
  parseDelimitedData,
  validateDelimitedData,
  generateDefaultRules,
  exportErrorsToCsv,
  exportRowsToCsv,
  SAMPLE_CSV_DATA,
  SAMPLE_RULES
} from '../../../utils/csvValidatorEngine'

const DATA_TYPES: { value: ColumnDataType; label: string; group: string }[] = [
  // General & Numbers
  { value: 'string', label: 'String / Text', group: 'Basic' },
  { value: 'integer', label: 'Integer (Whole Number)', group: 'Numbers' },
  { value: 'number', label: 'Decimal / Number', group: 'Numbers' },
  { value: 'boolean', label: 'Boolean (true/false/1/0)', group: 'Basic' },
  // Internet & Identity
  { value: 'email', label: 'Email Address', group: 'Network & ID' },
  { value: 'url', label: 'Web URL (http/https)', group: 'Network & ID' },
  { value: 'uuid', label: 'UUID (v1-v5)', group: 'Network & ID' },
  { value: 'ipv4', label: 'IPv4 Address', group: 'Network & ID' },
  { value: 'ipv6', label: 'IPv6 Address', group: 'Network & ID' },
  { value: 'phone', label: 'Phone Number', group: 'Network & ID' },
  { value: 'mac_address', label: 'MAC Address', group: 'Network & ID' },
  // Formats & Schemas
  { value: 'json', label: 'JSON String', group: 'Technical' },
  { value: 'hex_color', label: 'Hex Color (#fff / #3b82f6)', group: 'Technical' },
  { value: 'semver', label: 'SemVer (e.g. 1.2.3, v2.0.0-beta)', group: 'Technical' },
  { value: 'base64', label: 'Base64 Encoded', group: 'Technical' },
  { value: 'slug', label: 'URL Slug (kebab-case)', group: 'Technical' },
  { value: 'credit_card', label: 'Credit Card (Luhn Validated)', group: 'Technical' },
  { value: 'alphanumeric', label: 'Alphanumeric Only (a-z, 0-9)', group: 'Text Rules' },
  { value: 'alphabetical', label: 'Alphabetical Letters Only', group: 'Text Rules' },
  { value: 'date', label: 'Date (ISO/Standard)', group: 'Time & Date' },
  { value: 'any', label: 'Any (Skip Type Check)', group: 'Basic' }
]

export default function CsvValidator() {
  const [rawText, setRawText] = useState<string>(SAMPLE_CSV_DATA)
  const [delimiter, setDelimiter] = useState<string>('auto')
  const [fileName, setFileName] = useState<string>('sample_customer_orders.csv')
  const [fileSize, setFileSize] = useState<number>(new Blob([SAMPLE_CSV_DATA]).size)
  const [rules, setRules] = useState<ColumnRule[]>(SAMPLE_RULES)

  // Validation output state
  const [validated, setValidated] = useState<boolean>(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [summary, setSummary] = useState<ValidationSummary | null>(null)
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<string[][]>([])
  const [selectedRowDetail, setSelectedRowDetail] = useState<{ rowIndex: number; rowData: string[] } | null>(null)

  // Filter & Search states
  const [filterColumn, setFilterColumn] = useState<string>('all')
  const [filterRuleType, setFilterRuleType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 20

  // UI accordion & drawer states
  const [expandedCol, setExpandedCol] = useState<string | null>(null)
  const [activeTabByCol, setActiveTabByCol] = useState<Record<string, 'text' | 'bounds' | 'pattern'>>({})
  const [showJsonSchemaModal, setShowJsonSchemaModal] = useState<boolean>(false)
  const [jsonSchemaInput, setJsonSchemaInput] = useState<string>('')
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse input on change or load
  const handleParseData = useCallback(
    (textToParse: string, customDelim: string) => {
      const { headers, rows, delimiter: detected } = parseDelimitedData(textToParse, customDelim)
      setDetectedHeaders(headers)
      setParsedRows(rows)

      // If existing rules don't match headers, generate new defaults
      const currentRuleCols = new Set(rules.map(r => r.columnName.toLowerCase()))
      const headersMatch = headers.length > 0 && headers.every(h => currentRuleCols.has(h.toLowerCase()))

      if (!headersMatch && headers.length > 0) {
        setRules(generateDefaultRules(headers, rows.slice(0, 20)))
      }

      return { headers, rows, detected }
    },
    [rules]
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileSize(file.size)
    const reader = new FileReader()
    reader.onload = event => {
      const content = (event.target?.result as string) || ''
      setRawText(content)
      setValidated(false)
      setErrors([])
      setSummary(null)
      handleParseData(content, delimiter)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    setRawText(SAMPLE_CSV_DATA)
    setDelimiter('auto')
    setFileName('sample_customer_orders.csv')
    setFileSize(new Blob([SAMPLE_CSV_DATA]).size)
    setRules(SAMPLE_RULES)
    setValidated(false)
    setErrors([])
    setSummary(null)
    handleParseData(SAMPLE_CSV_DATA, 'auto')
  }

  const handleClear = () => {
    setRawText('')
    setFileName('')
    setFileSize(0)
    setRules([])
    setDetectedHeaders([])
    setParsedRows([])
    setValidated(false)
    setErrors([])
    setSummary(null)
    setSelectedRowDetail(null)
  }

  const handleAutoInferRules = () => {
    const { headers, rows } = parseDelimitedData(rawText, delimiter)
    if (headers.length === 0) return
    const inferred = generateDefaultRules(headers, rows.slice(0, 50))
    setRules(inferred)
  }

  const handleRunValidation = () => {
    const { headers, rows } = parseDelimitedData(rawText, delimiter)
    setDetectedHeaders(headers)
    setParsedRows(rows)

    if (headers.length === 0 || rows.length === 0) {
      setValidated(true)
      setErrors([])
      setSummary({
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        totalErrors: 0,
        errorsByColumn: {},
        errorsByRule: {},
        executionTimeMs: 0
      })
      return
    }

    const result = validateDelimitedData(headers, rows, rules)
    setErrors(result.errors)
    setSummary(result.summary)
    setValidated(true)
    setCurrentPage(1)
  }

  const updateRule = (columnName: string, updates: Partial<ColumnRule>) => {
    setRules(prev =>
      prev.map(r => (r.columnName.toLowerCase() === columnName.toLowerCase() ? { ...r, ...updates } : r))
    )
  }

  // Filtered errors
  const filteredErrors = useMemo(() => {
    return errors.filter(err => {
      if (filterColumn !== 'all' && err.columnName !== filterColumn) return false
      if (filterRuleType !== 'all' && err.ruleType !== filterRuleType) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          err.columnName.toLowerCase().includes(q) ||
          err.cellValue.toLowerCase().includes(q) ||
          err.message.toLowerCase().includes(q) ||
          `row ${err.rowIndex}`.includes(q)
        )
      }
      return true
    })
  }, [errors, filterColumn, filterRuleType, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredErrors.length / pageSize))
  const paginatedErrors = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredErrors.slice(start, start + pageSize)
  }, [filteredErrors, currentPage, pageSize])

  // Export handlers
  const handleExportErrorReport = () => {
    const csvContent = exportErrorsToCsv(errors)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `validation_errors_${fileName || 'data'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportInvalidRows = () => {
    if (!summary || detectedHeaders.length === 0) return
    const invalidIndices = Array.from(new Set(errors.map(e => e.rowIndex))).sort((a, b) => a - b)
    const csvContent = exportRowsToCsv(detectedHeaders, parsedRows, invalidIndices, delimiter === 'auto' ? ',' : delimiter)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invalid_rows_${fileName || 'data'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCleanRows = () => {
    if (!summary || detectedHeaders.length === 0) return
    const invalidIndices = new Set(errors.map(e => e.rowIndex))
    const validIndices: number[] = []
    for (let i = 1; i <= parsedRows.length; i++) {
      if (!invalidIndices.has(i)) {
        validIndices.push(i)
      }
    }
    const csvContent = exportRowsToCsv(detectedHeaders, parsedRows, validIndices, delimiter === 'auto' ? ',' : delimiter)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clean_rows_${fileName || 'data'}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopySchemaJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rules, null, 2))
    setCopiedStatus('rules')
    setTimeout(() => setCopiedStatus(null), 2000)
  }

  const handleOpenJsonModal = () => {
    setJsonSchemaInput(JSON.stringify(rules, null, 2))
    setSchemaError(null)
    setShowJsonSchemaModal(true)
  }

  const handleApplyJsonSchema = () => {
    try {
      const parsed = JSON.parse(jsonSchemaInput)
      if (!Array.isArray(parsed)) {
        throw new Error('Rules JSON must be an array of ColumnRule objects.')
      }
      for (const item of parsed) {
        if (!item.columnName || typeof item.columnName !== 'string') {
          throw new Error('Each rule must have a "columnName" string.')
        }
      }
      setRules(parsed)
      setShowJsonSchemaModal(false)
      setSchemaError(null)
    } catch (err) {
      setSchemaError(err instanceof Error ? err.message : 'Invalid JSON format')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Rule Capability Banner ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl text-xs">
        <div className="flex items-center gap-2 text-dim">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>
            <strong className="text-bright">25+ Validation Rules Active:</strong> Required, Null String, Trim, Unique, 20+ Data Types (Email, SemVer, Luhn, UUID, IPv4/6, Phone), Ranges, Substrings, Enums & Blacklists
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoInferRules}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-dim hover:text-bright bg-surface-raised border border-border rounded-md transition-colors"
          >
            <Sparkles size={12} className="text-indigo-400" />
            Auto-Infer Rules
          </button>
          <button
            onClick={handleOpenJsonModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-dim hover:text-bright bg-surface-raised border border-border rounded-md transition-colors"
          >
            <FileCode size={12} />
            Rules Schema JSON
          </button>
        </div>
      </div>

      {/* ── Top Action / Upload Toolbar ──────────────────────────────────── */}
      <SectionPanel title="File Input & Delimiter Settings">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.psv,.tab"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-upload-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
              >
                <Upload size={14} />
                Upload CSV / TSV / TXT
              </button>

              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-dim hover:text-bright bg-surface border border-border hover:border-border-hover rounded-lg transition-colors"
              >
                <Sparkles size={14} className="text-amber-400" />
                Load Sample Dataset
              </button>

              <button
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-subtle hover:text-rose-400 bg-surface border border-border rounded-lg transition-colors"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <label htmlFor="csv-delimiter-select" className="text-dim whitespace-nowrap">
                Delimiter:
              </label>
              <select
                id="csv-delimiter-select"
                aria-label="CSV Delimiter"
                value={delimiter}
                onChange={e => {
                  setDelimiter(e.target.value)
                  handleParseData(rawText, e.target.value)
                }}
                className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-bright text-xs focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="auto">Auto-Detect</option>
                <option value=",">Comma (,)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
                <option value=";">Semicolon (;)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-subtle mb-1.5 px-0.5">
              <span className="flex items-center gap-1.5 font-mono">
                <FileText size={13} />
                {fileName ? `${fileName} (${(fileSize / 1024).toFixed(1)} KB)` : 'Raw Tabular Text Content'}
              </span>
              <span>Paste delimited records below with column headers on Row 1</span>
            </div>
            <textarea
              value={rawText}
              onChange={e => {
                setRawText(e.target.value)
                setValidated(false)
                handleParseData(e.target.value, delimiter)
              }}
              rows={6}
              placeholder="id,name,email,age,status&#10;1,Alex,alex@domain.com,28,active&#10;2,Jane,jane-invalid,16,pending"
              className="w-full bg-surface border border-border rounded-xl p-3 text-xs font-mono text-bright placeholder:text-subtle focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-y"
            />
          </div>
        </div>
      </SectionPanel>

      {/* ── Rule Configuration Section ───────────────────────────────────── */}
      <SectionPanel
        title={`Column Validation Rules (${rules.length} Columns)`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySchemaJson}
              className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-bright px-2.5 py-1 rounded-md bg-muted/30 border border-border transition-colors"
              title="Copy rules schema to clipboard"
            >
              {copiedStatus === 'rules' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedStatus === 'rules' ? 'Copied' : 'Copy Schema'}
            </button>
          </div>
        }
      >
        {rules.length === 0 ? (
          <div className="p-8 text-center text-subtle text-xs bg-surface/50 border border-dashed border-border rounded-xl">
            No columns detected yet. Upload a file or paste sample records above to configure validation rules.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {rules.map((rule, idx) => {
                const isExpanded = expandedCol === rule.columnName
                const activeTab = activeTabByCol[rule.columnName] || 'text'
                return (
                  <div
                    key={rule.columnName}
                    className="p-3.5 bg-surface border border-border hover:border-border-hover rounded-xl transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Column Header & Quick Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-bright text-xs font-mono truncate" title={rule.columnName}>
                          #{idx + 1} {rule.columnName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                          {rule.required && <span className="text-amber-400 font-medium">Req</span>}
                          {rule.unique && <span className="text-purple-400 font-medium">Uniq</span>}
                          {rule.disallowNullStrings && <span className="text-indigo-400 font-medium">NoNull</span>}
                        </div>
                      </div>

                      {/* Data Type Selector (20+ types) */}
                      <div className="mb-2.5">
                        <label htmlFor={`col-type-${rule.columnName}`} className="block text-[11px] text-subtle mb-1">
                          Data Type & Format
                        </label>
                        <select
                          id={`col-type-${rule.columnName}`}
                          aria-label={`Expected Type for ${rule.columnName}`}
                          value={rule.dataType}
                          onChange={e => updateRule(rule.columnName, { dataType: e.target.value as ColumnDataType })}
                          className="w-full bg-surface-raised border border-border rounded-md px-2 py-1.5 text-xs text-bright font-mono focus:outline-none focus:border-indigo-500"
                        >
                          {DATA_TYPES.map(t => (
                            <option key={t.value} value={t.value}>
                              [{t.group}] {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Primary Constraint Checkboxes */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-dim mb-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.required}
                            onChange={e => updateRule(rule.columnName, { required: e.target.checked })}
                            className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                          />
                          <span>Required (Not empty)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.unique}
                            onChange={e => updateRule(rule.columnName, { unique: e.target.checked })}
                            className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                          />
                          <span>Unique (No dups)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(rule.disallowNullStrings)}
                            onChange={e => updateRule(rule.columnName, { disallowNullStrings: e.target.checked })}
                            className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                          />
                          <span>Reject "NULL" / "N/A"</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(rule.trimCheck)}
                            onChange={e => updateRule(rule.columnName, { trimCheck: e.target.checked })}
                            className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                          />
                          <span>Enforce Trimmed</span>
                        </label>
                      </div>

                      {/* Detailed Constraints Sub-Tabs */}
                      {isExpanded && (
                        <div className="pt-2.5 border-t border-border/70 space-y-2.5 text-xs">
                          {/* Inner Tabs */}
                          <div className="flex items-center gap-1 p-0.5 bg-surface-raised border border-border rounded-lg text-[10px]">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTabByCol(prev => ({ ...prev, [rule.columnName]: 'text' }))
                              }
                              className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                                activeTab === 'text' ? 'bg-surface text-bright shadow-xs' : 'text-subtle hover:text-dim'
                              }`}
                            >
                              Text & Case
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTabByCol(prev => ({ ...prev, [rule.columnName]: 'bounds' }))
                              }
                              className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                                activeTab === 'bounds' ? 'bg-surface text-bright shadow-xs' : 'text-subtle hover:text-dim'
                              }`}
                            >
                              Bounds & Dates
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTabByCol(prev => ({ ...prev, [rule.columnName]: 'pattern' }))
                              }
                              className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                                activeTab === 'pattern' ? 'bg-surface text-bright shadow-xs' : 'text-subtle hover:text-dim'
                              }`}
                            >
                              Enums & Regex
                            </button>
                          </div>

                          {/* Tab 1: Text & Case */}
                          {activeTab === 'text' && (
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Min Length</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={rule.minLength ?? ''}
                                    placeholder="0"
                                    onChange={e =>
                                      updateRule(rule.columnName, {
                                        minLength: e.target.value === '' ? undefined : Number(e.target.value)
                                      })
                                    }
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Max Length</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={rule.maxLength ?? ''}
                                    placeholder="None"
                                    onChange={e =>
                                      updateRule(rule.columnName, {
                                        maxLength: e.target.value === '' ? undefined : Number(e.target.value)
                                      })
                                    }
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Exact Length</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={rule.exactLength ?? ''}
                                    placeholder="Exact chars"
                                    onChange={e =>
                                      updateRule(rule.columnName, {
                                        exactLength: e.target.value === '' ? undefined : Number(e.target.value)
                                      })
                                    }
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Word Count (Min / Max)</label>
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      value={rule.minWords ?? ''}
                                      placeholder="Min"
                                      onChange={e =>
                                        updateRule(rule.columnName, {
                                          minWords: e.target.value === '' ? undefined : Number(e.target.value)
                                        })
                                      }
                                      className="w-1/2 bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                    />
                                    <input
                                      type="number"
                                      min={0}
                                      value={rule.maxWords ?? ''}
                                      placeholder="Max"
                                      onChange={e =>
                                        updateRule(rule.columnName, {
                                          maxWords: e.target.value === '' ? undefined : Number(e.target.value)
                                        })
                                      }
                                      className="w-1/2 bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Starts With</label>
                                  <input
                                    type="text"
                                    value={rule.startsWith ?? ''}
                                    placeholder="Prefix"
                                    onChange={e => updateRule(rule.columnName, { startsWith: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Ends With</label>
                                  <input
                                    type="text"
                                    value={rule.endsWith ?? ''}
                                    placeholder="Suffix"
                                    onChange={e => updateRule(rule.columnName, { endsWith: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Must Contain</label>
                                  <input
                                    type="text"
                                    value={rule.contains ?? ''}
                                    placeholder="Substring"
                                    onChange={e => updateRule(rule.columnName, { contains: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Must NOT Contain</label>
                                  <input
                                    type="text"
                                    value={rule.notContains ?? ''}
                                    placeholder="Forbidden text"
                                    onChange={e => updateRule(rule.columnName, { notContains: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-[11px] text-dim pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(rule.uppercaseOnly)}
                                    onChange={e => updateRule(rule.columnName, { uppercaseOnly: e.target.checked })}
                                    className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                                  />
                                  <span>ALL UPPERCASE</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(rule.lowercaseOnly)}
                                    onChange={e => updateRule(rule.columnName, { lowercaseOnly: e.target.checked })}
                                    className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                                  />
                                  <span>all lowercase</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Tab 2: Bounds & Dates */}
                          {activeTab === 'bounds' && (
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Min Value</label>
                                  <input
                                    type="number"
                                    value={rule.min ?? ''}
                                    placeholder="None"
                                    onChange={e =>
                                      updateRule(rule.columnName, {
                                        min: e.target.value === '' ? undefined : Number(e.target.value)
                                      })
                                    }
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Max Value</label>
                                  <input
                                    type="number"
                                    value={rule.max ?? ''}
                                    placeholder="None"
                                    onChange={e =>
                                      updateRule(rule.columnName, {
                                        max: e.target.value === '' ? undefined : Number(e.target.value)
                                      })
                                    }
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-[11px] text-dim">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(rule.positiveOnly)}
                                    onChange={e => updateRule(rule.columnName, { positiveOnly: e.target.checked })}
                                    className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                                  />
                                  <span>Positive Only (&gt; 0)</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(rule.nonNegativeOnly)}
                                    onChange={e => updateRule(rule.columnName, { nonNegativeOnly: e.target.checked })}
                                    className="rounded border-border text-indigo-600 focus:ring-0 bg-surface"
                                  />
                                  <span>Non-Negative (&ge; 0)</span>
                                </label>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Date Must Be After</label>
                                  <input
                                    type="text"
                                    value={rule.dateAfter ?? ''}
                                    placeholder="YYYY-MM-DD"
                                    onChange={e => updateRule(rule.columnName, { dateAfter: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-subtle mb-0.5">Date Must Be Before</label>
                                  <input
                                    type="text"
                                    value={rule.dateBefore ?? ''}
                                    placeholder="YYYY-MM-DD"
                                    onChange={e => updateRule(rule.columnName, { dateBefore: e.target.value || undefined })}
                                    className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tab 3: Enums & Regex */}
                          {activeTab === 'pattern' && (
                            <div className="space-y-2 pt-1">
                              <div>
                                <label className="block text-[10px] text-subtle mb-0.5">Regex Pattern</label>
                                <input
                                  type="text"
                                  value={rule.pattern ?? ''}
                                  placeholder="e.g. ^[A-Z]{3}-\d+$"
                                  onChange={e => updateRule(rule.columnName, { pattern: e.target.value || undefined })}
                                  className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-subtle mb-0.5">Allowed Values / Whitelist (Comma-separated)</label>
                                <input
                                  type="text"
                                  value={(rule.allowedValues || []).join(', ')}
                                  placeholder="e.g. active, pending, suspended"
                                  onChange={e =>
                                    updateRule(rule.columnName, {
                                      allowedValues: e.target.value
                                        .split(',')
                                        .map(s => s.trim())
                                        .filter(Boolean)
                                    })
                                  }
                                  className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-subtle mb-0.5">Forbidden Values / Blacklist (Comma-separated)</label>
                                <input
                                  type="text"
                                  value={(rule.forbiddenValues || []).join(', ')}
                                  placeholder="e.g. root, admin, test, dummy"
                                  onChange={e =>
                                    updateRule(rule.columnName, {
                                      forbiddenValues: e.target.value
                                        .split(',')
                                        .map(s => s.trim())
                                        .filter(Boolean)
                                    })
                                  }
                                  className="w-full bg-surface-raised border border-border rounded px-2 py-1 text-xs text-bright font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Toggle Accordion Button */}
                    <button
                      onClick={() => setExpandedCol(isExpanded ? null : rule.columnName)}
                      className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-subtle hover:text-bright transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sliders size={12} />
                        {isExpanded ? 'Hide Advanced Rule Constraints' : 'Configure Advanced Rules (20+)'}
                      </span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Validation Trigger Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-subtle">
                {rules.length} column rules configured · {rawText ? `${rawText.split('\n').filter(Boolean).length - 1} records ready` : 'No data'}
              </span>

              <button
                onClick={handleRunValidation}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md active:scale-98"
              >
                <CheckCircle2 size={16} />
                Validate File Data
              </button>
            </div>
          </div>
        )}
      </SectionPanel>

      {/* ── Validation Results & Summary Dashboard ───────────────────────── */}
      {validated && summary && (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              summary.totalErrors === 0
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {summary.totalErrors === 0 ? (
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={24} className="text-rose-400 shrink-0" />
              )}
              <div>
                <h2 className="text-sm font-semibold">
                  {summary.totalErrors === 0
                    ? 'All Validation Rules Passed Successfully!'
                    : `Validation Failed: ${summary.totalErrors} Violation${summary.totalErrors === 1 ? '' : 's'} Detected`}
                </h2>
                <p className="text-xs text-dim">
                  {summary.totalErrors === 0
                    ? `100% of ${summary.totalRows} records strictly meet all column schema definitions.`
                    : `${summary.invalidRows} of ${summary.totalRows} data rows contain one or more schema violations.`}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-dim shrink-0">
              Evaluated in <strong className="text-bright tabular-nums">{summary.executionTimeMs}ms</strong>
            </span>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Rows" value={summary.totalRows} />
            <StatCard
              label="Valid Rows"
              value={summary.validRows}
              subtext={`${summary.totalRows > 0 ? ((summary.validRows / summary.totalRows) * 100).toFixed(1) : 0}% compliant`}
            />
            <StatCard
              label="Invalid Rows"
              value={summary.invalidRows}
              subtext={`${summary.totalRows > 0 ? ((summary.invalidRows / summary.totalRows) * 100).toFixed(1) : 0}% affected`}
            />
            <StatCard label="Total Violations" value={summary.totalErrors} />
          </div>

          {/* Interactive Error Table & Filter Toolbar */}
          <SectionPanel
            title={`Violations Explorer (${filteredErrors.length})`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportErrorReport}
                  disabled={errors.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dim hover:text-bright bg-surface border border-border rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Download size={13} />
                  Error Audit (CSV)
                </button>
                <button
                  onClick={handleExportInvalidRows}
                  disabled={summary.invalidRows === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/20 border border-rose-800/40 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <XCircle size={13} />
                  Export Invalid Rows
                </button>
                <button
                  onClick={handleExportCleanRows}
                  disabled={summary.validRows === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/20 border border-emerald-800/40 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <CheckCircle2 size={13} />
                  Export Clean Rows
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter size={13} className="text-subtle" />
                    <span className="text-dim">Column:</span>
                    <select
                      value={filterColumn}
                      onChange={e => {
                        setFilterColumn(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="bg-surface border border-border rounded-md px-2 py-1 text-bright text-xs focus:outline-none font-mono"
                    >
                      <option value="all">All Columns</option>
                      {detectedHeaders.map(h => (
                        <option key={h} value={h}>
                          {h} ({summary.errorsByColumn[h] || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-dim">Rule:</span>
                    <select
                      value={filterRuleType}
                      onChange={e => {
                        setFilterRuleType(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="bg-surface border border-border rounded-md px-2 py-1 text-bright text-xs focus:outline-none font-mono"
                    >
                      <option value="all">All Rules</option>
                      {Object.keys(summary.errorsByRule).map(rule => (
                        <option key={rule} value={rule}>
                          {rule} ({summary.errorsByRule[rule]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Search errors..."
                    className="pl-7 pr-3 py-1 bg-surface border border-border rounded-md text-xs text-bright placeholder:text-subtle focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Table */}
              {filteredErrors.length === 0 ? (
                <div className="p-8 text-center text-subtle text-xs bg-surface/30 border border-border/50 rounded-xl">
                  {errors.length === 0
                    ? 'No violations found! Every record complies with your rules.'
                    : 'No violations match your active filter criteria.'}
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface border-b border-border text-subtle font-mono uppercase text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 w-16">Row</th>
                          <th className="py-2.5 px-3 w-32">Column</th>
                          <th className="py-2.5 px-3 w-28">Rule</th>
                          <th className="py-2.5 px-3">Offending Value</th>
                          <th className="py-2.5 px-3">Violation Reason</th>
                          <th className="py-2.5 px-3 w-16 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono">
                        {paginatedErrors.map(err => (
                          <tr key={err.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-2.5 px-3 text-dim tabular-nums font-semibold">
                              #{err.rowIndex}
                            </td>
                            <td className="py-2.5 px-3 text-bright font-medium">
                              {err.columnName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[11px] font-sans text-amber-400 capitalize">
                                {err.ruleType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-rose-300 truncate max-w-[180px]">
                              {err.cellValue === '' ? (
                                <span className="text-subtle italic">null / empty</span>
                              ) : (
                                `"${err.cellValue}"`
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-dim font-sans">
                              {err.message}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() =>
                                  setSelectedRowDetail({
                                    rowIndex: err.rowIndex,
                                    rowData: parsedRows[err.rowIndex - 1] || []
                                  })
                                }
                                className="text-subtle hover:text-indigo-400 p-1 rounded transition-colors"
                                title="Inspect entire row record"
                              >
                                <TableIcon size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-border text-xs text-subtle">
                      <span>
                        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredErrors.length)} of {filteredErrors.length} violations
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1 rounded border border-border disabled:opacity-40 hover:text-bright"
                        >
                          Prev
                        </button>
                        <span className="px-2 text-bright">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 rounded border border-border disabled:opacity-40 hover:text-bright"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SectionPanel>
        </div>
      )}

      {/* ── Row Detail Modal ─────────────────────────────────────────────── */}
      {selectedRowDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-bright font-mono">
                  Record Inspection — Row #{selectedRowDetail.rowIndex}
                </h3>
                <p className="text-xs text-subtle">
                  Full column values and field errors for this data row
                </p>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="text-subtle hover:text-bright p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="space-y-2">
                {detectedHeaders.map((header, idx) => {
                  const val = selectedRowDetail.rowData[idx] ?? ''
                  const fieldErrors = errors.filter(
                    e => e.rowIndex === selectedRowDetail.rowIndex && e.columnIndex === idx
                  )
                  return (
                    <div
                      key={header}
                      className={`p-2.5 rounded-lg border ${
                        fieldErrors.length > 0
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-surface-raised border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between text-subtle text-[11px] mb-1">
                        <span className="font-semibold text-dim">{header}</span>
                        {fieldErrors.length > 0 && (
                          <span className="text-rose-400 font-sans font-medium">
                            {fieldErrors.length} violation{fieldErrors.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <div className="text-bright break-all">
                        {val === '' ? <span className="text-subtle italic">null / empty</span> : val}
                      </div>
                      {fieldErrors.map(fe => (
                        <div key={fe.id} className="text-rose-300 font-sans text-[11px] mt-1">
                          • {fe.message}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-4 py-1.5 text-xs font-medium bg-muted/40 hover:bg-muted text-bright rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JSON Schema Edit Modal ───────────────────────────────────────── */}
      {showJsonSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-bright font-mono flex items-center gap-2">
                  <FileCode size={16} className="text-indigo-400" />
                  Validation Rules JSON Schema
                </h3>
                <p className="text-xs text-subtle">
                  Edit or import ColumnRule definitions directly as JSON
                </p>
              </div>
              <button
                onClick={() => setShowJsonSchemaModal(false)}
                className="text-subtle hover:text-bright p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-3">
              {schemaError && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/50 rounded-lg text-rose-300 text-xs">
                  {schemaError}
                </div>
              )}
              <textarea
                value={jsonSchemaInput}
                onChange={e => setJsonSchemaInput(e.target.value)}
                rows={16}
                className="w-full flex-1 bg-surface-raised border border-border rounded-xl p-3 text-xs font-mono text-bright focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="p-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonSchemaInput)
                  setCopiedStatus('modal')
                  setTimeout(() => setCopiedStatus(null), 2000)
                }}
                className="text-xs text-dim hover:text-bright flex items-center gap-1.5"
              >
                {copiedStatus === 'modal' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStatus === 'modal' ? 'Copied' : 'Copy JSON'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowJsonSchemaModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-subtle hover:text-bright"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyJsonSchema}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs"
                >
                  Apply Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
