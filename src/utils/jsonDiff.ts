export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

export type JsonType = 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object'

export type ChangeKind = 'added' | 'removed' | 'changed' | 'type-changed'

export interface JsonChange {
  kind: ChangeKind
  /** JSONPath-style location, e.g. `$.user.tags[0]` or `$["first name"]`. */
  path: string
  before?: JsonValue
  after?: JsonValue
}

export interface JsonDiffOptions {
  /** Treat arrays as unordered collections: only items missing from one side are reported. */
  ignoreArrayOrder?: boolean
}

export type ParseResult = { ok: true; value: JsonValue } | { ok: false; error: string }

export function parseJsonInput(text: string): ParseResult {
  if (!text.trim()) return { ok: false, error: 'Enter some JSON.' }
  try {
    return { ok: true, value: JSON.parse(text) as JsonValue }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON.' }
  }
}

export function jsonType(value: JsonValue): JsonType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as JsonType
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`
  return IDENTIFIER.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
}

/** Stable string form with object keys sorted, so equal values compare equal regardless of key order. */
export function canonicalJson(value: JsonValue): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function diffUnorderedArrays(a: JsonValue[], b: JsonValue[], path: string, out: JsonChange[]) {
  const remaining = new Map<string, number[]>()
  b.forEach((item, i) => {
    const key = canonicalJson(item)
    remaining.set(key, [...(remaining.get(key) ?? []), i])
  })
  const matchedRight = new Set<number>()
  a.forEach((item, i) => {
    const indexes = remaining.get(canonicalJson(item))
    if (indexes && indexes.length > 0) {
      matchedRight.add(indexes.shift() as number)
    } else {
      out.push({ kind: 'removed', path: childPath(path, i), before: item })
    }
  })
  b.forEach((item, i) => {
    if (!matchedRight.has(i)) out.push({ kind: 'added', path: childPath(path, i), after: item })
  })
}

function walk(a: JsonValue, b: JsonValue, path: string, options: JsonDiffOptions, out: JsonChange[]) {
  const typeA = jsonType(a)
  const typeB = jsonType(b)
  if (typeA !== typeB) {
    out.push({ kind: 'type-changed', path, before: a, after: b })
    return
  }
  if (typeA === 'array') {
    const left = a as JsonValue[]
    const right = b as JsonValue[]
    if (options.ignoreArrayOrder) {
      diffUnorderedArrays(left, right, path, out)
      return
    }
    const shared = Math.min(left.length, right.length)
    for (let i = 0; i < shared; i++) walk(left[i], right[i], childPath(path, i), options, out)
    for (let i = shared; i < left.length; i++) out.push({ kind: 'removed', path: childPath(path, i), before: left[i] })
    for (let i = shared; i < right.length; i++) out.push({ kind: 'added', path: childPath(path, i), after: right[i] })
    return
  }
  if (typeA === 'object') {
    const left = a as Record<string, JsonValue>
    const right = b as Record<string, JsonValue>
    for (const key of Object.keys(left)) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        out.push({ kind: 'removed', path: childPath(path, key), before: left[key] })
      } else {
        walk(left[key], right[key], childPath(path, key), options, out)
      }
    }
    for (const key of Object.keys(right)) {
      if (!Object.prototype.hasOwnProperty.call(left, key)) {
        out.push({ kind: 'added', path: childPath(path, key), after: right[key] })
      }
    }
    return
  }
  if (a !== b) out.push({ kind: 'changed', path, before: a, after: b })
}

/** Lists every structural difference between two JSON values. Key order never counts as a change. */
export function diffJson(a: JsonValue, b: JsonValue, options: JsonDiffOptions = {}): JsonChange[] {
  const out: JsonChange[] = []
  walk(a, b, '$', options, out)
  return out
}

export function summarizeChanges(changes: JsonChange[]): Record<ChangeKind, number> {
  const counts: Record<ChangeKind, number> = { added: 0, removed: 0, changed: 0, 'type-changed': 0 }
  for (const change of changes) counts[change.kind]++
  return counts
}

/** Short single-line preview of a value for display. */
export function previewValue(value: JsonValue | undefined, max = 80): string {
  if (value === undefined) return ''
  const text = JSON.stringify(value)
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

const MARKERS: Record<ChangeKind, string> = { added: '+', removed: '-', changed: '~', 'type-changed': '~' }

/** One-line text form of a change, used for the copyable report. */
export function formatChangeLine(change: JsonChange): string {
  const marker = MARKERS[change.kind]
  if (change.kind === 'added') return `${marker} ${change.path}: ${previewValue(change.after)}`
  if (change.kind === 'removed') return `${marker} ${change.path}: ${previewValue(change.before)}`
  return `${marker} ${change.path}: ${previewValue(change.before)} → ${previewValue(change.after)}`
}
