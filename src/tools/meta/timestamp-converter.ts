import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TIMESTAMP_CONVERTER_META: ToolMeta = {
  slug: 'timestamp-converter',
  name: 'Timestamp Converter',
  description: 'Convert Unix timestamps, ISO dates, and local date strings instantly in your browser.',
  category: 'data-tools',
  tag: 'data',
  keywords: [
    'timestamp converter',
    'unix timestamp converter',
    'epoch converter',
    'iso date converter',
    'date to unix timestamp',
    'timestamp to date',
  ],
  toolComponent: lazy(() => import('../../components/tools/data-tools/TimestampConverter')),
  about: {
    summary: 'Timestamp Converter parses Unix timestamps in seconds or milliseconds, plus ISO and browser-readable date strings, then shows the equivalent UTC, ISO, and local-time formats. It is useful when debugging APIs, logs, JWT claims, and scheduled jobs.',
    useCases: [
      'Checking exp and iat values from JWT payloads',
      'Converting log timestamps into local time during incident debugging',
      'Verifying scheduled job times across UTC and local zones',
      'Turning a human-readable date into epoch milliseconds for scripts and tests',
    ],
    features: [
      'Accepts Unix seconds, Unix milliseconds, ISO strings, and standard date strings',
      'Shows UTC, ISO 8601, local date/time, and raw Unix outputs together',
      'One-click copy for every output format',
      'Runs completely client-side in the browser with no backend calls',
    ],
    tip: 'Most JWT exp values are Unix seconds, while many JavaScript APIs use milliseconds. This tool shows both so you can spot unit mistakes quickly.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Timestamp Converter — Convert Unix timestamps and dates online',
    description: 'Convert Unix timestamps, epoch milliseconds, ISO strings, and local date values instantly in your browser.',
    extraKeywords: [
      'epoch time converter',
      'unix time to date',
      'date to epoch milliseconds',
      'timestamp formatter online',
    ],
  },
}
