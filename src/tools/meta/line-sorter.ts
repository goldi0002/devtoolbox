import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const LINE_SORTER_META: ToolMeta = {
  slug: 'line-sorter',
  name: 'Line Sorter & Deduplicator',
  description: 'Sort lines alphabetically, by length, or naturally — remove duplicates, trim whitespace, and drop empty lines.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'line sorter',
    'sort lines',
    'remove duplicate lines',
    'deduplicate lines',
    'alphabetical sort',
    'natural sort',
    'line deduplicator',
    'remove empty lines',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/LineSorter')),
  about: {
    summary: 'The Line Sorter & Deduplicator cleans up lists of text by sorting lines alphabetically, by length, or with natural numeric ordering, while optionally removing duplicate and empty lines. Everything runs instantly in your browser with no data leaving your device.',
    useCases: [
      'Cleaning up exported keyword or URL lists before processing.',
      'Deduplicating log entries, IDs, or email addresses.',
      'Sorting configuration keys, hosts, or file lists into a predictable order.',
      'Tidying pasted CSV column values or code snippets for review.',
    ],
    features: [
      'Four sort modes: A→Z, Z→A, by length, and natural numeric ordering.',
      'Optional duplicate removal, whitespace trimming, and empty-line stripping.',
      'Case-insensitive or case-sensitive sorting and deduplication.',
      'Live input/output line counts and removed-line counter.',
    ],
    tip: 'Use Natural sort when your lines contain numbers (e.g. file1, file2, file10) so they order like a human expects.',
  },
  addedAt: '2026-08-21',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Line Sorter & Deduplicator — Sort and dedupe text lines in your browser',
    description: 'Sort lines alphabetically, by length, or naturally and remove duplicates and empty lines — 100% client-side, instant, and private.',
    extraKeywords: [
      'sort text lines online',
      'remove duplicate lines online',
      'dedupe lines',
      'alphabetical line sorter',
      'natural sort lines',
    ],
  },
}
