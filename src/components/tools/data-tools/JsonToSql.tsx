import { useState, useMemo, useEffect, useCallback } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import CodeBlock from '../../CodeBlock'
import ErrorBanner from '../../ui/ErrorBanner'
import { tools } from '../../../tools/registry'
import { Database, FileCode, Play, Sparkles, Settings2, Table } from 'lucide-react'

type SqlDialect = 'postgres' | 'mysql' | 'sqlite' | 'sqlserver' | 'oracle'

interface ColumnDef {
  name: string
  inferredType: string
  isNullable: boolean
}

const SAMPLE_JSON = `[
  {
    "id": 101,
    "username": "alex_dev",
    "email": "alex@example.com",
    "is_active": true,
    "score": 98.5,
    "profile": { "bio": "Staff Engineer", "tags": ["react", "typescript"] },
    "created_at": "2026-08-18T10:30:00Z"
  },
  {
    "id": 102,
    "username": "sarah_k",
    "email": "sarah@example.com",
    "is_active": false,
    "score": 84.0,
    "profile": { "bio": "Security Researcher", "tags": ["crypto", "auth"] },
    "created_at": "2026-08-18T11:15:00Z"
  }
]`

// Infer SQL data type for a given value based on dialect
function inferSqlType(val: unknown, dialect: SqlDialect): string {
  if (val === null || val === undefined) {
    return dialect === 'postgres' ? 'TEXT' : dialect === 'mysql' ? 'VARCHAR(255)' : 'TEXT'
  }
  if (typeof val === 'boolean') {
    if (dialect === 'postgres' || dialect === 'sqlite') return 'BOOLEAN'
    if (dialect === 'mysql') return 'TINYINT(1)'
    if (dialect === 'sqlserver') return 'BIT'
    if (dialect === 'oracle') return 'NUMBER(1)'
    return 'BOOLEAN'
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return dialect === 'oracle' ? 'NUMBER(10)' : 'INTEGER'
    }
    if (dialect === 'postgres') return 'DOUBLE PRECISION'
    if (dialect === 'mysql') return 'DOUBLE'
    if (dialect === 'sqlite') return 'REAL'
    if (dialect === 'sqlserver') return 'FLOAT'
    if (dialect === 'oracle') return 'NUMBER(12, 4)'
    return 'NUMERIC(10, 2)'
  }
  if (typeof val === 'object') {
    if (dialect === 'postgres') return 'JSONB'
    if (dialect === 'mysql') return 'JSON'
    if (dialect === 'sqlite') return 'TEXT'
    if (dialect === 'sqlserver') return 'NVARCHAR(MAX)'
    if (dialect === 'oracle') return 'CLOB'
    return 'JSON'
  }
  if (typeof val === 'string') {
    // Check if ISO Date string
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      if (dialect === 'postgres') return 'TIMESTAMPTZ'
      if (dialect === 'mysql') return 'DATETIME'
      if (dialect === 'sqlite') return 'TEXT'
      if (dialect === 'sqlserver') return 'DATETIME2'
      if (dialect === 'oracle') return 'TIMESTAMP'
      return 'TIMESTAMP'
    }
    if (val.length > 255) {
      if (dialect === 'postgres' || dialect === 'sqlite') return 'TEXT'
      if (dialect === 'mysql') return 'LONGTEXT'
      if (dialect === 'sqlserver') return 'NVARCHAR(MAX)'
      if (dialect === 'oracle') return 'CLOB'
      return 'TEXT'
    }
    if (dialect === 'oracle') return 'VARCHAR2(255)'
    if (dialect === 'sqlserver') return 'NVARCHAR(255)'
    return 'VARCHAR(255)'
  }
  return 'TEXT'
}

// Escape SQL string value safely
function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''")
    return `'${jsonStr}'`
  }
  const str = String(val).replace(/'/g, "''")
  return `'${str}'`
}

// Format column name with proper quotation per dialect
function formatIdentifier(name: string, dialect: SqlDialect): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
  if (dialect === 'postgres' || dialect === 'oracle') return `"${sanitized}"`
  if (dialect === 'mysql') return `\`${sanitized}\``
  if (dialect === 'sqlserver') return `[${sanitized}]`
  return `"${sanitized}"`
}

export default function JsonToSql() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON)
  const [tableName, setTableName] = useState('users')
  const [dialect, setDialect] = useState<SqlDialect>('postgres')
  const [includeDropTable, setIncludeDropTable] = useState(true)
  const [includeTransaction, setIncludeTransaction] = useState(true)
  const [batchInsert, setBatchInsert] = useState(true)
  const [generatedSql, setGeneratedSql] = useState('')
  const [error, setError] = useState('')

  const meta = tools.find(t => t.slug === 'json-to-sql')

  const handleGenerate = useCallback(() => {
    setError('')
    if (!jsonInput.trim()) {
      setGeneratedSql('')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const records = Array.isArray(parsed) ? parsed : [parsed]
      if (records.length === 0 || typeof records[0] !== 'object' || records[0] === null) {
        throw new Error('Input JSON must be an array of objects or a single JSON object.')
      }

      // Collect all unique keys across all records to build schema
      const columnsMap = new Map<string, ColumnDef>()
      for (const rec of records) {
        if (typeof rec === 'object' && rec !== null) {
          for (const [key, val] of Object.entries(rec)) {
            if (!columnsMap.has(key)) {
              columnsMap.set(key, {
                name: key,
                inferredType: inferSqlType(val, dialect),
                isNullable: val === null,
              })
            } else if (val !== null) {
              // Update type if previous was null
              const existing = columnsMap.get(key)!
              if (existing.inferredType === 'TEXT' || existing.isNullable) {
                existing.inferredType = inferSqlType(val, dialect)
                existing.isNullable = existing.isNullable || (val === null)
              }
            }
          }
        }
      }

      const columns = Array.from(columnsMap.values())
      const escapedTable = formatIdentifier(tableName || 'records', dialect)

      const sqlLines: string[] = []

      if (includeTransaction) {
        if (dialect === 'postgres' || dialect === 'sqlite') {
          sqlLines.push('BEGIN;')
        } else if (dialect === 'sqlserver') {
          sqlLines.push('BEGIN TRANSACTION;')
        } else {
          sqlLines.push('START TRANSACTION;')
        }
        sqlLines.push('')
      }

      if (includeDropTable) {
        sqlLines.push(`DROP TABLE IF EXISTS ${escapedTable};`)
      }

      // Generate CREATE TABLE
      sqlLines.push(`CREATE TABLE ${escapedTable} (`)
      const colDefs = columns.map(c => {
        const colIdent = formatIdentifier(c.name, dialect)
        return `    ${colIdent} ${c.inferredType}${c.name.toLowerCase() === 'id' ? ' PRIMARY KEY' : ''}`
      })
      sqlLines.push(colDefs.join(',\n'))
      sqlLines.push(');')
      sqlLines.push('')

      // Generate INSERT statements
      const colNamesList = columns.map(c => formatIdentifier(c.name, dialect)).join(', ')

      if (batchInsert && dialect !== 'oracle') {
        const valueRows = records.map(rec => {
          const vals = columns.map(c => escapeSqlValue((rec as Record<string, unknown>)[c.name]))
          return `    (${vals.join(', ')})`
        })
        sqlLines.push(`INSERT INTO ${escapedTable} (${colNamesList}) VALUES`)
        sqlLines.push(valueRows.join(',\n') + ';')
      } else {
        for (const rec of records) {
          const vals = columns.map(c => escapeSqlValue((rec as Record<string, unknown>)[c.name])).join(', ')
          sqlLines.push(`INSERT INTO ${escapedTable} (${colNamesList}) VALUES (${vals});`)
        }
      }

      if (includeTransaction) {
        sqlLines.push('')
        sqlLines.push('COMMIT;')
      }

      setGeneratedSql(sqlLines.join('\n'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse JSON and generate SQL')
      setGeneratedSql('')
    }
  }, [jsonInput, tableName, dialect, includeDropTable, includeTransaction, batchInsert])

  useEffect(() => {
    handleGenerate()
  }, [handleGenerate])

  return (
    <ToolLayout
      title={meta?.name || 'JSON to SQL Schema & Query Generator'}
      description={meta?.description || 'Convert JSON objects and arrays into SQL CREATE TABLE and INSERT statements with automatic column type inference.'}
      tag="SQL"
    >
      <div className="space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Table Name */}
            <div>
              <label className="block text-[11px] font-mono text-dim mb-1 font-medium">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
                className="px-3 py-1.5 text-xs font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent w-36"
              />
            </div>

            {/* Dialect Selector */}
            <div>
              <label className="block text-[11px] font-mono text-dim mb-1 font-medium">SQL Dialect</label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value as SqlDialect)}
                className="px-3 py-1.5 text-xs font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL / MariaDB</option>
                <option value="sqlite">SQLite</option>
                <option value="sqlserver">Microsoft SQL Server</option>
                <option value="oracle">Oracle</option>
              </select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-dim">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-bright">
              <input
                type="checkbox"
                checked={includeDropTable}
                onChange={(e) => setIncludeDropTable(e.target.checked)}
                className="rounded border-border bg-bg text-accent focus:ring-0"
              />
              <span>DROP TABLE</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-bright">
              <input
                type="checkbox"
                checked={includeTransaction}
                onChange={(e) => setIncludeTransaction(e.target.checked)}
                className="rounded border-border bg-bg text-accent focus:ring-0"
              />
              <span>Transactions (BEGIN/COMMIT)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-bright">
              <input
                type="checkbox"
                checked={batchInsert}
                onChange={(e) => setBatchInsert(e.target.checked)}
                className="rounded border-border bg-bg text-accent focus:ring-0"
              />
              <span>Batch Inserts</span>
            </label>
          </div>
        </div>

        {/* Input JSON */}
        <CodeInput
          value={jsonInput}
          onChange={setJsonInput}
          language="json"
          label="JSON Records Input"
          placeholder="Paste JSON array or object here..."
          minHeight="220px"
          sampleValue={SAMPLE_JSON}
          sampleLabel="Load Sample Users"
        />

        {error && <ErrorBanner message={error} />}

        {/* Output SQL */}
        {generatedSql && !error && (
          <CodeBlock
            code={generatedSql}
            language="sql"
            label={`${tableName || 'schema'}.${dialect}.sql`}
            status="ready"
            minHeight="280px"
            maxHeight="520px"
          />
        )}
      </div>
    </ToolLayout>
  )
}
