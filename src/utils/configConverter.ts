import YAML from 'yaml'
import type { SyntaxErrorInfo } from './minifyStats'

/** The three document formats the converter reads and writes. */
export type ConfigFormat = 'toml' | 'json' | 'yaml'

/** Where a problem was found, when the parser can tell. Same shape as minifier errors. */
export type ConversionError = SyntaxErrorInfo

export type ConversionOutcome = { ok: true; text: string } | { ok: false; error: ConversionError }

export const CONFIG_FORMATS: ReadonlyArray<{ value: ConfigFormat; label: string }> = [
  { value: 'toml', label: 'TOML' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
]

export const CONFIG_FORMAT_EXTENSION: Record<ConfigFormat, string> = {
  toml: 'toml',
  json: 'json',
  yaml: 'yaml',
}

export const CONFIG_FORMAT_MIME: Record<ConfigFormat, string> = {
  toml: 'application/toml',
  json: 'application/json',
  yaml: 'application/yaml',
}

/** One document per format that says the same thing, so any pair converts cleanly. */
export const CONFIG_SAMPLES: Record<ConfigFormat, string> = {
  toml: `title = "Inventory service"
owner = "platform-team"
created = 2026-03-14T09:30:00Z

[server]
host = "0.0.0.0"
port = 8080
tags = ["api", "internal"]

[database]
engine = "postgres"
max_connections = 20

[[endpoints]]
path = "/health"
method = "GET"

[[endpoints]]
path = "/items"
method = "POST"
`,
  json: `{
  "title": "Inventory service",
  "owner": "platform-team",
  "created": "2026-03-14T09:30:00.000Z",
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "tags": ["api", "internal"]
  },
  "database": {
    "engine": "postgres",
    "max_connections": 20
  },
  "endpoints": [
    { "path": "/health", "method": "GET" },
    { "path": "/items", "method": "POST" }
  ]
}
`,
  yaml: `title: Inventory service
owner: platform-team
created: "2026-03-14T09:30:00.000Z"
server:
  host: 0.0.0.0
  port: 8080
  tags:
    - api
    - internal
database:
  engine: postgres
  max_connections: 20
endpoints:
  - path: /health
    method: GET
  - path: /items
    method: POST
`,
}

type ParseResult = { ok: true; value: unknown } | { ok: false; error: ConversionError }
type Cleaned = { ok: true; value: unknown } | { ok: false; error: ConversionError }

/**
 * Converts a document from one format to another. Everything runs in memory.
 * smol-toml is imported on first use, so it is fetched as its own chunk.
 */
export async function convertConfig(
  source: string,
  from: ConfigFormat,
  to: ConfigFormat,
  options: { indent?: number } = {},
): Promise<ConversionOutcome> {
  const indent = options.indent ?? 2
  try {
    const parsed = await parseSource(source, from)
    if (!parsed.ok) return { ok: false, error: parsed.error }

    const prepared = prepareForFormat(parsed.value, to)
    if (!prepared.ok) return { ok: false, error: prepared.error }

    return { ok: true, text: await serialize(prepared.value, to, indent) }
  } catch (err) {
    return { ok: false, error: { message: `Could not convert: ${errorText(err)}` } }
  }
}

/** A short, readable line for a conversion problem, with its position when known. */
export function describeConversionError(error: ConversionError): string {
  if (error.line === undefined) return error.message
  const column = error.column === undefined ? '' : `, column ${error.column}`
  return `Syntax error at line ${error.line}${column}: ${error.message}`
}

/** Turns a character offset into a 1-based line and column. */
export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, text.length))
  let line = 1
  let lineStart = 0
  for (let i = 0; i < clamped; i++) {
    if (text[i] === '\n') {
      line++
      lineStart = i + 1
    }
  }
  return { line, column: clamped - lineStart + 1 }
}

/** Reads the position out of a JSON.parse error, which differs between browsers. */
export function jsonErrorPosition(
  rawMessage: string,
  source: string,
): { line: number; column?: number } | undefined {
  const lineColumn = rawMessage.match(/line (\d+) column (\d+)/)
  if (lineColumn) return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) }

  const offset = rawMessage.match(/position (\d+)/)
  if (offset) return offsetToLineColumn(source, Number(offset[1]))

  if (/end of JSON input/i.test(rawMessage)) return offsetToLineColumn(source, source.length)

  return undefined
}

async function parseSource(source: string, format: ConfigFormat): Promise<ParseResult> {
  if (format === 'toml') return parseToml(source)
  if (format === 'json') return parseJson(source)
  return parseYaml(source)
}

async function parseToml(source: string): Promise<ParseResult> {
  const { parse } = await import('smol-toml')
  try {
    return { ok: true, value: parse(source) }
  } catch (err) {
    const { message, line, column } = err as { message?: unknown; line?: unknown; column?: unknown }
    const headline = firstLine(message).replace(/^Invalid TOML document:\s*/, '')
    return { ok: false, error: withPosition(headline || 'Invalid TOML', line, column) }
  }
}

function parseJson(source: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(source) }
  } catch (err) {
    const raw = errorText(err)
    const message = raw
      .replace(/^JSON\.parse:\s*/, '')
      .replace(/ in JSON.*$/, '')
      .replace(/ at line \d+ column \d+.*$/, '')
      .trim()
    const position = jsonErrorPosition(raw, source)
    const error: ConversionError = { message: message || 'Invalid JSON' }
    if (position) {
      error.line = position.line
      if (position.column !== undefined) error.column = position.column
    }
    return { ok: false, error }
  }
}

function parseYaml(source: string): ParseResult {
  try {
    return { ok: true, value: YAML.parse(source) }
  } catch (err) {
    // yaml puts the position in the message and in linePos; keep the message short and use linePos.
    const message = firstLine(errorText(err)).replace(/\s*at line \d+, column \d+:?$/, '').trim()
    const start = (err as { linePos?: Array<{ line: number; col: number }> }).linePos?.[0]
    return { ok: false, error: withPosition(message || 'Invalid YAML', start?.line, start?.col) }
  }
}

function prepareForFormat(value: unknown, target: ConfigFormat): Cleaned {
  if (target === 'toml' && !isTable(value)) {
    return { ok: false, error: { message: tomlRootMessage(value) } }
  }
  return cleanNode(value, '', target)
}

/**
 * Walks the parsed value and checks it can be written in the target format.
 * Dates are turned into ISO strings for JSON and YAML, which have no date type here.
 */
function cleanNode(node: unknown, path: string, target: ConfigFormat): Cleaned {
  if (node === null) {
    if (target === 'toml') {
      return fail(`TOML has no null value${locate(path)}. Replace it with a value or remove the key.`)
    }
    return { ok: true, value: null }
  }
  if (node instanceof Date) {
    return { ok: true, value: target === 'toml' ? node : node.toISOString() }
  }
  if (typeof node === 'string' || typeof node === 'boolean') {
    return { ok: true, value: node }
  }
  if (typeof node === 'number') {
    if (target === 'json' && !Number.isFinite(node)) {
      return fail(`JSON has no ${Number.isNaN(node) ? 'NaN' : 'Infinity'} value${locate(path)}.`)
    }
    return { ok: true, value: node }
  }
  if (typeof node === 'bigint') {
    return { ok: true, value: node }
  }
  if (Array.isArray(node)) {
    const items: unknown[] = []
    for (let index = 0; index < node.length; index++) {
      const child = cleanNode(node[index], `${path}[${index}]`, target)
      if (!child.ok) return child
      items.push(child.value)
    }
    return { ok: true, value: items }
  }
  if (typeof node === 'object') {
    const table: Record<string, unknown> = {}
    for (const key of Object.keys(node)) {
      const child = cleanNode((node as Record<string, unknown>)[key], childPath(path, key), target)
      if (!child.ok) return child
      table[key] = child.value
    }
    return { ok: true, value: table }
  }
  return fail(`This value cannot be written${locate(path)}.`)
}

async function serialize(value: unknown, target: ConfigFormat, indent: number): Promise<string> {
  if (target === 'toml') {
    const { stringify } = await import('smol-toml')
    return stringify(value as Record<string, unknown>)
  }
  if (target === 'json') return JSON.stringify(value, null, indent)
  return YAML.stringify(value, { indent })
}

function tomlRootMessage(value: unknown): string {
  if (value === null || value === undefined) {
    return 'TOML needs a table at the top level, but this document is empty.'
  }
  if (Array.isArray(value)) {
    return 'TOML needs a table at the top level, but this document is an array. Put the array under a key, for example items = [...].'
  }
  return `TOML needs a table at the top level, but this document is a single ${typeof value} value.`
}

function isTable(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
}

function childPath(parent: string, key: string): string {
  const bare = /^[A-Za-z0-9_-]+$/.test(key)
  if (!parent) return bare ? key : JSON.stringify(key)
  return bare ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
}

function locate(path: string): string {
  return path ? ` at "${path}"` : ''
}

function fail(message: string): Cleaned {
  return { ok: false, error: { message } }
}

function withPosition(message: string, line: unknown, column: unknown): ConversionError {
  if (typeof line !== 'number') return { message }
  return typeof column === 'number' ? { message, line, column } : { message, line }
}

function firstLine(value: unknown): string {
  const text = typeof value === 'string' ? value : ''
  return text.split('\n')[0].trim()
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
