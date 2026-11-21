import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const FAKER_DATA_GENERATOR_META: ToolMeta = {
  slug: 'faker-data-generator',
  name: 'Faker Data Generator',
  description: 'Generate realistic fake names, emails, phones, addresses, IPs, UUIDs, and sentences for testing — entirely in your browser.',
  category: 'generate-tools',
  tag: 'generate',
  keywords: [
    'faker data generator',
    'fake data generator',
    'mock data generator',
    'test data generator',
    'fake names generator',
    'dummy data',
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/FakerDataGenerator')),
  about: {
    summary:
      'Faker Data Generator creates realistic-looking fake data — names, email addresses, phone numbers, physical addresses, company names, IP addresses, hex colors, usernames, sentences, and UUIDs — using a pure client-side pseudo-random number generator. No external libraries, no network requests, no tracking.',
    useCases: [
      'Seeding test databases with realistic-looking records for QA and staging',
      'Populating UI prototypes and demo applications with believable data',
      'Generating CSV fixtures for spreadsheet imports and data pipeline testing',
      'Creating realistic wireframe content for design mockups',
      'Building automated test suites that require non-empty form fields',
    ],
    features: [
      '12 data type categories: names, emails, phones, addresses, companies, dates, IPs, colors, usernames, sentences, UUIDs, or all combined',
      'Three output formats: JSON (nested objects), CSV (ready for spreadsheets), and Lines (one value per line)',
      'Generate up to 100 records at once with a single click',
      'Regenerate button for fresh random data on demand',
      'Global data pools with diverse international names and locations',
      'Zero dependencies — uses only browser-native JavaScript',
      'One-click copy and file download for generated data',
    ],
    tip: 'For the most realistic data, use the "All Fields" mode with JSON output — you get a complete object per record that maps directly to database schemas and API payloads.',
  },
  guide: {
    "steps": [
      {
        "name": "Set the record count",
        "text": "Enter Records (1–100) to choose how many records to generate."
      },
      {
        "name": "Choose a data type",
        "text": "Pick All Fields for complete records, or a single type such as Names, Emails or UUIDs."
      },
      {
        "name": "Choose an output format",
        "text": "Pick JSON, CSV or Lines."
      },
      {
        "name": "Copy or regenerate",
        "text": "Copy the output, or click Regenerate for a fresh set with the same settings."
      }
    ],
    "faqs": [
      {
        "question": "Is the data real?",
        "answer": "No. Names, addresses, companies and other values are random combinations from built-in lists and do not come from any real database."
      },
      {
        "question": "Will two runs give the same data?",
        "answer": "No. Each generation is seeded from the current time, so repeated runs produce different records."
      },
      {
        "question": "What does Lines output contain for All Fields?",
        "answer": "Each record's values joined with \" | \" on one line. A single-type selection gives one value per line."
      },
      {
        "question": "Does CSV include a header row?",
        "answer": "Yes. The first line lists the field names, and values containing commas, quotes or line breaks are quoted."
      }
    ],
    "example": {
      "title": "Generate three full names, one per line.",
      "input": "Records: 3\nData type: Names\nFormat: Lines",
      "output": "Three lines, each with one random full name in the form First Last.",
      "inputLabel": "Settings",
      "outputLabel": "Output"
    }
  },
  addedAt: '2026-08-23',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Faker Data Generator — Generate Realistic Mock Data Online',
    description: 'Generate realistic fake names, emails, phones, and more for testing. Free, runs entirely in your browser with zero dependencies.',
    extraKeywords: [
      'fake data generator online',
      'mock data generator',
      'test data generator free',
      'generate fake names',
      'fake email generator',
      'dummy data creator',
      'random data generator',
      'json mock data',
      'csv test data',
    ],
  },
}
