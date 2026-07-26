import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import { jsonToCSharp, jsonToTypeScript, jsonToPythonPydantic, jsonToGo, jsonToRust } from '../../../utils/modelGenerator'
import { getErrorMessage } from '../../../utils/errors'

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
  const [python, setPython] = useState('')
  const [go, setGo] = useState('')
  const [rust, setRust] = useState('')
  const [error, setError] = useState('')

  const generate = () => {
    setError('')
    const targetJson = input || SAMPLE_JSON
    const targetName = className || 'MyModel'
    try {
      setCsharp(jsonToCSharp(targetJson, targetName))
      setTypescript(jsonToTypeScript(targetJson, targetName))
      setPython(jsonToPythonPydantic(targetJson, targetName))
      setGo(jsonToGo(targetJson, targetName))
      setRust(jsonToRust(targetJson, targetName))
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to generate model'))
    }
  }

  const clear = () => {
    setInput('')
    setCsharp('')
    setTypescript('')
    setPython('')
    setGo('')
    setRust('')
    setError('')
    setClassName('MyModel')
  }

  return (
    <ToolLayout
      title="JSON → Model Generator"
      description="Convert JSON into strongly-typed models across TypeScript, C#, Python (Pydantic), Go, and Rust"
      tag="codegen"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-dim font-mono mb-1.5">Model / Struct Name</label>
            <input
              value={className}
              onChange={e => setClassName(e.target.value)}
              className="input-base"
              placeholder="MyModel"
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={generate} className="btn-primary">Generate All Models</button>
            <button onClick={clear} className="btn-ghost">Clear</button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5 flex justify-between items-center">
            <span>JSON Input</span>
            <button
              onClick={() => setInput(SAMPLE_JSON)}
              className="text-subtle hover:text-dim transition-colors"
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

        <ErrorBanner message={error} />

        {typescript && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CodeBlock code={typescript} language="TypeScript" label="TypeScript interface" maxHeight='260px' minHeight='220px' />
              <CodeBlock code={csharp} language="C#" label="C# class" maxHeight='260px' minHeight='220px' />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <CodeBlock code={python} language="Python" label="Python (Pydantic)" maxHeight='260px' minHeight='220px' />
              <CodeBlock code={go} language="Go" label="Go struct" maxHeight='260px' minHeight='220px' />
              <CodeBlock code={rust} language="Rust" label="Rust (serde struct)" maxHeight='260px' minHeight='220px' />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
