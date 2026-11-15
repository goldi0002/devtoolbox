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
  guide: {
    "steps": [
      {
        "name": "Enter a timestamp or date",
        "text": "Paste Unix seconds, Unix milliseconds, an ISO 8601 string or a regular date string."
      },
      {
        "name": "Or use the current time",
        "text": "Click \"Use current time\" to load the present moment."
      },
      {
        "name": "Read every format at once",
        "text": "See Unix seconds, milliseconds, ISO 8601, UTC and your local date and time side by side."
      },
      {
        "name": "Copy the one you need",
        "text": "Each format has its own copy button."
      }
    ],
    "faqs": [
      {
        "question": "What is a Unix timestamp?",
        "answer": "The number of seconds since 1 January 1970 00:00:00 UTC, not counting leap seconds. It is the same everywhere in the world, which makes it a common way to store time."
      },
      {
        "question": "How do I tell seconds from milliseconds?",
        "answer": "Current timestamps in seconds have 10 digits, and in milliseconds 13. JavaScript's Date.now() returns milliseconds; most Unix tools, databases and JWT claims use seconds."
      },
      {
        "question": "Are Unix timestamps affected by time zones?",
        "answer": "No. A timestamp is always UTC. Time zones only matter when it is displayed, which is why this tool shows both UTC and your local time."
      },
      {
        "question": "What is the year 2038 problem?",
        "answer": "Systems that store timestamps as signed 32-bit integers overflow on 19 January 2038. Software using 64-bit timestamps is not affected."
      }
    ],
    "example": {
      "title": "Convert a Unix timestamp in seconds.",
      "input": "1710460800",
      "output": "Unix milliseconds: 1710460800000\nISO 8601: 2024-03-15T00:00:00.000Z\nUTC: Fri, 15 Mar 2024 00:00:00 GMT",
      "inputLabel": "Unix seconds",
      "outputLabel": "Converted"
    }
  },
}
