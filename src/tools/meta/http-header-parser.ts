import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const HTTP_HEADER_PARSER_META: ToolMeta = {
  slug: 'http-header-parser',
  name: 'HTTP Header Parser',
  description: 'Parse raw HTTP request or response headers into structured rows and JSON.',
  category: 'web-tools',
  tag: 'web',
  keywords: ['http header parser', 'raw headers', 'request headers', 'response headers', 'header to json'],
  toolComponent: lazy(() => import('../../components/tools/web-tools/HttpHeaderParser')),
  about: {
    summary: 'HTTP Header Parser helps you turn a pasted header block into a structured, readable view. It is useful during API debugging, reverse proxy troubleshooting, support investigations, and documentation work when you need a quick breakdown of raw headers.',
    useCases: [
      'Inspecting raw request headers copied from browser devtools or logs',
      'Converting header blocks into JSON for docs or scripts',
      'Checking authorization, cache, and content-type headers during API debugging',
    ],
    features: [
      'Recognizes request lines plus name/value header rows',
      'Generates a copyable JSON representation',
      'Runs fully client-side with no network requests',
    ],
    tip: 'If you paste a full request block, the first non-header line is shown separately as the request line.',
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
