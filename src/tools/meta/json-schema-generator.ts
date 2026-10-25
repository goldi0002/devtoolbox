import { lazy } from 'react'
import { ToolMeta } from '../tool-meta'

export const JSON_SCHEMA_GENERATOR_META: ToolMeta = {
  slug: 'json-schema-generator',
  name: 'JSON Schema Generator & Validator',
  category: 'json-tools',
  tag: 'JSON Schema',
  description: 'Convert JSON payloads into Draft-07, Draft 2020-12, or OpenAPI JSON Schemas with live validation.',
  keywords: [
    'json schema generator',
    'json to schema',
    'json schema validator',
    'draft-07',
    'draft 2020-12',
    'openapi schema',
    'schema generator online',
    'json validator'
  ],
  status: 'stable',
  featured: true,
  isNew: true,
  complexity: 'moderate',
  addedAt: '2026-10-24',
  toolComponent: lazy(() => import('../../components/tools/json-tools/JsonSchemaGenerator')),
  about: {
    summary:
      'The JSON Schema Generator & Validator transforms JSON payloads into standardized JSON Schema specifications (Draft-07, Draft 2020-12, or OpenAPI 3.0) with automatic format detection, customizable required fields, and live in-browser payload testing.',
    useCases: [
      'Generating Draft-07 and Draft 2020-12 JSON Schemas for REST API documentation and contracts',
      'Creating OpenAPI 3.0 component schemas from sample server payloads',
      'Testing and validating incoming client payloads against generated schemas client-side',
      'Configuring Fastify, Ajv, or Python jsonschema validation rules'
    ],
    features: [
      'Supports Draft-07, Draft 2020-12, and OpenAPI 3.0 schema formats',
      'Automatic string format detection for date-time, dates, UUIDs, emails, URIs, and IPv4',
      'Customizable required property policies: all properties, top-level only, or all optional',
      'Strict additionalProperties control to enforce closed schemas',
      'Integrated live payload tester with field-by-field error diagnostics',
      '100% private and runs completely in your local browser memory'
    ],
    tip: 'Switch to the "Test & Validate Payload" tab to test modified payloads against your generated schema in real time.'
  },
  seo: {
    title: 'JSON Schema Generator & Validator — Draft-07, 2020-12 & OpenAPI — ToolBox4Devs',
    description: 'Convert JSON to JSON Schema (Draft-07, Draft 2020-12, OpenAPI) with format inference and live interactive testing. 100% private client-side utility.',
    extraKeywords: [
      'json to json schema',
      'generate json schema online',
      'json schema draft 7 generator',
      'json schema validator tool',
      'ajv schema generator',
      'openapi schema generator'
    ]
  }
}
