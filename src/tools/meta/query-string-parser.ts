import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const QUERY_STRING_PARSER_META: ToolMeta = {
  slug: 'query-string-parser',
  name: 'Query String Parser',
  description: 'Parse URL query strings into readable key/value pairs and JSON entirely in your browser.',
  category: 'web-tools',
  tag: 'web',
  keywords: [
    'query string parser',
    'url params parser',
    'search params tool',
    'query parameter parser',
    'url query to json',
    'parse query string',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/QueryStringParser')),
  about: {
    summary: 'Query String Parser takes a full URL or raw query string, decodes the parameters, groups repeated keys, and shows the result as structured JSON. It is useful when debugging frontend routing, API callbacks, OAuth redirects, and analytics links.',
    useCases: [
      'Inspecting callback URLs from OAuth or SSO flows',
      'Debugging frontend route parameters and search state',
      'Converting query strings from logs into readable JSON',
      'Checking repeated parameters such as filters, tags, and array values',
    ],
    features: [
      'Accepts both full URLs and raw query strings',
      'Decodes percent-encoded parameter names and values',
      'Groups repeated keys into arrays automatically',
      'Shows normalized query output and JSON side by side',
      'Runs fully client-side with no backend calls',
    ],
    tip: 'If you paste a full URL, only the search portion is parsed. Hash fragments are ignored so you can focus on the query parameters.',
  },
  guide: {
    "steps": [
      {
        "name": "Paste a URL or query",
        "text": "Paste a full URL, or only the part after ?, into URL or query string."
      },
      {
        "name": "Read the parameters",
        "text": "The Parameters list shows each key and value in order, including repeated keys."
      },
      {
        "name": "Check the grouped JSON",
        "text": "Grouped JSON combines repeated keys into an array."
      },
      {
        "name": "Copy the result",
        "text": "Copy the Normalized query or the Grouped JSON."
      }
    ],
    "faqs": [
      {
        "question": "How are repeated keys shown?",
        "answer": "In Grouped JSON, a repeated key becomes an array of its values. The Parameters list shows every pair separately."
      },
      {
        "question": "Are hash fragments parsed?",
        "answer": "No. When you paste a full URL, only the query part is read, and the hash fragment after # is ignored."
      },
      {
        "question": "Are values decoded?",
        "answer": "Yes. Percent-encoded values are decoded, and a plus sign is read as a space, as URLSearchParams does."
      },
      {
        "question": "Is my URL sent anywhere?",
        "answer": "No. Parsing runs in your browser."
      }
    ],
    "example": {
      "title": "Parse a URL with a repeated tag parameter.",
      "input": "https://toolbox4devs.com/tools?tab=web&tag=query&tag=url&new=true",
      "output": "{\n  \"tab\": \"web\",\n  \"tag\": [\n    \"query\",\n    \"url\"\n  ],\n  \"new\": \"true\"\n}",
      "inputLabel": "URL",
      "outputLabel": "Grouped JSON"
    }
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Query String Parser — Parse URL parameters into JSON online',
    description: 'Parse full URLs or raw query strings into decoded key/value pairs and JSON instantly in your browser.',
    extraKeywords: [
      'url params decoder',
      'query string to json',
      'parse url search params',
      'query params viewer',
    ],
  },
}
