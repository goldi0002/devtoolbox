import { describe, it, expect } from 'vitest'
import { CURL_CONVERTER_META } from '../tools/meta/curl-converter'
import { SQL_FORMATTER_META } from '../tools/meta/sql-formatter'
import { GRAPHQL_FORMATTER_META } from '../tools/meta/graphql-formatter'
import { YAML_JSON_CONVERTER_META } from '../tools/meta/yaml-json-converter'
import { HMAC_GENERATOR_META } from '../tools/meta/hmac-generator'
import { getToolBySlug } from '../tools/registry'

describe('New Developer Utilities Registration', () => {
  it('registers curl-converter correctly in registry', () => {
    const tool = getToolBySlug('curl-converter')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('cURL to Code Converter')
    expect(tool?.category).toBe('web-tools')
  })

  it('registers sql-formatter correctly in registry', () => {
    const tool = getToolBySlug('sql-formatter')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('SQL Formatter & Prettifier')
    expect(tool?.category).toBe('data-tools')
  })

  it('registers graphql-formatter correctly in registry', () => {
    const tool = getToolBySlug('graphql-formatter')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('GraphQL Query Formatter')
    expect(tool?.category).toBe('web-tools')
  })

  it('registers yaml-json-converter correctly in registry', () => {
    const tool = getToolBySlug('yaml-json-converter')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('YAML <-> JSON Converter')
    expect(tool?.category).toBe('data-tools')
  })

  it('registers hmac-generator correctly in registry', () => {
    const tool = getToolBySlug('hmac-generator')
    expect(tool).toBeDefined()
    expect(tool?.name).toBe('HMAC Generator & Calculator')
    expect(tool?.category).toBe('crypto-tools')
  })

  it('has valid metadata and SEO configurations for all new tools', () => {
    [
      CURL_CONVERTER_META,
      SQL_FORMATTER_META,
      GRAPHQL_FORMATTER_META,
      YAML_JSON_CONVERTER_META,
      HMAC_GENERATOR_META,
    ].forEach(meta => {
      expect(meta.slug).toBeTruthy()
      expect(meta.description.length).toBeGreaterThan(10)
      expect(meta.about.summary).toBeTruthy()
      expect(meta.about.useCases.length).toBeGreaterThan(0)
      expect(meta.about.features.length).toBeGreaterThan(0)
      expect(meta.seo?.title).toContain('ToolBox4Devs')
    })
  })
})
