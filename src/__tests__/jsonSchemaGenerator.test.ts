import { describe, it, expect } from 'vitest'
import {
  generateJsonSchema,
  validateJsonAgainstSchema,
  JsonSchemaOptions
} from '../utils/jsonSchemaGenerator'

describe('JSON Schema Generator & Validator', () => {
  const defaultOptions: JsonSchemaOptions = {
    draft: 'draft-07',
    title: 'TestSchema',
    description: 'Unit test schema',
    requiredMode: 'all',
    detectFormats: true,
    additionalProperties: true,
    inferEnums: false
  }

  it('infers primitive types correctly', () => {
    const input = JSON.stringify({
      str: 'hello',
      num: 42.5,
      intVal: 100,
      boolVal: true,
      nullVal: null
    })

    const schema = generateJsonSchema(input, defaultOptions)

    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#')
    expect(schema.title).toBe('TestSchema')
    expect(schema.type).toBe('object')
    expect(schema.properties.str.type).toBe('string')
    expect(schema.properties.num.type).toBe('number')
    expect(schema.properties.intVal.type).toBe('integer')
    expect(schema.properties.boolVal.type).toBe('boolean')
    expect(schema.properties.nullVal.type).toBe('null')
    expect(schema.required).toEqual(['str', 'num', 'intVal', 'boolVal', 'nullVal'])
  })

  it('detects string formats accurately', () => {
    const input = JSON.stringify({
      email: 'alex@example.com',
      uuid: 'c8a2b1f0-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      dateTime: '2026-10-24T20:30:00Z',
      date: '2026-10-24',
      url: 'https://toolbox4devs.com',
      ip: '192.168.1.1'
    })

    const schema = generateJsonSchema(input, defaultOptions)

    expect(schema.properties.email.format).toBe('email')
    expect(schema.properties.uuid.format).toBe('uuid')
    expect(schema.properties.dateTime.format).toBe('date-time')
    expect(schema.properties.date.format).toBe('date')
    expect(schema.properties.url.format).toBe('uri')
    expect(schema.properties.ip.format).toBe('ipv4')
  })

  it('handles draft-2020-12 and openapi-3.0 drafts', () => {
    const input = JSON.stringify({ name: 'DevToolbox' })

    const draft2020 = generateJsonSchema(input, { ...defaultOptions, draft: 'draft-2020-12' })
    expect(draft2020.$schema).toBe('https://json-schema.org/draft/2020-12/schema')

    const openapi = generateJsonSchema(input, { ...defaultOptions, draft: 'openapi-3.0' })
    expect(openapi.$schema).toBeUndefined()
    expect(openapi.type).toBe('object')
  })

  it('enforces requiredMode none and top-level', () => {
    const input = JSON.stringify({
      user: {
        id: 1,
        details: { nickname: 'dev' }
      }
    })

    const noneReq = generateJsonSchema(input, { ...defaultOptions, requiredMode: 'none' })
    expect(noneReq.required).toBeUndefined()

    const topReq = generateJsonSchema(input, { ...defaultOptions, requiredMode: 'top-level' })
    expect(topReq.required).toEqual(['user'])
    expect(topReq.properties.user.required).toBeUndefined()
  })

  it('validates test payloads against schema', () => {
    const schema = generateJsonSchema(
      JSON.stringify({
        id: '12345678-1234-1234-1234-123456789abc',
        email: 'test@example.com',
        age: 30
      }),
      defaultOptions
    )

    // Valid data
    const validResult = validateJsonAgainstSchema(schema, {
      id: '12345678-1234-1234-1234-123456789abc',
      email: 'user@domain.org',
      age: 25
    })
    expect(validResult.valid).toBe(true)
    expect(validResult.errors.length).toBe(0)

    // Missing required field
    const invalidResult = validateJsonAgainstSchema(schema, {
      id: '12345678-1234-1234-1234-123456789abc',
      age: 25
    })
    expect(invalidResult.valid).toBe(false)
    expect(invalidResult.errors[0].message).toContain('email')

    // Invalid format
    const badFormatResult = validateJsonAgainstSchema(schema, {
      id: 'not-a-uuid',
      email: 'test@example.com',
      age: 30
    })
    expect(badFormatResult.valid).toBe(false)
    expect(badFormatResult.errors[0].message).toContain('uuid')
  })
})
