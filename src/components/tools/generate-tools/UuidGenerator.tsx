import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

export default function UuidGenerator() {
  const [single, setSingle] = useState('')
  const [count, setCount] = useState(5)
  const [batch, setBatch] = useState<string[]>([])

  const generateSingle = async () => {
    const { v4: uuidv4 } = await import('uuid')
    setSingle(uuidv4())
  }

  const generateBatch = async () => {
    const { v4: uuidv4 } = await import('uuid')
    const uuids = Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => uuidv4())
    setBatch(uuids)
  }

  const clear = () => {
    setSingle('')
    setBatch([])
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate RFC 4122 v4 UUIDs in the browser"
      tag="generate"
    >
      <div className="space-y-5">
        {/* Single */}
        <div>
          <label className="block text-xs text-dim font-mono mb-2">Single UUID</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#f8f8f8] border border-border rounded px-3 py-2 font-mono text-sm text-light min-h-[38px] flex items-center">
              {single || <span className="text-subtle">Click generate...</span>}
            </div>
            <button onClick={generateSingle} className="btn-primary whitespace-nowrap">Generate</button>
            {single && <CopyButton text={single} size="md" />}
          </div>
        </div>

        {/* Batch */}
        <div>
          <label className="block text-xs text-dim font-mono mb-2">Batch Generator</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="input-base w-24"
            />
            <button onClick={generateBatch} className="btn-primary">Generate {count}</button>
            <button onClick={clear} className="btn-ghost">Clear</button>
          </div>

          {batch.length > 0 && (
            <div className="border border-border rounded overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#f8f8f8] border-b border-border">
                <span className="text-xs text-subtle font-mono">{batch.length} UUIDs</span>
                <CopyButton text={batch.join('\n')} />
              </div>
              <div className="max-h-60 overflow-y-auto bg-[#f8f8f8]">
                {batch.map((uuid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-1.5 border-b border-[#f0f0f0] hover:bg-surface group"
                  >
                    <span className="font-mono text-xs text-light">{uuid}</span>
                    <CopyButton text={uuid} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
