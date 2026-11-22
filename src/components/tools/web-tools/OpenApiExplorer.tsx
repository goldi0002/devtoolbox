import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'
import ToggleGroup from '../../ui/ToggleGroup'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import OutputPanel from '../../ui/OutputPanel'
import {
  SAMPLE_OPENAPI_SPEC,
  generateCurlSnippet,
  generateFetchSnippet,
  parseOpenApiSpec,
  type HttpMethod,
  type OpenApiEndpoint,
} from '../../../utils/openApiExplorer'

const METHOD_BADGE_CLASS: Record<HttpMethod, string> = {
  get: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  post: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  put: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  patch: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  delete: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  options: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  head: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

type SnippetLang = 'curl' | 'fetch'

const SNIPPET_OPTIONS: ReadonlyArray<{ value: SnippetLang; label: string }> = [
  { value: 'curl', label: 'cURL Command' },
  { value: 'fetch', label: 'JavaScript fetch()' },
]

export default function OpenApiExplorer() {
  const [specInput, setSpecInput] = useState<string>(SAMPLE_OPENAPI_SPEC)
  const [search, setSearch] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<'all' | HttpMethod>('all')
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('GET /orders')
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [bodyDraft, setBodyDraft] = useState<string>('')
  const [snippetLang, setSnippetLang] = useState<SnippetLang>('curl')
  const [activeResponseIdx, setActiveResponseIdx] = useState<number>(0)

  const parsedResult = useMemo(() => {
    try {
      const spec = parseOpenApiSpec(specInput)
      return { spec, error: '' }
    } catch (err) {
      return {
        spec: null,
        error: err instanceof Error ? err.message : 'Unable to parse OpenAPI specification.',
      }
    }
  }, [specInput])

  const filteredEndpoints = useMemo(() => {
    if (!parsedResult.spec) return []
    const q = search.trim().toLowerCase()
    return parsedResult.spec.endpoints.filter(ep => {
      const matchesMethod = methodFilter === 'all' || ep.method === methodFilter
      const matchesQuery =
        !q ||
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.tags.some(t => t.toLowerCase().includes(q)) ||
        (ep.operationId?.toLowerCase().includes(q) ?? false)
      return matchesMethod && matchesQuery
    })
  }, [parsedResult.spec, search, methodFilter])

  const selectedEndpoint: OpenApiEndpoint | undefined = useMemo(() => {
    if (!parsedResult.spec) return undefined
    return (
      filteredEndpoints.find(e => e.id === selectedEndpointId) ??
      parsedResult.spec.endpoints.find(e => e.id === selectedEndpointId) ??
      filteredEndpoints[0] ??
      parsedResult.spec.endpoints[0]
    )
  }, [parsedResult.spec, filteredEndpoints, selectedEndpointId])

  const activeBaseUrl = useMemo(() => {
    if (selectedServer.trim()) return selectedServer.trim()
    return parsedResult.spec?.servers[0] ?? 'https://api.example.com'
  }, [selectedServer, parsedResult.spec])

  const effectiveBody = useMemo(() => {
    if (bodyDraft) return bodyDraft
    return selectedEndpoint?.requestBody?.sampleJson ?? ''
  }, [bodyDraft, selectedEndpoint])

  const generatedSnippet = useMemo(() => {
    if (!selectedEndpoint) return ''
    return snippetLang === 'curl'
      ? generateCurlSnippet(activeBaseUrl, selectedEndpoint, paramValues, effectiveBody)
      : generateFetchSnippet(activeBaseUrl, selectedEndpoint, paramValues, effectiveBody)
  }, [activeBaseUrl, selectedEndpoint, paramValues, effectiveBody, snippetLang])

  const handleSelectEndpoint = (ep: OpenApiEndpoint) => {
    setSelectedEndpointId(ep.id)
    setBodyDraft(ep.requestBody?.sampleJson ?? '')
    setActiveResponseIdx(0)
  }

  return (
    <ToolLayout
      title="OpenAPI / Swagger 3.0 Explorer"
      description="Inspect OpenAPI 3.x & Swagger 2.0 YAML/JSON specs, resolve $ref schemas, and generate cURL or fetch() requests locally"
      tag="api"
    >
      <div className="space-y-6">
        <SectionPanel
          title="OpenAPI / Swagger Specification (YAML or JSON)"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSpecInput(SAMPLE_OPENAPI_SPEC)
                  setSelectedEndpointId('GET /orders')
                  setParamValues({})
                  setBodyDraft('')
                }}
                className="btn-ghost text-xs py-1 px-2.5"
              >
                Load Sample Spec
              </button>
            </div>
          }
        >
          <TextAreaField
            label="Paste or drop an OpenAPI 3.0 / 3.1 / Swagger 2.0 spec"
            value={specInput}
            onChange={setSpecInput}
            placeholder="openapi: 3.0.3&#10;info:&#10;  title: My API&#10;  version: 1.0.0"
            className="textarea-base h-44 font-mono text-xs"
          />
        </SectionPanel>

        {parsedResult.error && <ErrorBanner message={parsedResult.error} />}

        {parsedResult.spec && (
          <>
            {/* API Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <StatCard label="API Title" value={parsedResult.spec.title} subValue={parsedResult.spec.specVersion} />
              <StatCard label="Version" value={parsedResult.spec.version} valueClassName="tabular-nums" />
              <StatCard label="Endpoints" value={String(parsedResult.spec.endpoints.length)} valueClassName="tabular-nums" />
              <StatCard label="Component Schemas" value={String(parsedResult.spec.schemaCount)} valueClassName="tabular-nums" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Endpoint Catalog */}
              <div className="lg:col-span-5 space-y-3">
                <SectionPanel title={`Endpoints (${filteredEndpoints.length})`}>
                  <div className="space-y-3">
                    <TextInputField
                      label="Filter paths, tags, or operationId"
                      value={search}
                      onChange={setSearch}
                      placeholder="/orders, createOrder..."
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {(['all', 'get', 'post', 'put', 'patch', 'delete'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethodFilter(m)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase border transition-colors ${
                            methodFilter === m
                              ? 'bg-accent text-accent-fg border-accent font-semibold'
                              : 'bg-surface border-border text-dim hover:text-bright'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {filteredEndpoints.length === 0 ? (
                      <p className="text-xs font-mono text-subtle py-6 text-center">
                        No endpoints match your filter.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/60 max-h-[460px] overflow-y-auto -mx-1 px-1">
                        {filteredEndpoints.map(ep => {
                          const active = selectedEndpoint?.id === ep.id
                          return (
                            <li key={ep.id} className="py-1.5">
                              <button
                                type="button"
                                onClick={() => handleSelectEndpoint(ep)}
                                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                                  active
                                    ? 'bg-accent-soft border-accent/50'
                                    : 'bg-surface/40 border-transparent hover:border-border hover:bg-surface'
                                }`}
                              >
                                <span
                                  className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${METHOD_BADGE_CLASS[ep.method]}`}
                                >
                                  {ep.method}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className={`font-mono text-xs font-semibold truncate ${ep.deprecated ? 'line-through text-subtle' : 'text-bright'}`}>
                                    {ep.path}
                                  </div>
                                  <div className="text-[11px] font-sans text-dim truncate mt-0.5">
                                    {ep.summary}
                                  </div>
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </SectionPanel>
              </div>

              {/* Right: Endpoint Details & Request Builder */}
              <div className="lg:col-span-7 space-y-5">
                {selectedEndpoint ? (
                  <>
                    <SectionPanel
                      title="Endpoint Inspector & Request Builder"
                      extra={
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${METHOD_BADGE_CLASS[selectedEndpoint.method]}`}>
                          {selectedEndpoint.method}
                        </span>
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="font-mono text-sm font-semibold text-bright break-all">
                            {selectedEndpoint.path}
                          </div>
                          <p className="text-xs font-sans text-dim mt-1">
                            {selectedEndpoint.description || selectedEndpoint.summary}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono text-subtle">
                            <span>Tags: {selectedEndpoint.tags.join(', ')}</span>
                            {selectedEndpoint.operationId && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>operationId: {selectedEndpoint.operationId}</span>
                              </>
                            )}
                            {selectedEndpoint.deprecated && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-400">Deprecated</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Base server selector */}
                        <div>
                          <label htmlFor="openapi-server-select" className="block text-xs font-mono text-dim mb-1.5">
                            Target Server Base URL
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {parsedResult.spec.servers.length > 1 && (
                              <select
                                id="openapi-server-select"
                                value={selectedServer || parsedResult.spec.servers[0]}
                                onChange={e => setSelectedServer(e.target.value)}
                                className="input-base font-mono text-xs sm:w-1/2"
                              >
                                {parsedResult.spec.servers.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              aria-label="Custom server base URL"
                              value={activeBaseUrl}
                              onChange={e => setSelectedServer(e.target.value)}
                              className="input-base font-mono text-xs flex-1"
                            />
                          </div>
                        </div>

                        {/* Parameters */}
                        {selectedEndpoint.parameters.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="text-xs font-mono text-dim uppercase tracking-wider">
                              Parameters ({selectedEndpoint.parameters.length})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedEndpoint.parameters.map(param => {
                                const key = `${param.in}:${param.name}`
                                const enumVals = Array.isArray(param.schema?.enum) ? param.schema.enum : null
                                return (
                                  <div key={key} className="p-2.5 rounded border border-border bg-surface/40 space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                                      <span className="font-semibold text-bright">
                                        {param.name}
                                        {param.required && <span className="text-rose-400 ml-1">*</span>}
                                      </span>
                                      <span className="text-[10px] text-subtle">
                                        {param.in} · {String(param.schema?.type ?? 'string')}
                                      </span>
                                    </div>
                                    {param.description && (
                                      <p className="text-[11px] font-sans text-dim">{param.description}</p>
                                    )}
                                    {enumVals ? (
                                      <select
                                        aria-label={`Value for ${param.name}`}
                                        value={paramValues[key] ?? ''}
                                        onChange={e => setParamValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="input-base font-mono text-xs py-1.5"
                                      >
                                        <option value="">(default / unset)</option>
                                        {enumVals.map(v => (
                                          <option key={String(v)} value={String(v)}>{String(v)}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        aria-label={`Value for ${param.name}`}
                                        value={paramValues[key] ?? ''}
                                        onChange={e => setParamValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder={param.example !== undefined ? String(param.example) : `Enter ${param.name}...`}
                                        className="input-base font-mono text-xs py-1.5"
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {selectedEndpoint.requestBody && (
                          <TextAreaField
                            label={`Request Body (${selectedEndpoint.requestBody.contentType})`}
                            value={effectiveBody}
                            onChange={setBodyDraft}
                            className="textarea-base h-40 font-mono text-xs"
                          />
                        )}
                      </div>
                    </SectionPanel>

                    {/* Code Snippet Generator */}
                    <div className="space-y-3">
                      <div role="group" aria-label="Snippet language" className="flex flex-wrap gap-2">
                        <ToggleGroup options={SNIPPET_OPTIONS} value={snippetLang} onChange={setSnippetLang} />
                      </div>
                      <OutputPanel
                        label={snippetLang === 'curl' ? 'Generated cURL Request' : 'Generated JavaScript fetch()'}
                        value={generatedSnippet}
                        heightClass="min-h-[120px] max-h-[260px]"
                      />
                    </div>

                    {/* Responses */}
                    {selectedEndpoint.responses.length > 0 && (
                      <SectionPanel title={`Responses (${selectedEndpoint.responses.length})`}>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEndpoint.responses.map((resp, idx) => (
                              <button
                                key={`${resp.status}-${idx}`}
                                type="button"
                                onClick={() => setActiveResponseIdx(idx)}
                                className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors tabular-nums ${
                                  activeResponseIdx === idx
                                    ? 'bg-accent text-accent-fg border-accent font-semibold'
                                    : 'bg-surface border-border text-dim hover:text-bright'
                                }`}
                              >
                                {resp.status}
                              </button>
                            ))}
                          </div>
                          {selectedEndpoint.responses[activeResponseIdx] && (
                            <div className="space-y-2">
                              <p className="text-xs font-sans text-dim">
                                {selectedEndpoint.responses[activeResponseIdx].description}
                              </p>
                              {selectedEndpoint.responses[activeResponseIdx].exampleJson && (
                                <pre className="p-3 rounded border border-border bg-bg font-mono text-xs text-bright overflow-auto max-h-56">
                                  {selectedEndpoint.responses[activeResponseIdx].exampleJson}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      </SectionPanel>
                    )}
                  </>
                ) : (
                  <SectionPanel title="Endpoint Inspector">
                    <p className="text-xs font-mono text-subtle py-8 text-center">
                      Select an endpoint from the left list to inspect parameters, schemas, and request snippets.
                    </p>
                  </SectionPanel>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
