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
  guide: {
    "steps": [
      {
        "name": "Search",
        "text": "Type an extension such as .svg, a MIME type such as application/json, or a format name such as font or zip."
      },
      {
        "name": "Use a preset or show all",
        "text": "Click json, svg, woff2 or application/json, or Show all to clear the search."
      },
      {
        "name": "Read the exact match",
        "text": "When the query matches an extension or MIME type exactly, the quick answer card shows that pair."
      },
      {
        "name": "Copy a row",
        "text": "Use the copy control on a row to copy its extension and MIME type."
      }
    ],
    "faqs": [
      {
        "question": "How many types are included?",
        "answer": "The list has 26 common extensions across text, script, application, archive, image, font, audio and video formats. It is a fixed list in the tool, not a full IANA registry."
      },
      {
        "question": "Why does .js show text/javascript?",
        "answer": "The table lists one common MIME type per extension. Servers can send other values for the same format, so check what yours actually returns."
      },
      {
        "question": "Does search match the notes too?",
        "answer": "Yes. Matching checks the extension, MIME type, category and notes text."
      },
      {
        "question": "Where do I see a file's real Content-Type?",
        "answer": "Check the Content-Type header your server returns, for example in your browser's developer tools."
      }
    ],
    "example": {
      "title": "Find the MIME type for JSON files.",
      "input": "json",
      "output": ".json → application/json (Application)",
      "inputLabel": "Search",
      "outputLabel": "Quick answer"
    }
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
