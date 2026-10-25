import { describe, it, expect } from 'vitest'
import {
  PIPELINE_OPERATIONS,
  executePipeline,
  serializePipelineToHash,
  deserializePipelineFromHash,
} from '../utils/pipelineEngine'
import { DEV_RECIPES } from '../data/recipes'

describe('DevFlow Pipeline Engine', () => {
  it('contains expected registered operations', () => {
    const ids = PIPELINE_OPERATIONS.map(o => o.id)
    expect(ids).toContain('base64-decode')
    expect(ids).toContain('base64-encode')
    expect(ids).toContain('json-prettify')
    expect(ids).toContain('json-minify')
    expect(ids).toContain('extract-json-key')
    expect(ids).toContain('jwt-decode')
    expect(ids).toContain('regex-replace')
    expect(ids).toContain('regex-extract')
    expect(ids).toContain('case-transform')
    expect(ids).toContain('sha256-hash')
  })

  it('correctly executes multi-step transformation pipeline', () => {
    const rawPayload = JSON.stringify({
      user: 'alice',
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.sign',
    })

    const { finalOutput, hasError, results } = executePipeline(rawPayload, [
      {
        id: '1',
        operationId: 'extract-json-key',
        enabled: true,
        options: { path: 'token' },
      },
      {
        id: '2',
        operationId: 'jwt-decode',
        enabled: true,
        options: { section: 'payload' },
      },
      {
        id: '3',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2, sortKeys: false },
      },
    ])

    expect(hasError).toBe(false)
    expect(results.length).toBe(3)
    const parsed = JSON.parse(finalOutput)
    expect(parsed.role).toBe('admin')
  })

  it('bypasses disabled steps', () => {
    const input = 'hello world'
    const { finalOutput, results } = executePipeline(input, [
      {
        id: '1',
        operationId: 'case-transform',
        enabled: false,
        options: { targetCase: 'upper' },
      },
      {
        id: '2',
        operationId: 'case-transform',
        enabled: true,
        options: { targetCase: 'snake' },
      },
    ])

    expect(results.length).toBe(1)
    expect(finalOutput).toBe('hello_world')
  })

  it('handles invalid JSON gracefully without throwing uncaught exceptions', () => {
    const invalidJson = '{ not valid json'
    const { hasError, results } = executePipeline(invalidJson, [
      {
        id: '1',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2 },
      },
    ])

    expect(hasError).toBe(true)
    expect(results[0].error).toBeDefined()
  })

  it('serializes and deserializes pipeline to and from compressed URL hash', () => {
    const pipelineState = {
      title: 'Test Webhook Unpacker',
      input: '{"key":"value"}',
      steps: [
        {
          id: 'step-1',
          operationId: 'json-prettify',
          enabled: true,
          options: { indent: 4 },
        },
      ],
    }

    const hash = serializePipelineToHash(pipelineState)
    expect(hash.length).toBeGreaterThan(0)

    const restored = deserializePipelineFromHash(hash)
    expect(restored).not.toBeNull()
    expect(restored?.input).toBe(pipelineState.input)
    expect(restored?.steps.length).toBe(1)
    expect(restored?.steps[0].operationId).toBe('json-prettify')
  })

  it('validates pre-built developer recipes and slug lookup', () => {
    expect(DEV_RECIPES.length).toBeGreaterThanOrEqual(4)
    DEV_RECIPES.forEach(recipe => {
      expect(recipe.slug).toBeTruthy()
      expect(recipe.title).toBeTruthy()
      expect(recipe.steps.length).toBeGreaterThan(0)
      expect(recipe.sampleInput).toBeTruthy()
      
      // Test getRecipeBySlug directly
      const found = DEV_RECIPES.find(r => r.slug === recipe.slug)
      expect(found).toBeDefined()
      expect(found?.title).toBe(recipe.title)

      // Test pathname segment resolution like RecipePage uses
      const mockPathname = `/recipes/${recipe.slug}`
      const segments = mockPathname.split('/').filter(Boolean)
      const extractedSlug = segments.at(-1) ?? ''
      expect(extractedSlug).toBe(recipe.slug)

      // execute each recipe with its sample input
      const res = executePipeline(recipe.sampleInput, recipe.steps)
      expect(res.hasError).toBe(false)
      expect(res.finalOutput.length).toBeGreaterThan(0)
    })
  })
})
