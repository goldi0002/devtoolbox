import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { baseExtensions, baseSetup } from '../../../lib/editor-theme'
import { Copy, Download, RefreshCw, CheckCircle2, AlertCircle, FileJson, Layers, ShieldCheck, Check } from 'lucide-react'
import {
  generateJsonSchema,
  validateJsonAgainstSchema,
  JsonSchemaOptions,
  SchemaDraft,
  RequiredMode,
  ValidationResult
} from '../../../utils/jsonSchemaGenerator'

const SAMPLE_PAYLOADS: Record<string, string> = {
  user: JSON.stringify(
    {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      username: "alex_dev",
      email: "alex@example.com",
      age: 28,
      isAdmin: false,
      website: "https://toolbox4devs.com",
      createdAt: "2026-10-24T18:30:00Z",
      roles: ["editor", "developer"],
      address: {
        city: "San Francisco",
        state: "CA",
        zip: 94107
      }
    },
    null,
    2
  ),
  product: JSON.stringify(
    {
      sku: "PROD-88219",
      name: "Wireless Mechanical Keyboard",
      price: 129.99,
      inStock: true,
      tags: ["hardware", "usb-c", "accessories"],
      specifications: {
        switches: "Gateron Red",
        batteryMah: 4000,
        bluetoothVersion: 5.2
      }
    },
    null,
    2
  ),
  apiResponse: JSON.stringify(
    {
      status: 200,
      success: true,
      data: [
        { id: 1, name: "Alpha Service", latencyMs: 14.2 },
        { id: 2, name: "Beta Service", latencyMs: 22.8 }
      ],
      metadata: {
        page: 1,
        totalItems: 42,
        serverTime: "2026-10-24T20:00:00Z"
      }
    },
    null,
    2
  )
}

export default function JsonSchemaGenerator() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_PAYLOADS.user)
  const [draft, setDraft] = useState<SchemaDraft>('draft-07')
  const [requiredMode, setRequiredMode] = useState<RequiredMode>('all')
  const [detectFormats, setDetectFormats] = useState<boolean>(true)
  const [additionalProperties, setAdditionalProperties] = useState<boolean>(true)
  const [title, setTitle] = useState<string>('GeneratedSchema')
  const [description, setDescription] = useState<string>('Auto-generated JSON Schema from payload')

  // Live validator tab
  const [activeTab, setActiveTab] = useState<'schema' | 'validate'>('schema')
  const [testPayload, setTestPayload] = useState<string>(SAMPLE_PAYLOADS.user)
  const [copied, setCopied] = useState<boolean>(false)

  // Generate schema
  const { schemaResult, schemaString, parseError } = useMemo(() => {
    if (!inputJson.trim()) {
      return { schemaResult: null, schemaString: '', parseError: 'Input is empty' }
    }
    try {
      const options: JsonSchemaOptions = {
        draft,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        requiredMode,
        detectFormats,
        additionalProperties,
        inferEnums: false
      }
      const schema = generateJsonSchema(inputJson, options)
      return {
        schemaResult: schema,
        schemaString: JSON.stringify(schema, null, 2),
        parseError: null
      }
    } catch (err) {
      return {
        schemaResult: null,
        schemaString: '',
        parseError: err instanceof Error ? err.message : 'Invalid JSON format'
      }
    }
  }, [inputJson, draft, requiredMode, detectFormats, additionalProperties, title, description])

  // Validate test payload against current generated schema
  const validationResult = useMemo<ValidationResult | null>(() => {
    if (!schemaResult || !testPayload.trim()) return null
    try {
      const testData = JSON.parse(testPayload)
      return validateJsonAgainstSchema(schemaResult, testData)
    } catch {
      return {
        valid: false,
        errors: [{ path: '#', message: 'Test payload is not valid JSON syntax' }]
      }
    }
  }, [schemaResult, testPayload])

  const handleCopy = async () => {
    if (!schemaString) return
    try {
      await navigator.clipboard.writeText(schemaString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleDownload = () => {
    if (!schemaString) return
    const blob = new Blob([schemaString], { type: 'application/schema+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase() || 'schema'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* Control bar: Preset selection & Schema Options */}
      <div className="surface-panel p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-dim">Presets:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputJson(SAMPLE_PAYLOADS.user)
                  setTestPayload(SAMPLE_PAYLOADS.user)
                  setTitle('UserProfileSchema')
                }}
                className="chip text-[11px]"
              >
                User Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputJson(SAMPLE_PAYLOADS.product)
                  setTestPayload(SAMPLE_PAYLOADS.product)
                  setTitle('ProductItemSchema')
                }}
                className="chip text-[11px]"
              >
                E-Commerce Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputJson(SAMPLE_PAYLOADS.apiResponse)
                  setTestPayload(SAMPLE_PAYLOADS.apiResponse)
                  setTitle('ApiResponseSchema')
                }}
                className="chip text-[11px]"
              >
                API Response
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInputJson('{}')
                setTestPayload('{}')
              }}
              className="chip text-[11px] text-muted hover:text-dim"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </button>
          </div>
        </div>

        {/* Configuration options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-dim mb-1">Schema Draft</label>
            <select
              value={draft}
              onChange={e => setDraft(e.target.value as SchemaDraft)}
              className="w-full bg-bg border border-border rounded px-2.5 py-1.5 text-bright focus:outline-none focus:border-accent"
            >
              <option value="draft-07">JSON Schema Draft-07</option>
              <option value="draft-2020-12">JSON Schema Draft 2020-12</option>
              <option value="openapi-3.0">OpenAPI 3.0 Schema</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-dim mb-1">Required Fields</label>
            <select
              value={requiredMode}
              onChange={e => setRequiredMode(e.target.value as RequiredMode)}
              className="w-full bg-bg border border-border rounded px-2.5 py-1.5 text-bright focus:outline-none focus:border-accent"
            >
              <option value="all">Require All Properties</option>
              <option value="top-level">Require Top-Level Only</option>
              <option value="none">Optional (None Required)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-dim mb-1">Format Detection</label>
            <div className="flex items-center gap-2 h-9">
              <label className="flex items-center gap-1.5 text-bright cursor-pointer">
                <input
                  type="checkbox"
                  checked={detectFormats}
                  onChange={e => setDetectFormats(e.target.checked)}
                  className="rounded border-border bg-bg text-accent focus:ring-accent"
                />
                <span>Detect date, email, uuid, uri</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-dim mb-1">Strict Properties</label>
            <div className="flex items-center gap-2 h-9">
              <label className="flex items-center gap-1.5 text-bright cursor-pointer">
                <input
                  type="checkbox"
                  checked={!additionalProperties}
                  onChange={e => setAdditionalProperties(!e.target.checked)}
                  className="rounded border-border bg-bg text-accent focus:ring-accent"
                />
                <span>Disallow additionalProperties</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Input JSON | Generated Schema / Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left Column: Sample JSON Input */}
        <div className="surface-panel p-4 rounded-lg flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold font-sans text-bright">Sample JSON Data</span>
            </div>
            <span className="text-[10px] font-mono text-muted">
              {inputJson.split('\n').length} lines · {inputJson.length} bytes
            </span>
          </div>

          <div className="border border-border rounded overflow-hidden">
            <CodeMirror
              value={inputJson}
              height="420px"
              theme="none"
              basicSetup={baseSetup}
              extensions={[...baseExtensions, json()]}
              onChange={val => setInputJson(val)}
              className="text-xs"
            />
          </div>

          {parseError ? (
            <div className="flex items-center gap-2 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{parseError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid JSON syntax — schema generated instantly</span>
            </div>
          )}
        </div>

        {/* Right Column: Output Tabs (Generated Schema / Live Validator) */}
        <div className="surface-panel p-4 rounded-lg flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-0.5 bg-bg rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'schema'
                    ? 'bg-surface text-bright shadow-sm'
                    : 'text-subtle hover:text-bright'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span>Generated Schema</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('validate')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'validate'
                    ? 'bg-surface text-bright shadow-sm'
                    : 'text-subtle hover:text-bright'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test & Validate Payload</span>
              </button>
            </div>

            {activeTab === 'schema' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-surface hover:bg-surface-elevated border border-border text-bright transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-surface hover:bg-surface-elevated border border-border text-bright transition-colors flex items-center gap-1"
                  title="Download JSON Schema"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {activeTab === 'schema' ? (
            <>
              <div className="border border-border rounded overflow-hidden">
                <CodeMirror
                  value={schemaString}
                  height="420px"
                  theme="none"
                  basicSetup={baseSetup}
                  extensions={[...baseExtensions, json()]}
                  editable={false}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                <span>{draft} format</span>
                <span>{schemaString ? `${schemaString.split('\n').length} lines` : '0 lines'}</span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-dim">
                Paste any test payload below to validate it against the generated schema in real time:
              </p>

              <div className="border border-border rounded overflow-hidden">
                <CodeMirror
                  value={testPayload}
                  height="340px"
                  theme="none"
                  basicSetup={baseSetup}
                  extensions={[...baseExtensions, json()]}
                  onChange={val => setTestPayload(val)}
                  className="text-xs"
                />
              </div>

              {/* Validation Result Banner */}
              {validationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-sans space-y-1.5 ${
                    validationResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {validationResult.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Payload Validates Successfully against Schema!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>Payload Schema Validation Failed ({validationResult.errors.length} issue{validationResult.errors.length === 1 ? '' : 's'})</span>
                      </>
                    )}
                  </div>

                  {!validationResult.valid && (
                    <ul className="list-disc list-inside space-y-1 font-mono text-[11px] pl-1">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>
                          <span className="text-bright">{err.path}</span>: {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
