import { lazy } from 'react'
import { ToolMeta } from '../tool-meta'

export const JSON_TO_ZOD_META: ToolMeta = {
  slug: 'json-to-zod',
  name: 'JSON to Zod Schema Generator',
  category: 'JSON Tools',
  tag: 'JSON → Zod',
  description: 'Convert JSON payloads into strongly-typed Zod schemas and TypeScript types.',
  keywords: ['json', 'zod', 'schema', 'typescript', 'validator', 'inference', 'generator', 'type'],
  status: 'stable',
  featured: true,
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/json-tools/JsonToZod')),
  about: {
    summary: 'The JSON to Zod Schema Generator converts any raw JSON object or array into a valid Zod schema definition with inferred TypeScript types.',
    useCases: [
      'Building API request and response runtime validators.',
      'Generating Zod schemas for forms from API payload samples.',
      'Converting legacy JSON config objects to runtime validated schemas.'
    ],
    features: [
      'Automatic type inference for strings, integers, floats, booleans, arrays, and objects.',
      'Generates exported z.infer TypeScript interface declarations.',
      '100% private and client-side processing.'
    ],
    tip: 'Customize the exported schema variable name using the input field above the editor.'
  }
}
