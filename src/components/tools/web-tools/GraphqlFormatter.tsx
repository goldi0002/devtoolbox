import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import OutputPanel from '../../ui/OutputPanel'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import CopyButton from '../../CopyButton'

function formatGraphQL(query: string, indentSize: number): { formatted: string; isValid: boolean; error?: string } {
  if (!query.trim()) return { formatted: '', isValid: true }

  let openBraces = 0
  let openParens = 0
  for (let i = 0; i < query.length; i++) {
    if (query[i] === '{') openBraces++
    if (query[i] === '}') openBraces--
    if (query[i] === '(') openParens++
    if (query[i] === ')') openParens--
  }

  if (openBraces !== 0 || openParens !== 0) {
    return {
      formatted: query,
      isValid: false,
      error: `Syntax error: Unbalanced braces/parentheses (${openBraces !== 0 ? 'Braces' : 'Parentheses'})`
    }
  }

  // Pre-clean spaces
  const indent = ' '.repeat(indentSize)
  let cleaned = query
    .replace(/#.*$/gm, '') // Strip comments for formatting tokenization
    .replace(/\s+/g, ' ')
    .trim()

  // Add linebreaks around braces and commas
  cleaned = cleaned
    .replace(/\s*{\s*/g, ' {\n')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/,\s*/g, ',\n')

  const lines = cleaned.split('\n')
  let currentLevel = 0
  const resultLines: string[] = []

  lines.forEach(rawLine => {
    const line = rawLine.trim()
    if (!line) return

    if (line.startsWith('}')) {
      currentLevel = Math.max(0, currentLevel - 1)
    }

    resultLines.push(indent.repeat(currentLevel) + line)

    if (line.endsWith('{')) {
      currentLevel++
    }
  })

  return {
    formatted: resultLines.join('\n'),
    isValid: true
  }
}

function minifyGraphQL(query: string): string {
  return query
    .replace(/#.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}():,])\s*/g, '$1')
    .trim()
}

const SAMPLE_GRAPHQL = [
  {
    name: 'User Profile & Repositories',
    query: `query GetUserProfile($username: String!, $first: Int = 10) { user(login: $username) { id name email avatarUrl repositories(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { id name description stargazerCount primaryLanguage { name color } } pageInfo { hasNextPage endCursor } } } }`
  },
  {
    name: 'Mutation Request',
    query: `mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { post { id title content author { id name } createdAt } errors { field message } } }`
  }
]

export default function GraphqlFormatter() {
  const [inputQuery, setInputQuery] = useState<string>(SAMPLE_GRAPHQL[0].query)
  const [indentSize, setIndentSize] = useState<number>(2)

  const { formatted, isValid, error } = useMemo(() => {
    return formatGraphQL(inputQuery, indentSize)
  }, [inputQuery, indentSize])

  const minified = useMemo(() => {
    return minifyGraphQL(inputQuery)
  }, [inputQuery])

  return (
    <ToolLayout
      title="GraphQL Query Formatter & Prettifier"
      description="Format, prettify, validate, and minify GraphQL queries and mutations online with custom indenting."
      tag="graphql"
    >
      <div className="space-y-6">
        {/* Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-subtle">Sample Queries:</span>
            {SAMPLE_GRAPHQL.map(sample => (
              <button
                key={sample.name}
                type="button"
                onClick={() => setInputQuery(sample.query)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-surface hover:bg-surface/80 border border-border text-dim hover:text-bright transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-dim">
            <span className="text-subtle">Indent:</span>
            <select
              value={indentSize}
              onChange={e => setIndentSize(Number(e.target.value))}
              className="bg-surface border border-border text-bright rounded px-2 py-0.5 text-xs outline-none focus:border-indigo-500"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>
          </div>
        </div>

        {/* Input */}
        <div>
          <CodeInput
            value={inputQuery}
            onChange={setInputQuery}
            placeholder="Paste GraphQL query, mutation, or schema here..."
            language="json"
            label="Raw GraphQL Query Input"
            rows={5}
          />
        </div>

        {/* Validation Error Banner */}
        {!isValid && error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Output */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-subtle">Prettified GraphQL Query</span>
            <CopyButton text={formatted} />
          </div>
          <OutputPanel value={formatted} language="json" />
        </div>

        {/* Minified Preview */}
        <div className="p-4 bg-surface/60 border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-400 font-medium">Minified Query (For HTTP Requests)</span>
            <CopyButton text={minified} />
          </div>
          <p className="font-mono text-xs text-dim break-all bg-bg p-3 rounded-lg border border-border/80">
            {minified || '// Minified GraphQL query will appear here'}
          </p>
        </div>

        {/* Metrics */}
        <QuickAnswerCard
          title="GraphQL Query Metrics"
          items={[
            { label: 'Raw Character Length', value: inputQuery.length.toString() },
            { label: 'Formatted Lines', value: formatted.split('\n').length.toString() },
            { label: 'Minified Size', value: `${minified.length} chars` },
            { label: 'Syntax Valid', value: isValid ? 'Yes (Balanced)' : 'No (Unbalanced)' },
          ]}
        />
      </div>
    </ToolLayout>
  )
}
