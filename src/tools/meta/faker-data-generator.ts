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
