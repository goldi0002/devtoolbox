import { describe, it, expect } from 'vitest'
import { jsonToZod } from '../utils/jsonToZod'
import { parseCronExpression } from '../utils/cronParser'

describe('JSON to Zod converter', () => {
  it('converts basic primitive types correctly', () => {
    const input = {
      name: 'John',
      age: 30,
      isMember: true,
    }
    const result = jsonToZod(input, 'mySchema')
    expect(result).toContain('export const mySchema = z.object({')
    expect(result).toContain('name: z.string(),')
    expect(result).toContain('age: z.number().int(),')
    expect(result).toContain('isMember: z.boolean(),')
    expect(result).toContain('export type MySchema = z.infer<typeof mySchema>')
  })

  it('converts arrays and nested objects', () => {
    const input = {
      tags: ['react', 'vite'],
      settings: { theme: 'dark' },
    }
    const result = jsonToZod(input)
    expect(result).toContain('tags: z.array(z.string()),')
    expect(result).toContain('settings: z.object({')
  })
})

describe('Cron Expression Parser', () => {
  it('parses valid 5-part cron expression correctly', () => {
    const parsed = parseCronExpression('*/15 * * * *')
    expect(parsed.isValid).toBe(true)
    expect(parsed.description).toContain('Runs every 15 minutes')
    expect(parsed.nextRuns.length).toBe(5)
  })

  it('handles invalid cron syntax gracefully', () => {
    const parsed = parseCronExpression('invalid cron string')
    expect(parsed.isValid).toBe(false)
    expect(parsed.error).toBeDefined()
  })
})
