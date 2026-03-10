import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import { jsonToCSharp, jsonToTypeScript } from '../../../utils/modelGenerator'

const SAMPLE_JSON = `{
  "id": 1,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "isActive": true,
  "score": 98.5,
  "address": {
    "street": "123 Main St",
    "city": "San Francisco"
  },
  "tags": ["admin", "user"]
}`

export default function JsonModelGenerator() {
  const [input, setInput] = useState('')
  const [className, setClassName] = useState('MyModel')
  const [csharp, setCsharp] = useState('')
  const [typescript, setTypescript] = useState('')
  const [error, setError] = useState('')

  const generate = () => {
    setError('')
    try {
      setCsharp(jsonToCSharp(input || SAMPLE_JSON, className || 'MyModel'))
      setTypescript(jsonToTypeScript(input || SAMPLE_JSON, className || 'MyModel'))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const clear = () => {
    setInput('')
    setCsharp('')
    setTypescript('')
    setError('')
    setClassName('MyModel')
  }

  return (
    <ToolLayout
      title="JSON → Model Generator"
      description="Convert JSON to C# classes or TypeScript interfaces"
      tag="codegen"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-dim font-mono mb-1.5">Class / Interface Name</label>
            <input
              value={className}
              onChange={e => setClassName(e.target.value)}
              className="input-base"
              placeholder="MyModel"
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={generate} className="btn-primary">Generate</button>
            <button onClick={clear} className="btn-ghost">Clear</button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">
            JSON Input
            <button
              onClick={() => setInput(SAMPLE_JSON)}
              className="ml-2 text-subtle hover:text-dim transition-colors"
            >
              ← load example
            </button>
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="textarea-base h-40"
            placeholder={SAMPLE_JSON}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="text-xs font-mono text-dim bg-surface border border-border rounded px-3 py-2">
            ⚠ {error}
          </div>
        )}

        {csharp && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CodeBlock code={csharp} language="C#" label="Model.cs" />
            <CodeBlock code={typescript} language="TypeScript" label="model.ts" />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
