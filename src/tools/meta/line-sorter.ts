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
  guide: {
    "steps": [
      {
        "name": "Paste your lines",
        "text": "Paste one item per line into Input lines. The sorted output updates as you type."
      },
      {
        "name": "Pick a sort order",
        "text": "Choose A → Z, Z → A, By Length (shortest first, ties alphabetical) or Natural, which orders numbers inside lines by value."
      },
      {
        "name": "Set the clean-up options",
"text": "Remove duplicates, Trim whitespace, Remove empty lines and Case-insensitive are on by default; untick any you do not want. Case-insensitive applies to every sort mode, including Natural."
      },
      {
        "name": "Copy the result",
        "text": "Copy the sorted output. The counters show input lines, output lines and how many were removed."
      }
    ],
    "faqs": [
      {
        "question": "Which copy of a duplicate is kept?",
        "answer": "Duplicates are removed after sorting, so the first one in sorted order is kept. With Case-insensitive on, Apple and apple count as duplicates."
      },
      {
        "question": "Why does file10 come before file2?",
        "answer": "A → Z compares text character by character, so 1 sorts before 2. Use Natural to order file1, file2, file10 by their numbers."
      },
      {
        "question": "Does Case-insensitive apply to Natural sort too?",
        "answer": "Yes. Case-insensitive affects all four modes. With it off in Natural, numbers still order by value but lines that differ only by case are ordered by case instead of being treated as equal."
      },
      {
        "question": "Does trimming happen before sorting?",
        "answer": "Yes. With Trim whitespace on, leading and trailing spaces are removed first, so indentation does not change where a line ends up, and By Length measures the trimmed text."
      },
      {
        "question": "Are whitespace-only lines removed?",
        "answer": "When both Trim whitespace and Remove empty lines are on, yes: the line is trimmed to nothing and then dropped."
      }
    ],
    "example": {
      "title": "Sort and dedupe a list with the default options.",
      "input": "banana\nApple\ncherry\napple\n  Banana\n\ndate",
      "output": "Apple\nbanana\ncherry\ndate",
      "inputLabel": "Input lines",
      "outputLabel": "Sorted output"
    }
  },
}
