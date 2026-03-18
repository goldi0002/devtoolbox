import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const MIME_TYPE_LOOKUP_META: ToolMeta = {
  slug: 'mime-type-lookup',
  name: 'MIME Type Lookup',
  description: 'Look up common file extensions, content types, and browser-facing MIME labels while working with uploads or headers.',
  category: 'web-tools',
  tag: 'web',
  keywords: [
    'mime type lookup',
    'content type lookup',
    'file extension mime',
    'http content type',
    'media type reference',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/MimeTypeLookup')),
  about: {
    summary: 'MIME Type Lookup keeps common content types close by when you are configuring uploads, response headers, static file servers, or object storage metadata. Search by extension, MIME string, or format name without bouncing to external docs.',
    useCases: [
      'Checking the correct Content-Type header for API or CDN responses',
      'Mapping file extensions for uploads, S3 metadata, or form validation',
      'Quickly confirming browser-friendly types for JSON, SVG, fonts, and archives',
    ],
    features: [
      'Search by extension, MIME type, or format name',
      'Includes common text, image, font, archive, audio, and application formats',
      'Copy-ready code and content type pairs',
      'Exact match panel for fast lookups during debugging',
    ],
    tip: 'If a browser downloads a file instead of displaying it, the Content-Type header is one of the first things worth checking.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'MIME Type Lookup — common content types and extensions',
    description: 'Search common MIME types and file extensions for uploads, HTTP headers, and static assets directly in your browser.',
    extraKeywords: ['content-type header tool', 'extension to mime', 'mime reference'],
  },
}
