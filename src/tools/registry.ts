export interface ToolMeta {
  slug: string
  name: string
  description: string
  category: 'json' | 'encode' | 'generate' | 'text' | 'css' | 'network' | 'auth' | 'web' | 'data'
  tag: string
  keywords: string[]
}

export const tools: ToolMeta[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Validate, format, and minify JSON. Instantly spot syntax errors.',
    category: 'json',
    tag: 'json',
    keywords: ['json', 'format', 'minify', 'pretty', 'validate'],
  },
  {
    slug: 'json-model',
    name: 'JSON → Model',
    description: 'Convert JSON to C# classes or TypeScript interfaces with proper types.',
    category: 'json',
    tag: 'codegen',
    keywords: ['json', 'model', 'csharp', 'typescript', 'interface', 'class'],
  },
  {
    slug: 'uuid',
    name: 'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs one at a time or in bulk up to 100.',
    category: 'generate',
    tag: 'generate',
    keywords: ['uuid', 'guid', 'unique', 'id', 'generate'],
  },
  {
    slug: 'base64',
    name: 'Base64',
    description: 'Encode plain text to Base64 or decode Base64 back to plain text.',
    category: 'encode',
    tag: 'encode',
    keywords: ['base64', 'encode', 'decode', 'string'],
  },
  {
    slug: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two text blocks line-by-line and highlight every change.',
    category: 'text',
    tag: 'diff',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes'],
  },
  {
    slug: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens — header, payload, expiry and more.',
    category: 'auth',
    tag: 'auth',
    keywords: ['jwt', 'token', 'decode', 'auth', 'bearer', 'json web token', 'claims'],
  },
  {
    slug: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format and minify HTML code for better readability or compactness.',
    category: 'web',
    tag: 'web',
    keywords: ['html', 'format', 'minify', 'pretty', 'validate'],
  }
]

export const categoryLabels: Record<ToolMeta['category'], string> = {
  json: 'JSON',
  encode: 'Encode / Decode',
  generate: 'Generators',
  text: 'Text',
  css: 'CSS',
  network: 'Network',
  auth: 'Authentication',
  web: 'Web',
  data: 'Data',
}
