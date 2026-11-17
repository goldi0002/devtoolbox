import { describe, expect, it } from 'vitest'
import {
  canonicalJson,
  childPath,
  diffJson,
  formatChangeLine,
  parseJsonInput,
  previewValue,
  summarizeChanges,
  type JsonValue,
} from '../utils/jsonDiff'
import { JSON_DIFF_META } from '../tools/meta/json-diff'

describe('parseJsonInput', () => {
  it('parses valid JSON', () => {
    expect(parseJsonInput('{"a":1}')).toEqual({ ok: true, value: { a: 1 } })
  })
  it('reports empty and invalid input', () => {
    expect(parseJsonInput('   ').ok).toBe(false)
    const bad = parseJsonInput('{a:1}')
    expect(bad.ok).toBe(false)
  })
})

describe('childPath', () => {
  it('uses dot notation for identifiers and brackets otherwise', () => {
    expect(childPath('$', 'name')).toBe('$.name')
    expect(childPath('$', 'first name')).toBe('$["first name"]')
    expect(childPath('$', '2nd')).toBe('$["2nd"]')
    expect(childPath('$.tags', 0)).toBe('$.tags[0]')
  })
})

describe('diffJson', () => {
  it('returns nothing for equal values, ignoring key order', () => {
    expect(diffJson({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toEqual([])
  })

  it('reports added, removed and changed keys with paths', () => {
    const changes = diffJson({ name: 'Ada', age: 36, city: 'London' }, { name: 'Ada', age: 37, role: 'admin' })
    expect(changes).toEqual([
      { kind: 'changed', path: '$.age', before: 36, after: 37 },
      { kind: 'removed', path: '$.city', before: 'London' },
      { kind: 'added', path: '$.role', after: 'admin' },
    ])
  })

  it('recurses into nested objects and arrays by index', () => {
    const changes = diffJson({ user: { tags: ['a', 'b'] } }, { user: { tags: ['a', 'c', 'd'] } })
    expect(changes).toEqual([
      { kind: 'changed', path: '$.user.tags[1]', before: 'b', after: 'c' },
      { kind: 'added', path: '$.user.tags[2]', after: 'd' },
    ])
  })

  it('reports type changes without recursing', () => {
    expect(diffJson({ id: 1 }, { id: '1' })).toEqual([{ kind: 'type-changed', path: '$.id', before: 1, after: '1' }])
    expect(diffJson({ v: null }, { v: {} })).toEqual([{ kind: 'type-changed', path: '$.v', before: null, after: {} }])
    expect(diffJson([1], { 0: 1 } as JsonValue)[0].kind).toBe('type-changed')
  })

  it('compares top-level primitives', () => {
    expect(diffJson(1, 2)).toEqual([{ kind: 'changed', path: '$', before: 1, after: 2 }])
    expect(diffJson('x', 'x')).toEqual([])
  })

  it('treats arrays as unordered when asked', () => {
    expect(diffJson([1, 2, 3], [3, 1, 2], { ignoreArrayOrder: true })).toEqual([])
    expect(diffJson([{ a: 1 }, { b: 2 }], [{ b: 2 }, { a: 1 }], { ignoreArrayOrder: true })).toEqual([])
    expect(diffJson([1, 1, 2], [1, 2, 4], { ignoreArrayOrder: true })).toEqual([
      { kind: 'removed', path: '$[1]', before: 1 },
      { kind: 'added', path: '$[2]', after: 4 },
    ])
    expect(diffJson([1, 2, 3], [3, 1, 2])).toHaveLength(3)
  })

  it('does not confuse inherited object keys with real ones', () => {
    expect(diffJson({}, { toString: 1 })).toEqual([{ kind: 'added', path: '$.toString', after: 1 }])
  })
})

describe('helpers', () => {
  it('canonicalJson sorts keys at every level', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: [1] } })).toBe('{"a":{"c":[1],"d":2},"b":1}')
  })
  it('summarizeChanges counts by kind', () => {
    const counts = summarizeChanges(diffJson({ a: 1, b: 2 }, { a: '1', c: 3 }))
    expect(counts).toEqual({ added: 1, removed: 1, changed: 0, 'type-changed': 1 })
  })
  it('previewValue truncates long values', () => {
    expect(previewValue('abc')).toBe('"abc"')
    expect(previewValue('x'.repeat(100), 10)).toHaveLength(10)
    expect(previewValue(undefined)).toBe('')
  })
})

describe('JSON Diff guide example', () => {
  it('matches what the tool produces', () => {
    const example = JSON_DIFF_META.guide?.example
    expect(example).toBeDefined()
    const [left, right] = (example?.input ?? '').split('\n---\n')
    const l = parseJsonInput(left)
    const r = parseJsonInput(right)
    if (!l.ok || !r.ok) throw new Error('guide example must be valid JSON')
    const lines = diffJson(l.value, r.value).map(formatChangeLine)
    expect(lines.join('\n')).toBe(example?.output)
  })
})
