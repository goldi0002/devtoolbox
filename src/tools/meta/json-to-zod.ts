import { lazy } from 'react'
import { ToolMeta } from '../tool-meta'

export const JSON_TO_ZOD_META: ToolMeta = {
  slug: 'json-to-zod',
  name: 'JSON to Zod Schema Generator',
  category: 'json-tools',
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
  },
  guide: {
    "steps": [
      {
        "name": "Paste JSON",
        "text": "Enter a JSON object or array under JSON Input."
      },
      {
        "name": "Name the schema",
        "text": "Change the variable name in the input field above the editor to suit your code."
      },
      {
        "name": "Copy the output",
        "text": "Copy the Generated Zod Schema (TypeScript) code into your project."
      },
      {
        "name": "Use the inferred type",
        "text": "The output also exports a TypeScript type built with z.infer from the schema."
      }
    ],
    "faqs": [
      {
        "question": "How are numbers typed?",
        "answer": "Whole numbers become z.number().int(), and other numbers become z.number()."
      },
      {
        "question": "How are arrays handled?",
        "answer": "Arrays become z.array(...) around the element type. When the elements have different types, the element type is a z.union."
      },
      {
        "question": "Does the output need extra packages?",
        "answer": "Yes. The generated code imports z from 'zod', so zod must be installed in your project."
      },
      {
        "question": "Is my JSON sent anywhere?",
        "answer": "No. The conversion runs in your browser."
      }
    ],
    "example": {
      "title": "Name the schema user and convert an object with an array.",
      "input": "{\"name\":\"Ada\",\"age\":36,\"tags\":[\"a\"]}",
      "output": "import { z } from 'zod'\n\nexport const user = z.object({\n  name: z.string(),\n  age: z.number().int(),\n  tags: z.array(z.string()),\n})\n\nexport type User = z.infer<typeof user>",
      "inputLabel": "JSON Input",
      "outputLabel": "Generated Zod Schema (TypeScript)"
    }
  },
  seo: {
    title: 'JSON to Zod Schema Generator — Convert JSON to Zod & TypeScript',
    description: 'Paste JSON and get a strongly-typed Zod schema with inferred TypeScript types. Handles nested objects and arrays, entirely in your browser.',
  },
}
