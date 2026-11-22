import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const ULID_UUIDV7_GENERATOR_META: ToolMeta = {
  slug: 'ulid-uuidv7-generator',
  name: 'ULID & UUID v7 Generator',
  description: 'Generate time-sortable ULID and RFC 9562 UUID v7 identifiers with monotonic ordering, and decode timestamps from any ULID or UUID.',
  category: 'generate-tools',
  tag: 'id',
  icon: 'Hash',
  keywords: [
    'ulid generator',
    'uuid v7 generator',
    'uuidv7 online',
    'ulid decoder',
    'uuid v7 timestamp decoder',
    'time sortable id',
    'rfc 9562 uuid',
    'monotonic ulid',
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/UlidUuidv7Generator')),
  about: {
    summary:
      'ULID & UUID v7 Generator creates lexicographically time-sortable 128-bit identifiers using your browser\'s cryptographic random generator. Both ULID (26-character Crockford Base32) and UUID v7 (RFC 9562) embed a 48-bit Unix millisecond timestamp in their most significant bits, keeping B-tree database indexes sequential while staying globally unique. An integrated inspector decodes embedded timestamps and converts seamlessly between 128-bit ULID, UUID, and hex representations.',
    useCases: [
      'Generating sequential database primary keys (PostgreSQL, SQLite, DynamoDB) without B-tree page splits',
      'Creating monotonic batch fixtures where IDs generated in the same millisecond still sort in creation order',
      'Decoding the exact UTC creation timestamp embedded inside a production ULID or UUID v7',
      'Converting a 128-bit ULID to its equivalent hyphenated UUID representation or raw hex',
    ],
    features: [
      'Generates ULIDs (26-char Crockford Base32) and RFC 9562 UUID v7s in batches of up to 100',
      'Monotonic mode increments the random component within the same millisecond to guarantee strict sort order',
      'Optional custom Unix millisecond timestamp pinning for deterministic test data',
      'Export generated batches as plain lines, a JSON array, or SQL VALUES tuples',
      'Built-in ULID & UUID Inspector supporting timestamp decoding and ULID <-> UUID 128-bit conversion',
      '100% browser-side crypto.getRandomValues() execution',
    ],
    tip: 'Prefer UUID v7 when your database already has a native 128-bit uuid column type (such as PostgreSQL); prefer ULID when you want shorter, URL-friendly 26-character strings without hyphens.',
  },
  addedAt: '2026-11-21',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'ULID & UUID v7 Generator & Inspector — Time-Sortable IDs Online',
    description: 'Generate monotonic ULIDs and RFC 9562 UUID v7 identifiers, decode embedded millisecond timestamps, and convert ULID to UUID. Free and 100% client-side.',
    extraKeywords: [
      'ulid generator online',
      'uuidv7 generator online',
      'decode ulid timestamp',
      'ulid to uuid converter',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Choose ULID or UUID v7',
        text: 'Select ULID for 26-character Crockford Base32 strings or UUID v7 for standard 36-character hyphenated RFC 9562 UUIDs.',
      },
      {
        name: 'Configure batch and ordering options',
        text: 'Set how many IDs to generate (1–100), toggle Monotonic ordering to guarantee strict sort order within the same millisecond, and optionally pin a custom Unix timestamp.',
      },
      {
        name: 'Copy in your preferred format',
        text: 'Switch between Lines, JSON Array, and SQL VALUES formats and copy individual IDs or the entire batch.',
      },
      {
        name: 'Inspect or decode any ID',
        text: 'Click Inspect next to a generated ID or paste any ULID or UUID into the Inspector to decode its embedded Unix millisecond timestamp, UTC date, and equivalent 128-bit form.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between ULID and UUID v7?',
        answer: 'Both pack a 48-bit Unix millisecond timestamp followed by randomness into 128 bits. ULID encodes those 128 bits as 26 Crockford Base32 characters (case-insensitive, no hyphens), whereas UUID v7 uses standard 36-character hex with RFC 9562 version (7) and variant (10xx) bits.',
      },
      {
        question: 'What does Monotonic ordering do?',
        answer: 'When multiple IDs are generated within the same millisecond, monotonic mode keeps the timestamp fixed and increments the random bits by 1 for each subsequent ID, guaranteeing they sort strictly in generation order.',
      },
      {
        question: 'Can I extract a timestamp from a UUID v4?',
        answer: 'No. UUID v4 is purely random (aside from version and variant bits), so it contains no timestamp. The Inspector identifies UUID v4 and displays its raw hex without a date.',
      },
      {
        question: 'Are generated IDs sent anywhere?',
        answer: 'No. All random bytes come from crypto.getRandomValues() in your browser and never leave your device.',
      },
    ],
    example: {
      title: 'Inspect an RFC 9562 UUID v7 to extract its embedded timestamp.',
      input: '018f3f4a-1b2c-7000-8000-000000000001',
      output: 'Type: UUID v7 (RFC 9562 Unix Epoch Time-Ordered)\nTimestamp (ms): 1714753772332\nUTC Date: 2024-05-03T16:29:32.332Z',
      inputLabel: 'UUID v7',
      outputLabel: 'Decoded metadata',
    },
  },
}
