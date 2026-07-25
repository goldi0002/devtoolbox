import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const HTTP_STATUS_LOOKUP_META: ToolMeta = {
  slug: 'http-status-lookup',
  name: 'HTTP Status Lookup',
  description: 'Search common HTTP response codes and their meanings while debugging APIs. Runs entirely in your browser.',
  category: 'web-tools',
  tag: 'http',
  toolComponent: lazy(() => import('../../components/tools/web-tools/HttpStatusLookup')),
  keywords: [
    'http status codes',
    'http code lookup',
    'rest api status codes',
    '404 meaning',
    '429 too many requests',
    '500 internal server error',
  ],
  about: {
    summary:
      'HTTP Status Lookup keeps the most common response codes close at hand so you can debug faster without opening a docs tab. Search by code, phrase, or category and copy the exact code + label when you need it.',
    useCases: [
      'Checking what a response code means during API or frontend debugging',
      'Quickly confirming the difference between similar client and server errors',
      'Copying a code and label into documentation, tickets, or test cases',
    ],
    features: [
      'Fast search by numeric code or keyword',
      'Grouped informational, success, redirect, client, and server errors',
      'Quick answer card for exact code lookups',
      'One-click copy for code and label pairs',
    ],
    tip: 'If you keep seeing 304 responses in DevTools, that often means browser caching is working exactly as intended rather than your request failing.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
