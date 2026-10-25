import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const MARKDOWN_TABLE_TO_JSON_META: ToolMeta = {
  slug: 'markdown-table-to-json',
  name: 'Markdown Table to JSON',
  category: 'text-tools',
  tag: 'text',
  description: 'Convert GitHub-flavored Markdown tables into JSON objects with typed values.',
  keywords: [
    'markdown table to json',
    'markdown to json',
    'table to json',
    'github markdown table converter',
    'markdown table parser',
    'readme table to json',
  ],
  status: 'stable',
  isNew: true,
  complexity: 'simple',
  addedAt: '2026-10-25',
  toolComponent: lazy(() => import('../../components/tools/text-tools/MarkdownTableToJson')),
  about: {
    summary: 'Turn Markdown tables from READMEs, documentation, or LLM outputs into JSON objects keyed by the table headers.',
    useCases: [
      'Converting GitHub README tables into structured JSON',
      'Reusing documentation tables as application data',
      'Parsing tabular examples from generated text',
    ],
    features: [
      'Parses GitHub-flavored header and separator rows',
      'Handles optional outer pipes, loose spacing, and escaped pipes',
      'Detects numbers, booleans, and null while preserving other values as strings',
    ],
    tip: 'Numeric-looking values with leading zeroes, such as 0012, remain strings to preserve identifiers.',
  },
  seo: {
    title: 'Markdown Table to JSON Converter — ToolBox4Devs',
    description: 'Convert Markdown tables from READMEs and documentation into JSON objects. Handles escaped pipes and detects numbers, booleans, and null values.',
  },
}