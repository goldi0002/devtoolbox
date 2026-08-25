import { describe, it, expect } from 'vitest'
import {
  autoRepairJson,
  analyzeJsonError,
  formatJsonData,
  computeJsonStats,
  queryJsonData,
  transformJsonKeys,
  jsonToTypeScript,
  escapeJsonString,
  unescapeJsonString,
  generateSampleJson
} from '../utils/jsonEngine'

describe('JSON Engine & Formatter', () => {
  it('formats JSON with various indentation options', () => {
    const data = { a: 1, b: 'test', c: [1, 2] }
    const formatted2 = formatJsonData(data, { indent: 2 })
    expect(formatted2).toContain('  "a": 1')

    const formatted4 = formatJsonData(data, { indent: 4 })
    expect(formatted4).toContain('    "a": 1')

    const minified = formatJsonData(data, { indent: 'minified' })
    expect(minified).toBe('{"a":1,"b":"test","c":[1,2]}')
  })

  it('recursively sorts object keys', () => {
    const data = { z: 1, a: 2, m: { y: 3, b: 4 } }
    const sorted = transformJsonKeys(data, 'asc')
    expect(Object.keys(sorted)).toEqual(['a', 'm', 'z'])
    expect(Object.keys(sorted.m)).toEqual(['b', 'y'])
  })

  it('converts object key casing', () => {
    const data = { first_name: 'John', 'last-name': 'Doe', user_profile_data: { home_address: '123' } }
    const camel = transformJsonKeys(data, 'none', 'camel')
    expect(camel.firstName).toBe('John')
    expect(camel.lastName).toBe('Doe')
    expect(camel.userProfileData.homeAddress).toBe('123')

    const snake = transformJsonKeys(camel, 'none', 'snake')
    expect(snake.first_name).toBe('John')
    expect(snake.user_profile_data.home_address).toBe('123')
  })

  it('auto-repairs broken and relaxed JSON', () => {
    const broken = `// Comments
    {
      name: 'ToolBox',
      active: True,
      tags: ['a', 'b',],
    }`

    const repaired = autoRepairJson(broken)
    expect(() => JSON.parse(repaired)).not.toThrow()
    const parsed = JSON.parse(repaired)
    expect(parsed.name).toBe('ToolBox')
    expect(parsed.active).toBe(true)
    expect(parsed.tags).toEqual(['a', 'b'])
  })

  it('analyzes syntax errors accurately with line and column', () => {
    const invalidJson = '{\n  "name": "Alex",\n  "age": 30,\n}'
    const error = analyzeJsonError(invalidJson)
    expect(error.message).toBeTruthy()
    expect(error.line).toBeGreaterThanOrEqual(1)
    expect(error.snippet).toBeTruthy()
  })

  it('computes deep JSON structural statistics', () => {
    const sample = {
      user: { id: 101, name: 'Alice', active: true, notes: null },
      tags: ['admin', 'dev', 'beta']
    }
    const stats = computeJsonStats(sample)
    expect(stats.totalKeys).toBeGreaterThanOrEqual(5)
    expect(stats.depth).toBeGreaterThanOrEqual(2)
    expect(stats.stringCount).toBeGreaterThanOrEqual(4)
    expect(stats.numberCount).toBe(1)
    expect(stats.booleanCount).toBe(1)
    expect(stats.nullCount).toBe(1)
  })

  it('executes dot-notation and path queries', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' }
      ]
    }
    const q1 = queryJsonData(data, 'users[0].name', 'path')
    expect(q1.data).toBe('Alice')

    const q2 = queryJsonData(data, 'users[*].id', 'path')
    expect(q2.data).toEqual([1, 2])
  })

  it('executes JavaScript expression queries', () => {
    const data = [
      { id: 1, price: 50 },
      { id: 2, price: 150 },
      { id: 3, price: 200 }
    ]
    const res = queryJsonData(data, 'item => item.price > 100', 'jsexpr')
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBe(2)
  })

  it('generates clean TypeScript interfaces', () => {
    const data = {
      id: 42,
      title: 'DevTool',
      isOpenSource: true,
      meta: { stars: 100, tags: ['ts', 'react'] }
    }
    const ts = jsonToTypeScript(data, 'ToolConfig')
    expect(ts).toContain('export interface ToolConfig')
    expect(ts).toContain('id: number')
    expect(ts).toContain('title: string')
    expect(ts).toContain('isOpenSource: boolean')
  })

  it('handles string escaping and unescaping', () => {
    const str = '{"msg":"hello"}'
    const escaped = escapeJsonString(str)
    expect(escaped).toBe('"{\\"msg\\":\\"hello\\"}"')
    const unescaped = unescapeJsonString(escaped)
    expect(unescaped).toBe(str)
  })

  it('generates sample payloads properly', () => {
    const ecommerce = generateSampleJson('ecommerce')
    expect(() => JSON.parse(ecommerce)).not.toThrow()

    const benchmark = generateSampleJson('large_benchmark')
    const parsed = JSON.parse(benchmark)
    expect(parsed.users.length).toBe(1000)
  })
})
