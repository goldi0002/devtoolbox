import { describe, it, expect } from 'vitest'
import { jsonToCSharp, jsonToTypeScript } from './modelGenerator'

describe('jsonToCSharp', () => {
  it('uses the default class name when none is provided', () => {
    const out = jsonToCSharp('{"name":"a"}')
    expect(out).toContain('public class GeneratedModel')
  })

  it('respects a custom class name', () => {
    const out = jsonToCSharp('{"name":"a"}', 'Person')
    expect(out).toContain('public class Person')
  })

  it('maps primitive types and PascalCases property names', () => {
    const out = jsonToCSharp(
      '{"name":"a","age":3,"score":1.5,"active":true}'
    )
    expect(out).toContain('public string Name { get; set; }')
    expect(out).toContain('public int Age { get; set; }')
    expect(out).toContain('public double Score { get; set; }')
    expect(out).toContain('public bool Active { get; set; }')
  })

  it('maps null to a nullable object', () => {
    expect(jsonToCSharp('{"x":null}')).toContain('public object? X { get; set; }')
  })

  it('maps arrays to List<T>, inferring the item type from the first element', () => {
    expect(jsonToCSharp('{"tags":["x"]}')).toContain('public List<string> Tags { get; set; }')
    expect(jsonToCSharp('{"nums":[1]}')).toContain('public List<int> Nums { get; set; }')
  })

  it('maps empty arrays to List<object>', () => {
    expect(jsonToCSharp('{"items":[]}')).toContain('public List<object> Items { get; set; }')
  })

  it('generates a nested class for object properties, root class first', () => {
    const out = jsonToCSharp('{"meta":{"id":1}}')
    expect(out).toContain('public Meta Meta { get; set; }')
    expect(out).toContain('public class Meta')
    expect(out).toContain('public int Id { get; set; }')
    expect(out.indexOf('public class GeneratedModel')).toBeLessThan(
      out.indexOf('public class Meta')
    )
  })

  it('throws on invalid JSON', () => {
    expect(() => jsonToCSharp('{not json')).toThrow('Invalid JSON')
  })

  it('throws when the root is not an object', () => {
    expect(() => jsonToCSharp('[1,2,3]')).toThrow('Root JSON must be an object')
    expect(() => jsonToCSharp('"hello"')).toThrow('Root JSON must be an object')
    expect(() => jsonToCSharp('null')).toThrow('Root JSON must be an object')
  })
})

describe('jsonToTypeScript', () => {
  it('uses the default interface name when none is provided', () => {
    expect(jsonToTypeScript('{"name":"a"}')).toContain('interface GeneratedModel {')
  })

  it('respects a custom interface name', () => {
    expect(jsonToTypeScript('{"name":"a"}', 'Person')).toContain('interface Person {')
  })

  it('maps primitive types, preserving the original key casing', () => {
    const out = jsonToTypeScript('{"name":"a","age":3,"active":true}')
    expect(out).toContain('name: string;')
    expect(out).toContain('age: number;')
    expect(out).toContain('active: boolean;')
  })

  it('marks null properties optional with a null type', () => {
    expect(jsonToTypeScript('{"x":null}')).toContain('x?: null;')
  })

  it('maps arrays to T[], inferring from the first element', () => {
    expect(jsonToTypeScript('{"tags":["x"]}')).toContain('tags: string[];')
  })

  it('maps empty arrays to unknown[]', () => {
    expect(jsonToTypeScript('{"items":[]}')).toContain('items: unknown[];')
  })

  it('generates a nested interface for object properties', () => {
    const out = jsonToTypeScript('{"meta":{"id":1}}')
    expect(out).toContain('meta: Meta;')
    expect(out).toContain('interface Meta {')
    expect(out).toContain('id: number;')
  })

  it('throws on invalid JSON', () => {
    expect(() => jsonToTypeScript('{not json')).toThrow('Invalid JSON')
  })

  it('throws when the root is not an object', () => {
    expect(() => jsonToTypeScript('[1,2,3]')).toThrow('Root JSON must be an object')
    expect(() => jsonToTypeScript('42')).toThrow('Root JSON must be an object')
  })
})
