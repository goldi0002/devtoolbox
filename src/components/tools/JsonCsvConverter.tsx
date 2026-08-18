import { useState, useMemo } from 'react'
import { jsonToCsv, csvToJson, detectDelimiter, parseCsvLine } from '../../utils/jsonCsv'
import CopyButton from '../CopyButton'
import { ArrowLeftRight, FileSpreadsheet, Download, Table, Code2, AlertCircle } from 'lucide-react'

const SAMPLE_JSON = `[
  {
    "id": 101,
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.io",
    "role": "Lead Architect",
    "active": true,
    "address": {
      "city": "Los Angeles",
      "country": "USA"
    }
  },
  {
    "id": 102,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Developer",
    "active": false,
    "address": {
      "city": "Berlin",
      "country": "Germany"
    }
  }
]`

export default function JsonCsvConverter() {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv')
  const [input, setInput] = useState(SAMPLE_JSON)
  const [delimiter, setDelimiter] = useState(',')
  const [flatten, setFlatten] = useState(true)
  const [quoteAll, setQuoteAll] = useState(false)
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [parseNumbers, setParseNumbers] = useState(true)
  const [parseBooleans, setParseBooleans] = useState(true)
  const [activeTab, setActiveTab] = useState<'output' | 'table'>('output')

  const { output, error, tableData } = useMemo(() => {
    try {
      if (!input.trim()) return { output: '', error: null, tableData: null }

      if (mode === 'json-to-csv') {
        const csvRes = jsonToCsv(input, { delimiter, flatten, quoteAll, includeHeaders })
        // Parse CSV for table preview
        const lines = csvRes.trim().split('\n')
        const headers = lines.length > 0 ? parseCsvLine(lines[0], delimiter) : []
        const rows = lines.slice(1).map(l => parseCsvLine(l, delimiter))
        return { output: csvRes, error: null, tableData: { headers, rows } }
      } else {
        const jsonRes = csvToJson(input, { delimiter, unflatten: flatten, parseNumbers, parseBooleans })
        const jsonFormatted = JSON.stringify(jsonRes, null, 2)
        // Flatten for table preview
        const headersSet = new Set<string>()
        jsonRes.forEach(item => {
          if (item && typeof item === 'object') Object.keys(item).forEach(k => headersSet.add(k))
        })
        const headers = Array.from(headersSet)
        const rows = jsonRes.map(item => headers.map(h => typeof item[h] === 'object' ? JSON.stringify(item[h]) : String(item[h] ?? '')))
        return { output: jsonFormatted, error: null, tableData: { headers, rows } }
      }
    } catch (err: any) {
      return { output: '', error: err?.message || 'Formatting error', tableData: null }
    }
  }, [input, mode, delimiter, flatten, quoteAll, includeHeaders, parseNumbers, parseBooleans])

  const handleDownload = () => {
    if (!output) return
    const filename = mode === 'json-to-csv' ? 'data.csv' : 'data.json'
    const mime = mode === 'json-to-csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;'
    const blob = new Blob([output], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAutoDetectDelimiter = () => {
    const detected = detectDelimiter(input)
    setDelimiter(detected)
  }

  const swapMode = () => {
    if (output) {
      setInput(output)
    }
    setMode(prev => prev === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv')
  }

  return (
    <div className="space-y-6">
      {/* ── Top Controls ── */}
      <div className="card p-5 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border/80">
            <button
              type="button"
              onClick={() => setMode('json-to-csv')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                mode === 'json-to-csv' ? 'bg-indigo-600 text-white shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              JSON to CSV
            </button>
            <button
              type="button"
              onClick={() => setMode('csv-to-json')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                mode === 'csv-to-json' ? 'bg-indigo-600 text-white shadow-xs' : 'text-dim hover:text-bright'
              }`}
            >
              CSV to JSON
            </button>
          </div>

          {/* Delimiter Selection */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-subtle">Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-bright text-xs font-mono"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
            {mode === 'csv-to-json' && (
              <button
                type="button"
                onClick={handleAutoDetectDelimiter}
                className="px-2 py-1 text-[11px] bg-muted/30 border border-border rounded text-dim hover:text-bright"
              >
                Auto-Detect
              </button>
            )}
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-border/50 text-xs font-mono text-dim">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flatten}
              onChange={(e) => setFlatten(e.target.checked)}
              className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
            />
            <span>{mode === 'json-to-csv' ? 'Flatten Nested Objects' : 'Unflatten Dot-Notation'}</span>
          </label>

          {mode === 'json-to-csv' ? (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                />
                <span>Include Header Row</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quoteAll}
                  onChange={(e) => setQuoteAll(e.target.checked)}
                  className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                />
                <span>Quote All Fields</span>
              </label>
            </>
          ) : (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parseNumbers}
                  onChange={(e) => setParseNumbers(e.target.checked)}
                  className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                />
                <span>Auto-Parse Numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parseBooleans}
                  onChange={(e) => setParseBooleans(e.target.checked)}
                  className="rounded border-border bg-muted/40 text-indigo-600 focus:ring-0"
                />
                <span>Auto-Parse Booleans</span>
              </label>
            </>
          )}

          <button
            type="button"
            onClick={swapMode}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
          >
            <ArrowLeftRight size={13} />
            Swap Direction
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* ── Editor & Result Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card p-4 bg-surface border border-border rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-subtle font-medium">
              {mode === 'json-to-csv' ? 'Input JSON Array' : 'Input CSV Data'}
            </span>
            <button
              onClick={() => setInput('')}
              className="text-[11px] font-mono text-subtle hover:text-bright transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            placeholder={mode === 'json-to-csv' ? 'Paste JSON array here...' : 'Paste CSV data here...'}
            className="w-full flex-1 p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright placeholder:text-subtle focus:outline-none focus:border-indigo-500 transition-all resize-y"
          />
        </div>

        {/* Output Panel with Tab Switching */}
        <div className="card p-4 bg-surface border border-border rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeTab === 'output' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-dim hover:text-bright'
                }`}
              >
                <Code2 size={13} />
                Raw Output
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeTab === 'table' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-dim hover:text-bright'
                }`}
              >
                <Table size={13} />
                Table Preview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md bg-muted/40 border border-border text-dim hover:text-bright disabled:opacity-40 transition-colors"
              >
                <Download size={13} />
                Export
              </button>
              <CopyButton text={output} disabled={!output} />
            </div>
          </div>

          {activeTab === 'output' ? (
            <textarea
              readOnly
              value={output}
              rows={14}
              placeholder="Converted result will appear here..."
              className="w-full flex-1 p-3 bg-muted/20 border border-border rounded-lg font-mono text-xs text-bright select-all focus:outline-none resize-y"
            />
          ) : (
            <div className="w-full flex-1 max-h-[380px] overflow-auto border border-border rounded-lg bg-muted/20 p-2">
              {tableData && tableData.headers.length > 0 ? (
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40">
                      {tableData.headers.map((h, i) => (
                        <th key={i} className="p-2 font-semibold text-indigo-300 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-border/40 hover:bg-muted/30">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 text-bright whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-subtle">
                  No table data available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
