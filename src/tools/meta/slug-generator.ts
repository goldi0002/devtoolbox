import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const SLUG_GENERATOR_META: ToolMeta = {
  slug: 'slug-generator',
  name: 'Slug Generator',
  description: 'Convert titles and labels into clean kebab-case or snake_case slugs entirely in your browser.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'slug generator',
    'url slug generator',
    'kebab case slug',
    'snake case slug',
    'seo slug tool',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/SlugGenerator')),
  about: {
    summary: 'Slug Generator turns headings, article titles, and arbitrary labels into URL-safe slugs without sending anything to a server. Use it for blog routes, CMS entries, internal IDs, or anywhere you need a predictable lowercase identifier.',
    useCases: [
      'Creating SEO-friendly blog or documentation URLs',
      'Generating stable keys for content collections and config files',
      'Standardizing category, tag, and navigation labels',
      'Quickly converting copied titles into routing-friendly strings',
    ],
    features: [
      'Supports both kebab-case and snake_case output styles',
      'Removes accent marks and normalizes punctuation',
      'Optional number preservation for versioned content or dated posts',
      'Live preview with one-click copy',
    ],
    tip: 'For public-facing URLs, kebab-case is usually easier to read and more common than underscores.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Slug Generator — Create clean kebab-case and snake_case slugs online',
    description: 'Generate clean slugs for URLs, blog posts, and labels in your browser. Supports kebab-case and snake_case output with live preview.',
    extraKeywords: ['slugify text', 'url slug creator', 'blog slug generator'],
  },
}
