import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CASE_CONVERTER_META: ToolMeta = {
  slug: 'case-converter',
  name: 'Case Converter',
  description: 'Convert text between uppercase, lowercase, camelCase, snake_case, kebab-case and more.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'case converter',
    'camel case converter',
    'snake case converter',
    'kebab case converter',
    'uppercase lowercase converter',
    'text case formatter',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/CaseConverter')),
  about: {
    summary: 'Case Converter transforms plain text, slugs, and variable names into common formats used across apps and codebases. Switch between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and kebab-case instantly in the browser.',
    useCases: [
      'Converting API field names into camelCase or snake_case',
      'Turning headings into URL-friendly kebab-case slugs',
      'Cleaning up copy for titles, labels, and sentence case',
      'Refactoring variable names between frontend and backend naming styles',
    ],
    features: [
      'Eight built-in case modes for writing, URLs, and code',
      'Works with phrases, existing camelCase text, slugs, and underscored names',
      'Live conversion as you type with one-click copy',
      'Character and word counts for quick editing feedback',
    ],
    tip: 'Paste an existing variable like userProfileURL or api_response_name — the converter will split common casing and separator patterns automatically.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Case Converter — Convert text to camelCase, snake_case, kebab-case and more',
    description: 'Convert text between uppercase, lowercase, title case, camelCase, PascalCase, snake_case and kebab-case instantly in your browser.',
    extraKeywords: [
      'title case converter',
      'sentence case converter',
      'pascal case converter',
      'case formatter online',
    ],
  },
}
