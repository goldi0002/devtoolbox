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
  guide: {
    "steps": [
      {
        "name": "Search or pick a code",
        "text": "Type a code or words into Search by code or status text, or use the 200, 404, 429 or 500 buttons."
      },
      {
        "name": "Read the answer card",
        "text": "An exact code shows a headline such as 404 · Not Found with its category."
      },
      {
        "name": "Browse the table",
        "text": "The table lists the code, category and meaning. Use Show all to clear the search."
      },
      {
        "name": "Copy a code",
        "text": "Use the copy action on a row to copy the code and label, such as 404 Not Found."
      }
    ],
    "faqs": [
      {
        "question": "Which status codes are included?",
        "answer": "A selection of common codes from 1xx to 5xx, such as 301, 401, 404, 429, 500 and 503. Rarer codes are not listed."
      },
      {
        "question": "What does the search match?",
        "answer": "It matches the code, label, category or meaning text, ignoring case."
      },
      {
        "question": "Is anything sent to a server?",
        "answer": "No. The list is built into the page and searched in your browser."
      }
    ],
    "example": {
      "title": "Look up a 404 response.",
      "input": "404",
      "output": "404 · Not Found\nClient Error",
      "inputLabel": "Search",
      "outputLabel": "Answer card"
    }
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'HTTP Status Codes Lookup — 200, 301, 404, 500 Explained',
    description: 'Search every HTTP status code and see what it means, from 1xx to 5xx. A quick reference for debugging APIs and web servers.',
  },
}
