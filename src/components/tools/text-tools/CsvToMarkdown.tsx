import { useState } from 'react'
import Papa from 'papaparse'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'

const SAMPLE = `name,age,city
Alice,28,New York
Bob,34,San Francisco
Charlie,22,London`

export default function CsvToMarkdown() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [hasHeaders, setHasHeaders] = useState(true)

  const process = () => {
    setError('')
    const src = input || SAMPLE
    if (!src.trim()) return

    try {
      const parsed = Papa.parse(src.trim())
      if (parsed.errors.length > 0 && parsed.errors[0].type !== 'Delimiter') {
        throw new Error(parsed.errors[0].message)
      }

      const rows = parsed.data as string[][]
      if (rows.length === 0) {
        setOutput('')
        return
      }

      let markdown = ''
      
      const numCols = rows[0].length

      if (hasHeaders) {
        markdown += '| ' + rows[0].join(' | ') + ' |\n'
        markdown += '| ' + Array(numCols).fill('---').join(' | ') + ' |\n'
        for (let i = 1; i < rows.length; i++) {
          markdown += '| ' + rows[i].join(' | ') + ' |\n'
        }
      } else {
        markdown += '| ' + Array(numCols).fill('').join(' | ') + ' |\n'
        markdown += '| ' + Array(numCols).fill('---').join(' | ') + ' |\n'
        for (let i = 0; i < rows.length; i++) {
          markdown += '| ' + rows[i].join(' | ') + ' |\n'
        }
      }

      setOutput(markdown.trim())
    } catch (e: any) {
      setError(e.message || 'Failed to process CSV')
      setOutput('')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout
      title="CSV to Markdown"
      description="Convert CSV or TSV data into a Markdown table format"
      tag="text"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={process} className="btn-primary">Convert</button>
          <button onClick={clear} className="btn-ghost">Clear</button>

          <label className="flex items-center gap-2 ml-4 text-xs font-mono text-subtle cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
              className="rounded border-border"
            />
            First row is header
          </label>

          <button
            onClick={() => { setInput(SAMPLE); setTimeout(process, 100); }}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-auto"
          >
            ← example
          </button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">CSV / TSV Input</label>
          <CodeBlock
            code={input}
            language="text"
            label="input.csv"
            maxHeight="300px"
            minHeight="300px"
            isForInput={true}
            readOnly={false}
            onChange={value => setInput(value)}
          />
        </div>

        <ErrorBanner message={error} />

        {output && (
          <CodeBlock
            code={output}
            language="markdown"
            label="output.md"
            maxHeight="300px"
            minHeight="300px"
          />
        )}
      </div>
    </ToolLayout>
  )
}
