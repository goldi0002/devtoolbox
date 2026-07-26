import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import OutputPanel from '../../ui/OutputPanel'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import CopyButton from '../../CopyButton'

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
  'CROSS JOIN', 'FULL JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'PRIMARY KEY', 'FOREIGN KEY',
  'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'BETWEEN',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'WITH', 'RECURSIVE'
]

function formatSql(sql: string, uppercaseKeywords: boolean, indentSize: number): string {
  if (!sql.trim()) return ''

  let tokens = sql
    .replace(/\s+/g, ' ')
    .trim()

  // Standardize keyword casing if requested
  if (uppercaseKeywords) {
    SQL_KEYWORDS.forEach(kw => {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi')
      tokens = tokens.replace(reg, kw)
    })
  }

  // Major clause line breaks
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'VALUES',
    'SET', 'WITH'
  ]

  let formatted = tokens
  majorClauses.forEach(clause => {
    const reg = new RegExp(`\\b(${clause})\\b`, 'g')
    formatted = formatted.replace(reg, '\n$1')
  })

  // Split lines and apply indentation
  const indentStr = ' '.repeat(indentSize)
  const lines = formatted.split('\n').filter(l => l.trim().length > 0)

  let level = 0
  const resultLines: string[] = []

  lines.forEach(line => {
    const trimmed = line.trim()

    // Handle comma list breaks after SELECT
    if (trimmed.startsWith('SELECT ')) {
      const selectPart = trimmed.slice(7)
      const fields = selectPart.split(/,(?![^()]*\))/).map(f => f.trim())
      if (fields.length > 1) {
        resultLines.push('SELECT')
        fields.forEach((f, idx) => {
          const comma = idx < fields.length - 1 ? ',' : ''
          resultLines.push(`${indentStr}${f}${comma}`)
        })
        return
      }
    }

    if (trimmed.includes(')')) {
      level = Math.max(0, level - (trimmed.split(')').length - 1))
    }

    const currentIndent = indentStr.repeat(level)
    resultLines.push(currentIndent + trimmed)

    if (trimmed.includes('(')) {
      level += (trimmed.split('(').length - 1)
    }
  })

  return resultLines.join('\n')
}

function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '') // remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .replace(/\s+/g, ' ')
    .trim()
}

const SAMPLE_SQLS = [
  {
    name: 'User Analytics Query',
    sql: `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.total_amount) as lifetime_value from users u left join orders o on u.id = o.user_id where u.created_at >= '2025-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 2 order by lifetime_value desc limit 50;`
  },
  {
    name: 'Table Creation',
    sql: `create table products (id uuid primary key default gen_random_uuid(), title varchar(255) not null, price numeric(10,2) not null check (price >= 0), stock_quantity integer default 0, created_at timestamp with time zone default now());`
  }
]

export default function SqlFormatter() {
  const [inputSql, setInputSql] = useState<string>(SAMPLE_SQLS[0].sql)
  const [uppercase, setUppercase] = useState<boolean>(true)
  const [indentSize, setIndentSize] = useState<number>(2)

  const formatted = useMemo(() => {
    return formatSql(inputSql, uppercase, indentSize)
  }, [inputSql, uppercase, indentSize])

  const minified = useMemo(() => {
    return minifySql(inputSql)
  }, [inputSql])

  return (
    <ToolLayout
      title="SQL Formatter & Prettifier"
      description="Format, indent, validate, and minify SQL queries instantly in your browser."
      tag="sql"
    >
      <div className="space-y-6">
        {/* Sample Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-subtle">Sample SQL:</span>
            {SAMPLE_SQLS.map(sample => (
              <button
                key={sample.name}
                type="button"
                onClick={() => setInputSql(sample.sql)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-surface hover:bg-surface/80 border border-border text-dim hover:text-bright transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-dim">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="rounded border-border text-indigo-500 focus:ring-indigo-500/20"
              />
              <span>UPPERCASE Keywords</span>
            </label>

            <div className="flex items-center gap-1">
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
        </div>

        {/* Code Input */}
        <div>
          <CodeInput
            value={inputSql}
            onChange={setInputSql}
            placeholder="Paste raw SQL query here..."
            language="sql"
            label="Raw SQL Input"
            rows={5}
          />
        </div>

        {/* Output Panel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-subtle">Prettified SQL Output</span>
            <CopyButton text={formatted} />
          </div>
          <OutputPanel value={formatted} language="sql" />
        </div>

        {/* Minified Preview */}
        <div className="p-4 bg-surface/60 border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-400 font-medium">Minified Single-Line SQL</span>
            <CopyButton text={minified} />
          </div>
          <p className="font-mono text-xs text-dim break-all bg-bg p-3 rounded-lg border border-border/80">
            {minified || '// Minified SQL will appear here'}
          </p>
        </div>

        {/* Stats */}
        <QuickAnswerCard
          title="SQL Query Metrics"
          items={[
            { label: 'Raw Character Length', value: inputSql.length.toString() },
            { label: 'Formatted Lines', value: formatted.split('\n').length.toString() },
            { label: 'Minified Length', value: minified.length.toString() },
            { label: 'Space Savings (Minified)', value: inputSql.length ? `${Math.max(0, Math.round((1 - minified.length / inputSql.length) * 100))}%` : '0%' },
          ]}
        />
      </div>
    </ToolLayout>
  )
}
