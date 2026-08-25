import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const NUMBER_TO_WORDS_META: ToolMeta = {
  slug: 'number-to-words',
  name: 'Number to Words Converter',
  description: 'Convert numbers into English words — supports decimals, negative values, and magnitudes up to 999 trillion.',
  category: 'data-tools',
  tag: 'data',
  keywords: [
    'number to words',
    'numbers to english',
    'spell out numbers',
    'number to text',
    'integer to words',
    'decimal to words',
    'write numbers in words',
    'amount in words',
  ],
  toolComponent: lazy(() => import('../../components/tools/data-tools/NumberToWords')),
  about: {
    summary: 'The Number to Words Converter spells any number out in English words, including decimals and negative values, with support for magnitudes up to 999 trillion. All conversion happens locally in your browser — perfect for checks, invoices, and educational use.',
    useCases: [
      'Writing amounts in words for cheques, invoices, and contracts.',
      'Helping with numeracy and English-language learning.',
      'Generating human-readable labels from numeric identifiers.',
      'Verbalizing numeric values for accessibility and voice scripts.',
    ],
    features: [
      'Handles integers, decimals, and negative numbers.',
      'Supports magnitudes from units up to trillions.',
      'Decimal digits spelled individually (e.g. 1.25 → one point two five).',
      'Live word count and validation feedback.',
    ],
    tip: 'Decimal portions are spelled digit-by-digit (1.25 → "one point two five"), which is the standard for financial and technical contexts.',
  },
  addedAt: '2026-08-21',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Number to Words Converter — Spell numbers in English in your browser',
    description: 'Convert any number into English words, including decimals and negatives, up to 999 trillion — instant, private, and 100% client-side.',
    extraKeywords: [
      'number to english words',
      'spell number in words',
      'convert number to text',
      'amount in words converter',
      'number spelling',
    ],
  },
}
