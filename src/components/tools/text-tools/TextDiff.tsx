import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import TextAreaField from '../../ui/TextAreaField'

const SAMPLE_A = `function greet(name) {
  console.log("Hello, " + name);
  return name;
}`

const SAMPLE_B = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { name, greeting };
}`

export default function TextDiff() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [diffResult, setDiffResult] = useState<Diff.Change[] | null>(null)

  const compare = async () => {
    const { diffLines } = await import('diff')
    const a = textA || SAMPLE_A
    const b = textB || SAMPLE_B
    const result = diffLines(a, b, { ignoreWhitespace: false })
    setDiffResult(result)
  }

  const clear = () => {
    setTextA('')
    setTextB('')
    setDiffResult(null)
  }

  const loadExample = () => {
    setTextA(SAMPLE_A)
    setTextB(SAMPLE_B)
    setDiffResult(null)
  }

  const addedLines = diffResult?.filter(d => d.added).reduce((a, d) => a + (d.count || 0), 0) ?? 0
  const removedLines = diffResult?.filter(d => d.removed).reduce((a, d) => a + (d.count || 0), 0) ?? 0

  return (
    <ToolLayout
      title="Text Diff Checker"
      description="Compare two text inputs and highlight changes"
      tag="diff"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={compare} className="btn-primary">Compare</button>
          <button onClick={clear} className="btn-ghost">Clear</button>
          <button
            onClick={loadExample}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-auto"
          >
            ← load example
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField label="Original (A)" value={textA} onChange={setTextA} placeholder={SAMPLE_A} />
          <TextAreaField label="Modified (B)" value={textB} onChange={setTextB} placeholder={SAMPLE_B} />
        </div>

        {diffResult && (
          <div className="border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-[#f8f8f8] border-b border-border">
              <div className="flex gap-4">
                <span className="text-xs font-mono text-dim">
                  <span className="text-light">+{addedLines}</span> added
                </span>
                <span className="text-xs font-mono text-dim">
                  <span className="text-subtle">−{removedLines}</span> removed
                </span>
              </div>
              <span className="text-xs text-subtle font-mono">diff output</span>
            </div>
            <div className="max-h-80 overflow-auto bg-[#f8f8f8]">
              <pre className="p-4 text-xs font-mono leading-relaxed">
                {diffResult.map((part, i) => {
                  const lines = part.value.split('\n').filter((_, idx, arr) => idx < arr.length - 1 || part.value.endsWith('\n') ? true : idx < arr.length - 1)
                  return lines.map((line, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`px-2 rounded-sm ${
                        part.added
                          ? 'bg-black/[0.05] text-light'
                          : part.removed
                          ? 'bg-black/[0.02] text-subtle line-through'
                          : 'text-dim'
                      }`}
                    >
                      <span className="select-none mr-3 text-[10px] opacity-50">
                        {part.added ? '+' : part.removed ? '−' : ' '}
                      </span>
                      {line || ' '}
                    </div>
                  ))
                })}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
