import { useState } from 'react'
import CodeInput from '../../CodeInput'
import CodeBlock from '../../CodeBlock'
import { jsonToZod } from '../../../utils/jsonToZod'
import SectionPanel from '../../ui/SectionPanel'
import ErrorBanner from '../../ui/ErrorBanner'

const SAMPLE_JSON = `{
  "id": 101,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin",
  "isActive": true,
  "scores": [98, 85, 92],
  "profile": {
    "avatar": "https://example.com/avatar.png",
    "verified": true,
    "loginCount": 42
  }
}`

export default function JsonToZod() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON)
  const [schemaName, setSchemaName] = useState('userSchema')
  const [error, setError] = useState<string | null>(null)

  let generatedCode = ''
  try {
    if (jsonInput.trim()) {
      generatedCode = jsonToZod(jsonInput, schemaName || 'schema')
      if (error) setError(null)
    }
  } catch (err) {
    if (!error || error !== (err as Error).message) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <SectionPanel label="JSON to Zod Schema Generator">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs font-mono text-dim">
            <span>Schema Name:</span>
            <input
              type="text"
              value={schemaName}
              onChange={e => setSchemaName(e.target.value.replace(/[^a-zA-Z0-9_$]/g, ''))}
              placeholder="userSchema"
              className="bg-surface border border-border rounded px-2 py-1 text-xs text-bright outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-dim">JSON Input</label>
            <CodeInput
              value={jsonInput}
              onChange={val => {
                setJsonInput(val)
                setError(null)
              }}
              language="json"
              placeholder="Paste JSON here..."
              sampleValue={SAMPLE_JSON}
              sampleLabel="Load Sample JSON"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono text-dim">Generated Zod Schema (TypeScript)</label>
            {error ? (
              <ErrorBanner message={error} />
            ) : (
              <CodeBlock
                code={generatedCode}
                language="typescript"
                label="zodSchema.ts"
              />
            )}
          </div>
        </div>
      </SectionPanel>
    </div>
  )
}
