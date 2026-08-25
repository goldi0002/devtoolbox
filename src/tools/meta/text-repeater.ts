import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TEXT_REPEATER_META: ToolMeta = {
  slug: 'text-repeater',
  name: 'Text Repeater & Multiplier',
  description: 'Replicate and repeat text, characters, or strings up to thousands of times with custom separators and formatting options.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'text repeater',
    'repeat text online',
    'string replicator',
    'text replicator',
    'text multiplier',
    'repeat text 1000 times',
    'duplicate text generator',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/TextRepeater')),
  about: {
    summary: 'Text Repeater is a fast, highly-customizable text replication tool. Perfect for developers, QA engineers, and designers who need to generate bulk strings, mock data, repeat characters for dividers, or stress-test form fields with massive inputs.',
    useCases: [
      'Stress testing inputs and textarea fields with large amounts of repeated text',
      'Generating long visual dividers or layout boundary strings',
      'Creating bulk text strings for performance and rendering testing',
      'Repeating emoji strings or characters for decorative uses',
    ],
    features: [
      'Repeat any text up to 50,000 times instantly',
      'Multiple separator options (newline, space, tab, comma, custom string, or none)',
      'Add line numbers or item indexes to repeated segments',
      'One-click clipboard copy and text stats (characters, lines, size in KB/MB)',
      'Option to trim trailing whitespace or separators',
    ],
    tip: 'Toggle the "Prefix / Numbering" option to prefix each repetition, making it easy to create numbered list structures or track iterations.',
  },
  addedAt: '2026-08-22',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Text Repeater — Replicate and repeat text 1000+ times',
    description: 'Replicate and repeat any text, word, or character thousands of times. Fully customizable with newline, space, custom separators, and item numbering.',
    extraKeywords: [
      'online text repeater',
      'word repeater tool',
      'bulk text multiplier',
      'string doubler',
    ],
  },
}
