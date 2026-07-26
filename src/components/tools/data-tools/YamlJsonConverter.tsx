import { useState, useMemo } from 'react'
import YAML from 'yaml'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import OutputPanel from '../../ui/OutputPanel'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import CopyButton from '../../CopyButton'

type Direction = 'yaml-to-json' | 'json-to-yaml'

const SAMPLE_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: production
  labels:
    app: api-service
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      containers:
        - name: server
          image: node:20-alpine
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "3000"
`

const SAMPLE_JSON = `{
  "swagger": "2.0",
  "info": {
    "title": "Developer Toolbox API",
    "version": "1.0.0",
    "description": "Fast, privacy-first web developer utilities"
  },
  "host": "api.toolbox4devs.com",
  "basePath": "/v1",
  "schemes": ["https"],
  "paths": {
    "/tools": {
      "get": {
        "summary": "List all developer tools",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "A list of tools"
          }
        }
      }
    }
  }
}`

export default function YamlJsonConverter() {
  const [direction, setDirection] = useState<Direction>('yaml-to-json')
  const [inputVal, setInputVal] = useState<string>(SAMPLE_YAML)
  const [indentSize, setIndentSize] = useState<number>(2)
  const [sortKeys, setSortKeys] = useState<boolean>(false)

  // Handle direction switch & sample loading
  const handleDirectionChange = (newDir: Direction) => {
    setDirection(newDir)
    if (newDir === 'yaml-to-json') {
      setInputVal(SAMPLE_YAML)
    } else {
      setInputVal(SAMPLE_JSON)
    }
  }

  const { output, error, isValid, metrics } = useMemo(() => {
    if (!inputVal.trim()) {
      return { output: '', error: null, isValid: true, metrics: null }
    }

    try {
      if (direction === 'yaml-to-json') {
        const parsed = YAML.parse(inputVal)
        let jsonStr = ''
        if (sortKeys && typeof parsed === 'object' && parsed !== null) {
          const sorted = sortObjectKeys(parsed)
          jsonStr = JSON.stringify(sorted, null, indentSize)
        } else {
          jsonStr = JSON.stringify(parsed, null, indentSize)
        }

        const keysCount = countKeys(parsed)
        return {
          output: jsonStr,
          error: null,
          isValid: true,
          metrics: {
            keysCount,
            rawSize: inputVal.length,
            convertedSize: jsonStr.length,
            type: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed,
          },
        }
      } else {
        const parsedJson = JSON.parse(inputVal)
        const doc = new YAML.Document(parsedJson)
        if (sortKeys && typeof parsedJson === 'object' && parsedJson !== null) {
          doc.contents = sortObjectKeys(parsedJson) as any
        }
        const yamlStr = YAML.stringify(parsedJson, {
          indent: indentSize,
        })

        const keysCount = countKeys(parsedJson)
        return {
          output: yamlStr,
          error: null,
          isValid: true,
          metrics: {
            keysCount,
            rawSize: inputVal.length,
            convertedSize: yamlStr.length,
            type: Array.isArray(parsedJson) ? 'Array' : typeof parsedJson === 'object' && parsedJson !== null ? 'Object' : typeof parsedJson,
          },
        }
      }
    } catch (err: any) {
      return {
        output: '',
        error: err.message || 'Syntax parsing error',
        isValid: false,
        metrics: null,
      }
    }
  }, [inputVal, direction, indentSize, sortKeys])

  return (
    <ToolLayout
      title="YAML <-> JSON Converter"
      description="Convert bidirectionally between YAML and JSON formats with real-time validation, key sorting, and custom indentation."
      tag="data"
    >
      <div className="space-y-6">
        {/* Mode & Config Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface border border-border rounded-xl">
          {/* Direction Tabs */}
          <div className="flex items-center gap-1.5 bg-bg p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => handleDirectionChange('yaml-to-json')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                direction === 'yaml-to-json'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-dim hover:text-bright'
              }`}
            >
              YAML ➔ JSON
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('json-to-yaml')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                direction === 'json-to-yaml'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-dim hover:text-bright'
              }`}
            >
              JSON ➔ YAML
            </button>
          </div>

          {/* Settings */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-dim">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded border-border text-indigo-500 focus:ring-indigo-500/20"
              />
              <span>Alphabetize Keys</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-subtle">Indentation:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="bg-bg border border-border text-bright rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input Editor */}
        <div>
          <CodeInput
            value={inputVal}
            onChange={setInputVal}
            placeholder={
              direction === 'yaml-to-json'
                ? 'Paste YAML document here...'
                : 'Paste JSON object or array here...'
            }
            language={direction === 'yaml-to-json' ? 'yaml' : 'json'}
            label={direction === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
            rows={8}
          />
        </div>

        {/* Validation Error Banner */}
        {!isValid && error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono leading-relaxed">
            <p className="font-semibold mb-1">Parsing Error Detected:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Output Panel */}
        {isValid && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-subtle">
                Converted Output ({direction === 'yaml-to-json' ? 'JSON' : 'YAML'})
              </span>
              <CopyButton text={output} />
            </div>
            <OutputPanel
              value={output}
              language={direction === 'yaml-to-json' ? 'json' : 'yaml'}
            />
          </div>
        )}

        {/* Quick Answer Metrics */}
        {metrics && (
          <QuickAnswerCard
            title="Structure & Conversion Metrics"
            items={[
              { label: 'Root Data Type', value: metrics.type },
              { label: 'Total Object Keys', value: metrics.keysCount.toString() },
              { label: 'Input Length', value: `${metrics.rawSize} chars` },
              { label: 'Converted Length', value: `${metrics.convertedSize} chars` },
            ]}
          />
        )}
      </div>
    </ToolLayout>
  )
}

function countKeys(obj: any): number {
  if (obj === null || typeof obj !== 'object') return 0
  let count = 0
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countKeys(item)
    }
  } else {
    for (const key of Object.keys(obj)) {
      count++
      count += countKeys(obj[key])
    }
  }
  return count
}

function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sortObjectKeys)

  return Object.keys(obj)
    .sort()
    .reduce((acc: any, key: string) => {
      acc[key] = sortObjectKeys(obj[key])
      return acc
    }, {})
}
