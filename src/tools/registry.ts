
import { lazy } from "react"
export interface ToolAbout {
  summary: string
  useCases: string[]
  features: string[]
  tip?: string
}
export interface ToolMeta {
  slug: string
  name: string
  description: string
  about: ToolAbout
  category: 'json-tools' | 'encode-tools' | 'text-tools' | 'generate-tools' | 'auth-tools' | 'web-tools' | 'data-tools' | 'crypto-tools'
  tag: string
  keywords: string[],
  commingSoon?: boolean,
  eta?: string, // e.g. "Q2 2025"
  toolComponent?: React.ComponentType
}

export const tools: ToolMeta[] = [
  // ── JSON Tools ─────────────────────────────────────────────────────────────
  {
    slug:        'json-formatter',
    name:        'JSON Formatter & Validator',
    description: 'Format, validate and minify JSON instantly — paste your JSON to beautify it, spot syntax errors, or compress it. Free, runs entirely in your browser.',
    category:    'json-tools',
    tag:         'json',
    toolComponent: lazy(() => import('../components/tools/json-tools/JsonFormatter')),
    keywords:    [
      'json formatter',
      'json validator',
      'json beautifier',
      'format json online',
      'json pretty print',
      'minify json',
      'json syntax checker',
      'json viewer',
      'json lint',
      'beautify json',
    ],
    about: {
      summary:
        'JSON Formatter & Validator instantly formats raw or minified JSON into clean, readable output with proper indentation. It validates your JSON in real time and pinpoints syntax errors — missing commas, unclosed brackets, incorrect quotes — so you can fix them fast. Everything runs in your browser, no data is sent anywhere.',
      useCases: [
        'Formatting minified API responses into readable, indented JSON',
        'Validating JSON payloads before sending them to a server or saving to a file',
        'Minifying JSON to reduce payload size for production use',
        'Finding syntax errors like missing commas, extra brackets, or unquoted keys',
        'Cleaning up JSON copied from logs, terminal output, or debugging tools',
        'Quickly inspecting the structure of an unfamiliar JSON response',
      ],
      features: [
        'Format with 2 or 4 space indentation — your choice',
        'Minify to a single compact line with no whitespace',
        'Real-time syntax validation with clear, precise error messages',
        'Works with deeply nested objects and large JSON files',
        'Copy formatted or minified output with one click',
        'No data leaves your browser — 100% client-side',
      ],
      tip: 'If you\'re comparing two JSON responses, format both here first then paste them into the Text Diff tool — whitespace differences won\'t pollute your diff results.',
    },
  },
  {
    slug: 'json-model',
    name: 'JSON → Model',
    description: 'Convert JSON to C# classes or TypeScript interfaces with proper types.',
    category: 'json-tools',
    tag: 'codegen',
    keywords: ['json', 'model', 'csharp', 'typescript', 'interface', 'class'],
    toolComponent: lazy(() => import('../components/tools/json-tools/JsonModelGenerator')),
    about: {
      summary:
        'JSON Model Generator converts any JSON object into strongly-typed code — TypeScript interfaces or C# classes — in one click. Instead of manually writing types from an API response, paste the JSON and get production-ready type definitions instantly.',
      useCases: [
        'Generating TypeScript interfaces from a REST API response',
        'Creating C# model classes from a JSON payload or config file',
        'Bootstrapping types when integrating a new third-party API',
        'Keeping your types in sync with the actual shape of your data',
        'Speeding up backend and frontend development setup',
      ],
      features: [
        'Generates TypeScript interfaces with correct primitive types',
        'Generates C# classes with proper type annotations',
        'Handles nested objects and arrays automatically',
        'Infers types from values — string, number, boolean, null',
        'Copy generated code with one click',
      ],
      tip: 'Paste a real API response rather than a hand-crafted example — the generator picks up optional fields and mixed types more accurately from real data.',
    },
  },

  // ── Encode Tools ───────────────────────────────────────────────────────────
  {
    slug: 'base64',
    name: 'Base64',
    description: 'Encode plain text to Base64 or decode Base64 back to plain text.',
    category: 'encode-tools',
    tag: 'encode',
    keywords: ['base64', 'encode', 'decode', 'string'],
    toolComponent: lazy(() => import('../components/tools/encode-tools/Base64Tool')),
    about: {
      summary:
        'Base64 is an encoding scheme that converts binary or text data into a string of ASCII characters. It\'s widely used to safely transmit data in URLs, HTTP headers, email, and data URIs. This tool encodes any text to Base64 and decodes Base64 strings back to their original form instantly.',
      useCases: [
        'Encoding credentials for HTTP Basic Authentication headers',
        'Embedding small images or fonts as data URIs in CSS or HTML',
        'Encoding binary data for safe transmission in JSON payloads',
        'Decoding Base64 strings received from APIs or email headers',
        'Inspecting Base64-encoded tokens or configuration values',
      ],
      features: [
        'Encode plain text or ASCII to Base64 instantly',
        'Decode Base64 strings back to human-readable text',
        'Live conversion as you type — no button needed',
        'Handles padding characters (=) automatically',
        'Copy encoded or decoded output with one click',
      ],
      tip: 'Base64 is encoding, not encryption — it\'s not secure on its own. Never use it to hide sensitive data like passwords.',
    },
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URLs and query string parameters instantly in your browser.',
    category: 'encode-tools',
    tag: 'encode',
    keywords: ['url', 'encode', 'decode', 'uri', 'query', 'percent encoding'],
    toolComponent: lazy(() => import('../components/tools/encode-tools/UrlEncoderDecoder')),
    about: {
      summary:
        'URL Encoder converts special characters in a URL into percent-encoded format so they can be safely transmitted over the web. URL Decoder reverses this — turning encoded strings like %20 back into readable text. Essential for working with query parameters, API endpoints, and web forms.',
      useCases: [
        'Encoding query string values that contain spaces or special characters',
        'Decoding percent-encoded URLs from logs or browser address bars',
        'Building API requests with special characters in parameters',
        'Debugging URL routing issues in web applications',
        'Encoding form data before submitting via GET requests',
      ],
      features: [
        'Two modes — encodeURIComponent for query values, encodeURI for full URLs',
        'Decode percent-encoded strings back to plain text',
        'Live conversion as you type',
        'Swap button — flip encoded output back to input instantly',
        'Common encoding reference table for quick lookup',
      ],
      tip: 'Use encodeURIComponent for individual query values (it encodes & = ? too). Use encodeURI only for full URLs where you want to preserve the URL structure characters.',
    },
  },

  // ── Text Tools ─────────────────────────────────────────────────────────────
  {
    slug: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two text blocks line-by-line and highlight every change.',
    category: 'text-tools',
    tag: 'diff',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes'],
    toolComponent: lazy(() => import('../components/tools/text-tools/TextDiff')),
    about: {
      summary:
        'Text Diff compares two blocks of text line-by-line and highlights exactly what changed — additions in green, deletions in red. Useful for comparing code snippets, configuration files, API responses, or any two pieces of text where you need to spot differences fast.',
      useCases: [
        'Comparing two versions of a config file or environment variables',
        'Spotting differences between two API responses',
        'Reviewing changes in SQL queries or script outputs',
        'Comparing translated text against the original source',
        'Identifying what changed between two log outputs',
      ],
      features: [
        'Line-by-line diff with added and removed lines highlighted',
        'Side-by-side or unified diff view',
        'Shows unchanged lines for context',
        'Works with any plain text — code, JSON, markdown, logs',
        'Diff summary showing total additions and deletions',
      ],
      tip: 'For comparing JSON, format both sides with the JSON Formatter first — that way whitespace differences don\'t create false positives in the diff.',
    },
  },

  // ── Generate Tools ─────────────────────────────────────────────────────────
  {
    slug: 'uuid',
    name: 'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs one at a time or in bulk up to 100.',
    category: 'generate-tools',
    tag: 'generate',
    keywords: ['uuid', 'guid', 'unique', 'id', 'generate'],
    toolComponent: lazy(() => import('../components/tools/generate-tools/UuidGenerator')),
    about: {
      summary:
        'UUID Generator creates version 4 UUIDs (Universally Unique Identifiers) using cryptographically secure random values. UUIDs are 128-bit identifiers used across databases, APIs, and distributed systems to uniquely identify records without a central coordination authority.',
      useCases: [
        'Generating primary keys for database records',
        'Creating unique identifiers for API resources or events',
        'Seeding test data with realistic-looking IDs',
        'Generating correlation IDs for distributed tracing',
        'Creating unique filenames, session tokens, or idempotency keys',
      ],
      features: [
        'Generates RFC 4122 compliant version 4 UUIDs',
        'Bulk generation — up to 100 UUIDs at once',
        'Uses crypto.getRandomValues for cryptographic randomness',
        'Copy individual UUIDs or the entire batch',
        'Uppercase and lowercase format options',
      ],
      tip: 'UUID v4 is randomly generated with no embedded timestamp or machine identity — making it safe to use in public-facing systems without leaking any server information.',
    },
  },

  // ── Auth Tools ─────────────────────────────────────────────────────────────
  {
    slug: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens — header, payload, expiry and more.',
    category: 'auth-tools',
    tag: 'auth',
    keywords: ['jwt', 'token', 'decode', 'auth', 'bearer', 'json web token', 'claims'],
    toolComponent: lazy(() => import('../components/tools/auth-tools/JwtDecoder')),
    about: {
      summary:
        'JWT Decoder splits any JSON Web Token into its three parts — header, payload, and signature — and displays them in a readable format. Instantly inspect claims, check expiry times, and understand token structure without needing a secret key or writing any code.',
      useCases: [
        'Debugging authentication issues in your API or frontend app',
        'Checking whether a token has expired without writing code',
        'Inspecting claims returned by OAuth providers like Google or Auth0',
        'Verifying what roles, scopes, or permissions a token contains',
        'Understanding JWT structure while learning about authentication',
      ],
      features: [
        'Decodes header, payload, and signature into separate readable sections',
        'Shows expiry (exp) and issued-at (iat) as human-readable dates',
        'Highlights expired tokens automatically',
        'Displays all claims in a clean formatted layout',
        'Works with HS256, RS256, and all common JWT algorithms',
      ],
      tip: 'Your token never leaves your browser — all decoding happens locally using JavaScript. It\'s safe to paste real tokens here during debugging.',
    },
  },

  // ── Web Tools ──────────────────────────────────────────────────────────────
  {
    slug: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format and minify HTML code for better readability or compactness.',
    category: 'web-tools',
    tag: 'web',
    keywords: ['html', 'format', 'minify', 'pretty', 'beautify'],
    toolComponent: lazy(() => import('../components/tools/web-tools/HtmlFormatter')),
    about: {
      summary:
        'HTML Formatter uses Prettier under the hood to format messy or minified HTML into clean, properly indented markup. It also minifies HTML by stripping whitespace and comments — useful for optimizing templates before deploying to production.',
      useCases: [
        'Beautifying minified HTML from a CMS or build tool output',
        'Formatting HTML email templates for easier editing',
        'Cleaning up hand-written HTML with inconsistent indentation',
        'Minifying HTML templates to reduce page size',
        'Preparing HTML snippets for documentation or code reviews',
      ],
      features: [
        'Powered by Prettier — the industry standard code formatter',
        'Minify HTML by collapsing whitespace and removing comments',
        'Choose 2 or 4 space indentation',
        'Handles inline elements, void elements, and deep nesting correctly',
        'Formats embedded <style> and <script> blocks too',
        'Copy formatted output with one click',
      ],
      tip: 'Prettier also formats embedded CSS inside <style> tags and JavaScript inside <script> tags — so the entire HTML file gets cleaned up in one pass.',
    },
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, random passwords with customizable length and character sets.',
    category: 'generate-tools',
    tag: 'generate',
    keywords: ['password', 'generate', 'random', 'secure', 'generator'],
    toolComponent: lazy(() => import('../components/tools/generate-tools/PasswordGenerator')),
    about: {
      summary:
        'Password Generator creates cryptographically secure random passwords using the browser\'s built-in Web Crypto API. Customize the length, character sets, and excluded characters to match any password policy — and use the strength meter to verify the result before using it.',
      useCases: [
        'Generating strong passwords for new accounts or services',
        'Creating passwords that meet specific character set requirements',
        'Generating API keys or shared secrets for internal tools',
        'Producing test credentials for staging environments',
        'Replacing weak or reused passwords with secure alternatives',
      ],
      features: [
        'Cryptographically secure using crypto.getRandomValues — not Math.random',
        'Customizable length from 4 to 64 characters',
        'Toggle uppercase, lowercase, numbers, and symbols independently',
        'Exclude ambiguous characters like 0, O, l, 1 to avoid confusion',
        'Strength meter — Weak to Very Strong rating',
        'History of last 10 generated passwords, each individually copyable',
      ],
      tip: 'A 16+ character password with all character types enabled has over 80 bits of entropy — effectively impossible to brute force with any current hardware.',
    },
  },
  {
    slug: 'regex',
    name: 'Regex Tester',
    description: 'Test regular expressions live against sample text with match highlighting.',
    category: 'text-tools',
    tag: 'text',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test'],
    toolComponent: lazy(() => import('../components/tools/text-tools/RegexTester')),
    about: {
      summary:
        'Regex Tester allows you to write and test regular expressions against sample text in real time. As you type your regex pattern, it highlights matches in the sample text and shows captured groups. Perfect for debugging complex regexes or learning how they work.',
      useCases: [
        'Testing regex patterns for form validation',
        'Debugging regexes used in code or configuration files',
        'Learning regex syntax by seeing live matches',
        'Extracting specific data from text using capture groups',
        'Comparing different regex patterns to find the most efficient one',
      ],
      features: [
        'Live match highlighting as you type your regex pattern',
        'Supports all standard JavaScript regex features',
        'Displays captured groups separately for easy inspection',
        'Toggle global (g), case-insensitive (i), and multiline (m) flags',
        'Copy your regex pattern or the matched results with one click',
      ],
      tip: 'Start with a simple regex and gradually build it up — the live feedback helps you understand how each part of the pattern works.',
    }
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Write Markdown on the left and see a live preview on the right.',
    category: 'web-tools',
    tag: 'web',
    keywords: ['markdown', 'preview', 'render', 'format', 'md'],
    commingSoon: true,
    eta: 'Q4 2024',
    about: {
      summary:
        'Markdown Preview renders your Markdown text into formatted HTML in real time. As you write Markdown syntax on the left, you see a live preview of how it will look when rendered — perfect for writing README files, documentation, or any Markdown content.',
      useCases: [
        'Writing and previewing README.md files for GitHub projects',
        'Creating documentation with headings, lists, code blocks, and more',
        'Drafting blog posts or articles in Markdown format',
        'Learning Markdown syntax with instant visual feedback',
        'Testing how different Markdown features render before using them in production',
      ],
      features: [
        'Live preview updates as you type your Markdown text',
        'Supports all standard Markdown syntax — headings, lists, links, images, code blocks, etc.',
        'Renders GitHub Flavored Markdown features like task lists and tables',
        'Copy the rendered HTML output with one click',
      ],
      tip: 'Use the preview to check how your Markdown will render on platforms like GitHub — especially for complex elements like tables or nested lists.',
    }
  },
  {
    slug:'sha256',
    name: 'SHA-256 Hash Generator',
    description: 'Generate a SHA-256 hash from any input string instantly in your browser.',
    category: 'crypto-tools',
    tag: 'crypto',
    keywords: ['sha256', 'hash', 'crypto', 'checksum', 'digest'],
    toolComponent: lazy(() => import('../components/tools/crypto-tools/SHA256')),
    about: {
      summary:
        'SHA-256 Hash Generator creates a unique, fixed-length 256-bit (32-byte) hash from any input string using the SHA-256 algorithm. It\'s widely used for data integrity checks, password hashing, and cryptographic applications. This tool generates the hash instantly in your browser without sending your data anywhere.',
      useCases: [
        'Generating a hash of a password or secret before storing it',
        'Creating a checksum to verify file integrity',
        'Hashing API keys or tokens for secure storage',
        'Testing how different inputs produce different hashes',
        'Learning about cryptographic hashing with live examples',
      ],
      features: [
        'Generates SHA-256 hashes using the Web Crypto API',
        'Instantly produces a 64-character hexadecimal hash string',
        'Works entirely in the browser — no data is transmitted',
        'Copy the generated hash with one click',
      ],
      tip: 'SHA-256 is a one-way hashing algorithm — you can\'t reverse it back to the original input. It\'s designed for security and integrity, not encryption.',
    }
  }
]

export const categoryLabels: Record<ToolMeta['category'], string> = {
  'json-tools': 'JSON',
  'encode-tools': 'Encode / Decode',
  'text-tools': 'Text',
  'generate-tools': 'Generators',
  'auth-tools': 'Authentication',
  'web-tools': 'Web',
  'data-tools': 'Data',
  'crypto-tools': 'Crypto',
}