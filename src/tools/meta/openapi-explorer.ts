import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const OPENAPI_EXPLORER_META: ToolMeta = {
  slug: 'openapi-explorer',
  name: 'OpenAPI / Swagger 3.0 Explorer',
  description: 'Parse OpenAPI 3.x and Swagger 2.0 YAML/JSON specs, resolve $ref schemas, and generate cURL and fetch() snippets locally.',
  category: 'web-tools',
  tag: 'api',
  icon: 'Globe',
  keywords: [
    'openapi explorer',
    'swagger 3.0 viewer',
    'openapi yaml viewer',
    'swagger json parser',
    'openapi curl generator',
    'rest api schema inspector',
    'openapi ref resolver',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/OpenApiExplorer')),
  about: {
    summary:
      'OpenAPI / Swagger 3.0 Explorer lets you inspect OpenAPI 3.0, 3.1, and Swagger 2.0 specifications written in YAML or JSON entirely inside your browser. It automatically resolves local $ref schema pointers, generates realistic sample JSON request and response bodies, and produces ready-to-run cURL and JavaScript fetch() snippets for any endpoint without uploading private API contracts to a third-party server.',
    useCases: [
      'Reviewing internal microservice OpenAPI YAML/JSON contracts offline without sending specs to cloud viewers',
      'Generating sample JSON request payloads from nested $ref component schemas',
      'Quickly building parameterized cURL or fetch() requests from an API endpoint definition',
      'Auditing path, query, and header parameters as well as response status schemas',
    ],
    features: [
      'Parses both YAML and JSON OpenAPI 3.0 / 3.1 and Swagger 2.0 specifications',
      'Local $ref pointer resolution with circular-reference protection and allOf/oneOf merging',
      'Interactive endpoint catalog with HTTP method filters and search by path, tag, or operationId',
      'Live parameter inputs that populate path variables, query strings, and headers in generated snippets',
      'One-click copy for generated cURL commands and JavaScript fetch() calls',
    ],
    tip: 'Switch the Target Server Base URL to http://localhost:3000 (or your staging gateway) to copy cURL commands pointed straight at your local dev server.',
  },
  addedAt: '2026-11-21',
  complexity: 'moderate',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'OpenAPI & Swagger 3.0 Explorer — Client-Side YAML/JSON API Viewer',
    description: 'Explore OpenAPI 3.0/3.1 and Swagger 2.0 YAML or JSON specs privately in your browser. Resolve $ref schemas and generate cURL & fetch() snippets.',
    extraKeywords: [
      'openapi 3.0 viewer online',
      'swagger yaml to curl',
      'private openapi explorer',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Paste or load an OpenAPI spec',
        text: 'Paste any OpenAPI 3.x or Swagger 2.0 YAML or JSON specification into the editor, or click Load Sample Spec to explore the built-in Orders & Users API.',
      },
      {
        name: 'Filter and pick an endpoint',
        text: 'Filter endpoints by HTTP method (GET, POST, PUT, PATCH, DELETE) or search by path, tag, or operationId.',
      },
      {
        name: 'Fill parameters and edit the body',
        text: 'Enter path, query, or header values and customize the auto-generated sample JSON request body.',
      },
      {
        name: 'Copy cURL or fetch() code',
        text: 'Toggle between cURL Command and JavaScript fetch() and copy the generated snippet with one click.',
      },
    ],
    faqs: [
      {
        question: 'Does OpenAPI Explorer support both YAML and JSON?',
        answer: 'Yes. It parses both YAML and JSON OpenAPI 3.0/3.1 specifications as well as legacy Swagger 2.0 documents in browser memory.',
      },
      {
        question: 'How are $ref component schemas handled?',
        answer: 'Local JSON pointers such as #/components/schemas/Order or #/definitions/User are recursively resolved with circular-reference protection to build sample payloads.',
      },
      {
        question: 'Are private internal API specs uploaded anywhere?',
        answer: 'No. All YAML parsing, schema resolution, and snippet generation run 100% client-side in your browser.',
      },
    ],
    example: {
      title: 'Generate a GET request snippet with query parameters from an OpenAPI endpoint.',
      input: 'GET /orders?status=paid&limit=20',
      output: 'curl -X GET "https://api.example.com/v2/orders?status=paid&limit=20"',
      inputLabel: 'Selected endpoint & query params',
      outputLabel: 'Generated cURL command',
    },
  },
}
