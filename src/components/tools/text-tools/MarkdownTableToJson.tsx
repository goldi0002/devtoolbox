import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import { parseMarkdownTable } from '../../../utils/markdownTableParser'

const SAMPLE_MARKDOWN_TABLE = String.raw`| Name | Role | Active | Score | Notes |
| :--- | :--- | :---: | ---: | --- |
| Ada Lovelace | Engineer | true | 98.5 | First \| second |
| Grace Hopper | Admiral | false | 0 | null value: null |`

export default function MarkdownTableToJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = (markdown = input) => {
    setError('')

    try {
      setOutput(JSON.stringify(parseMarkdownTable(markdown), null, 2))
    } catch (conversionError) {
      setOutput('')
      setError(conversionError instanceof Error ? conversionError.message : 'Failed to convert Markdown table')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout
      title="Markdown Table to JSON"
      description="Convert GitHub-flavored Markdown tables into JSON objects using the header row as keys"
      tag="text"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => convert()} className="btn-primary">Convert</button>
          <button type="button" onClick={clear} className="btn-ghost">Clear</button>
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE_MARKDOWN_TABLE)
              convert(SAMPLE_MARKDOWN_TABLE)
            }}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono sm:ml-auto"
          >
            Load Sample Markdown Table
          </button>
        </div>

        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">Markdown table</label>
          <CodeBlock
            code={input}
            language="markdown"
            label="table.md"
            maxHeight="300px"
            minHeight="300px"
            isForInput
            readOnly={false}
            onChange={setInput}
          />
        </div>

        <ErrorBanner message={error} />

        {output && (
          <CodeBlock
            code={output}
            language="json"
            label="output.json"
            maxHeight="360px"
            minHeight="240px"
          />
        )}
      </div>
    </ToolLayout>
  )
}