export interface ToolMeta {
  slug: string
  name: string
  description: string
  category: 'json-tools' | 'encode-tools' | 'text-tools' | 'generate-tools' | 'auth-tools' | 'web-tools' | 'data-tools' | 'crypto-tools'
  tag: string
  keywords: string[]
}

export const tools: ToolMeta[] = [
  // ── JSON Tools ─────────────────────────────────────────────────────────────
  {
    slug:        'json-formatter',
    name:        'JSON Formatter',
    description: 'Validate, format, and minify JSON. Instantly spot syntax errors.',
    category:    'json-tools',
    tag:         'json',
    keywords:    ['json', 'format', 'minify', 'pretty', 'validate'],
  },
  {
    slug:        'json-model',
    name:        'JSON → Model',
    description: 'Convert JSON to C# classes or TypeScript interfaces with proper types.',
    category:    'json-tools',
    tag:         'codegen',
    keywords:    ['json', 'model', 'csharp', 'typescript', 'interface', 'class'],
  },

  // ── Encode Tools ───────────────────────────────────────────────────────────
  {
    slug:        'base64',
    name:        'Base64',
    description: 'Encode plain text to Base64 or decode Base64 back to plain text.',
    category:    'encode-tools',
    tag:         'encode',
    keywords:    ['base64', 'encode', 'decode', 'string'],
  },
  {
    slug:        'url-encoder',
    name:        'URL Encoder / Decoder',
    description: 'Encode or decode URLs and query string parameters instantly in your browser.',
    category:    'encode-tools',
    tag:         'encode',
    keywords:    ['url', 'encode', 'decode', 'uri', 'query', 'percent encoding'],
  },

  // ── Text Tools ─────────────────────────────────────────────────────────────
  {
    slug:        'text-diff',
    name:        'Text Diff',
    description: 'Compare two text blocks line-by-line and highlight every change.',
    category:    'text-tools',
    tag:         'diff',
    keywords:    ['diff', 'compare', 'text', 'difference', 'changes'],
  },

  // ── Generate Tools ─────────────────────────────────────────────────────────
  {
    slug:        'uuid',
    name:        'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs one at a time or in bulk up to 100.',
    category:    'generate-tools',
    tag:         'generate',
    keywords:    ['uuid', 'guid', 'unique', 'id', 'generate'],
  },

  // ── Auth Tools ─────────────────────────────────────────────────────────────
  {
    slug:        'jwt',
    name:        'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens — header, payload, expiry and more.',
    category:    'auth-tools',
    tag:         'auth',
    keywords:    ['jwt', 'token', 'decode', 'auth', 'bearer', 'json web token', 'claims'],
  },

  // ── Web Tools ──────────────────────────────────────────────────────────────
  {
    slug:        'html-formatter',
    name:        'HTML Formatter',
    description: 'Format and minify HTML code for better readability or compactness.',
    category:    'web-tools',
    tag:         'web',
    keywords:    ['html', 'format', 'minify', 'pretty', 'beautify'],
  },
  {
    slug:'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, random passwords with customizable length and character sets.',
    category: 'web-tools',
    tag: 'generate',
    keywords: ['password', 'generate', 'random', 'secure', 'generator'],
  },
  {
    slug:        'regex',
    name:        'Regex Tester',
    description: 'Test regular expressions live against sample text with match highlighting.',
    category:    'text-tools',
    tag:         'text',
    keywords:    ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test'],
  }
]

export const categoryLabels: Record<ToolMeta['category'], string> = {
  'json-tools':     'JSON',
  'encode-tools':   'Encode / Decode',
  'text-tools':     'Text',
  'generate-tools': 'Generators',
  'auth-tools':     'Authentication',
  'web-tools':      'Web',
  'data-tools':     'Data',
  'crypto-tools':   'Crypto',
}