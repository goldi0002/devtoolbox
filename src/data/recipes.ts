import { PipelineStep } from '../utils/pipelineEngine'

export interface RecipeFaq {
  question: string
  answer: string
}

export interface DevRecipe {
  slug: string
  title: string
  shortTitle: string
  metaTitle: string
  metaDescription: string
  category: 'api' | 'auth' | 'data' | 'security'
  targetKeywords: string[]
  sampleInput: string
  steps: PipelineStep[]
  problemSummary: string
  solutionSummary: string
  faqs: RecipeFaq[]
  relatedToolSlugs: string[]
}

export const DEV_RECIPES: DevRecipe[] = [
  {
    slug: 'webhook-payload-inspector',
    title: 'Inspect, Decode & Beautify Webhook Payloads',
    shortTitle: 'Webhook Payload Inspector',
    metaTitle: 'Webhook Payload Inspector — Client-Side JSON & Token Debugger',
    metaDescription: 'Extract, decode base64 bodies, and prettify webhook payloads from Stripe, GitHub, or Shopify entirely in browser memory.',
    category: 'api',
    targetKeywords: [
      'inspect webhook payload',
      'debug webhook json',
      'decode stripe webhook body',
      'client side webhook tester',
      'github webhook parser'
    ],
    sampleInput: `{"id":"evt_123456789","type":"payment_intent.succeeded","data":{"object":{"id":"pi_3MtwBwLkdIwHu7ix28a3tqPa","amount":2000,"currency":"usd","metadata":{"encoded_meta":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDE4OCwidGllciI6InBybyJ9.secret"}}}}`,
    steps: [
      {
        id: 'step-1',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2, sortKeys: false },
      },
      {
        id: 'step-2',
        operationId: 'extract-json-key',
        enabled: true,
        options: { path: 'data.object.metadata.encoded_meta' },
      },
      {
        id: 'step-3',
        operationId: 'jwt-decode',
        enabled: true,
        options: { section: 'payload' },
      },
    ],
    problemSummary: 'Modern SaaS webhooks (Stripe, GitHub, AWS SNS, Shopify) frequently nest base64-encoded strings, JSON metadata blobs, and JWT tokens inside deeply nested JSON trees. Testing them through cloud debuggers leaks private customer and financial data.',
    solutionSummary: 'DevFlow chains JSON parsing, key extraction, and token decoding into a zero-latency pipeline running 100% in local memory with zero server calls.',
    faqs: [
      {
        question: 'Are my webhook payloads or customer tokens sent to any server?',
        answer: 'No. The entire inspection and decoding pipeline runs 100% client-side in your local browser JavaScript engine. No external requests are made.'
      },
      {
        question: 'Can I extract different fields in this webhook pipeline?',
        answer: 'Yes! Simply edit the Key Path option (e.g. change "data.object.metadata" to any dotted path) or add additional transform steps.'
      },
      {
        question: 'Can I share this pipeline recipe with my backend teammates?',
        answer: 'Yes, click "Share Recipe" to generate a shareable URL containing the entire compressed pipeline configuration in the URL hash.'
      }
    ],
    relatedToolSlugs: ['json-formatter', 'jwt', 'base64', 'curl-converter']
  },
  {
    slug: 'jwt-auth-verifier',
    title: 'Unpack, Decode & Fingerprint JWT Auth Tokens',
    shortTitle: 'JWT Auth Token Inspector',
    metaTitle: 'JWT Auth Token Inspector — Client-Side Header, Claims & Hash',
    metaDescription: 'Extract claims from Bearer authentication tokens, validate expiration timestamps, and generate SHA-256 fingerprints in local browser memory.',
    category: 'auth',
    targetKeywords: [
      'jwt auth token inspector',
      'bearer token decoder client side',
      'decode jwt payload without server',
      'jwt sha256 fingerprint',
      'auth token claim inspector'
    ],
    sampleInput: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFseW5hIERldmVsb3BlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk5OTk5OTk5LCJyb2xlcyI6WyJhZG1pbiIsImRldmVsb3BlciJdfQ.4phc9mZ5...`,
    steps: [
      {
        id: 'step-jwt-1',
        operationId: 'jwt-decode',
        enabled: true,
        options: { section: 'payload' },
      },
      {
        id: 'step-jwt-2',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2, sortKeys: true },
      },
    ],
    problemSummary: 'Developers often paste sensitive production JWTs and auth tokens into untrusted third-party websites to inspect permissions, risking credential leakage and session hijacking.',
    solutionSummary: 'ToolBox4Devs guarantees 100% private, client-side JWT unpacking and claim inspection with zero network transmission.',
    faqs: [
      {
        question: 'Does this token debugger verify cryptographic signatures?',
        answer: 'It parses headers and payloads safely using client-side base64url decoding. For HMAC/RSA verification, use our dedicated HMAC and RSA tools.'
      },
      {
        question: 'Will my session credentials be logged in history?',
        answer: 'No server logs exist. All processing occurs in temporary browser memory and is discarded when the tab closes unless you bookmark a shareable link.'
      }
    ],
    relatedToolSlugs: ['jwt', 'hmac-generator', 'sha256', 'base64']
  },
  {
    slug: 'base64-json-unpacker',
    title: 'Base64 to Formatted JSON Transformer',
    shortTitle: 'Base64 JSON Unpacker',
    metaTitle: 'Base64 to Formatted JSON Transformer — Private Client-Side Tool',
    metaDescription: 'Decode base64 and url-safe base64 strings directly into clean, syntax-highlighted, formatted JSON in a single step.',
    category: 'data',
    targetKeywords: [
      'base64 to json',
      'decode base64 to formatted json',
      'base64 json beautifier',
      'url safe base64 to json'
    ],
    sampleInput: `eyJ1c2VySWQiOiJ1c3JfOTA5MiIsInNldHRpbmdzIjp7InRoZW1lIjoiZGFyayIsIm5vdGlmaWNhdGlvbnMiOnsiZW1haWwiOnRydWUsInB1c2giOmZhbHNlfSwiaXBXaGl0ZWxpc3QiOlsicHJvZHVjdGlvbi1hcGkiLCJzdGFnaW5nLWFwaSJdfX0=`,
    steps: [
      {
        id: 'step-b64-1',
        operationId: 'base64-decode',
        enabled: true,
        options: {},
      },
      {
        id: 'step-b64-2',
        operationId: 'json-prettify',
        enabled: true,
        options: { indent: 2, sortKeys: false },
      },
    ],
    problemSummary: 'Database storage, Redis caches, and message queues (Kafka, SQS) often store serialized JSON objects as Base64 strings. Manually running multiple tools to decode and then format is tedious.',
    solutionSummary: 'This pipeline automatically takes the raw Base64 string, decodes it, and formats the output into clean, structured JSON with full syntax checking.',
    faqs: [
      {
        question: 'Does this handle URL-safe Base64 strings?',
        answer: 'Yes, it automatically normalizes "-" and "_" characters and handles missing trailing padding.'
      }
    ],
    relatedToolSlugs: ['base64', 'json-formatter', 'json-to-csv']
  },
  {
    slug: 'server-log-cleaner',
    title: 'Extract & Deduplicate Server Log Errors',
    shortTitle: 'Log Cleaner & Deduplicator',
    metaTitle: 'Server Log Cleaner & Deduplicator — Regex Filter in Browser',
    metaDescription: 'Extract error lines, deduplicate stack trace signatures, and clean messy server log files in browser memory.',
    category: 'data',
    targetKeywords: [
      'extract error lines from log',
      'clean server log files online',
      'deduplicate log entries client side',
      'regex log parser'
    ],
    sampleInput: `2026-10-25 04:12:01 [ERROR] Connection refused: db-replica-1:5432
2026-10-25 04:12:02 [INFO] Healthcheck passed: nginx-gateway
2026-10-25 04:12:05 [ERROR] Connection refused: db-replica-1:5432
2026-10-25 04:12:09 [ERROR] JWT Expired: user_id=9821
2026-10-25 04:12:12 [INFO] Request completed in 14ms
2026-10-25 04:12:15 [ERROR] Connection refused: db-replica-1:5432`,
    steps: [
      {
        id: 'step-log-1',
        operationId: 'regex-extract',
        enabled: true,
        options: { pattern: '\\[ERROR\\].*', flags: 'g' },
      },
      {
        id: 'step-log-2',
        operationId: 'string-clean',
        enabled: true,
        options: { trimLines: true, removeBlank: true, sort: true, unique: true },
      },
    ],
    problemSummary: 'Massive log dumps contain noise and redundant warnings that obscure real production outages.',
    solutionSummary: 'Filter directly by regex (e.g. `\\[ERROR\\].*`), trim whitespace, and sort/deduplicate in real time.',
    faqs: [
      {
        question: 'Can I filter by specific HTTP status codes or IP addresses?',
        answer: 'Yes, customize the regex pattern to match any log format such as Nginx combined log or JSON structured logs.'
      }
    ],
    relatedToolSlugs: ['regex', 'line-sorter', 'text-diff', 'word-counter']
  },
  {
    slug: 'sql-identifier-sanitizer',
    title: 'Sanitize Column & Table Names for Database Migrations',
    shortTitle: 'SQL Identifier Sanitizer',
    metaTitle: 'SQL Identifier Sanitizer — CamelCase to snake_case Batch Tool',
    metaDescription: 'Batch transform frontend camelCase models and JSON keys into Postgres and MySQL compliant snake_case identifiers.',
    category: 'data',
    targetKeywords: [
      'camelcase to snake_case sql',
      'database column naming tool',
      'sanitize sql identifier names',
      'json keys to postgres columns'
    ],
    sampleInput: `userAccountId
billingCycleStartDate
lastFailedLoginTimestamp
paymentMethodToken
stripeSubscriptionId`,
    steps: [
      {
        id: 'step-sql-1',
        operationId: 'case-transform',
        enabled: true,
        options: { targetCase: 'snake' },
      },
      {
        id: 'step-sql-2',
        operationId: 'string-clean',
        enabled: true,
        options: { trimLines: true, removeBlank: true, sort: true, unique: true },
      },
    ],
    problemSummary: 'Frontend JavaScript/TypeScript models use camelCase while relational SQL databases (PostgreSQL, SQLite) convention uses snake_case.',
    solutionSummary: 'Instantly batch convert thousands of model properties into database column definitions with zero manual typing.',
    faqs: [
      {
        question: 'Does this handle acronyms properly?',
        answer: 'Yes, it breaks words at uppercase transitions and normalizes numbers and special symbols into clean underscores.'
      }
    ],
    relatedToolSlugs: ['case-converter', 'json-to-sql', 'sql-formatter']
  }
]

export function getRecipeBySlug(slug: string): DevRecipe | undefined {
  return DEV_RECIPES.find(r => r.slug === slug)
}
