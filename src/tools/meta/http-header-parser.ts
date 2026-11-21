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
  guide: {
    "steps": [
      {
        "name": "Paste the header block",
        "text": "Paste raw request or response headers under Raw headers. Load sample fills in an example request."
      },
      {
        "name": "Check the request line",
        "text": "A first line without a colon, such as GET /path HTTP/1.1, is shown separately as the Request line."
      },
      {
        "name": "Review the table",
        "text": "Each header appears as a row with its name and value."
      },
      {
        "name": "Copy the JSON",
        "text": "Use the copy button in the JSON view to copy all headers as one JSON object."
      }
    ],
    "faqs": [
      {
        "question": "What happens to a repeated header name?",
        "answer": "The JSON view keeps the last value for that name, because each name becomes one key. The table still lists every row."
      },
      {
        "question": "Are header names case-sensitive in the JSON?",
        "answer": "Yes. Names are used exactly as written, so Content-Type and content-type become separate keys."
      },
      {
        "question": "Why are some lines not listed as headers?",
        "answer": "Only lines with a colon are listed as headers. The first line without a colon is shown as the request line, and blank lines are skipped."
      },
      {
        "question": "Is anything sent to a server?",
        "answer": "No. Parsing happens in your browser."
      }
    ],
    "example": {
      "title": "Parse a request line and two headers.",
      "input": "GET /api/users?page=2 HTTP/1.1\nContent-Type: application/json\nX-Request-Id: req_42",
      "output": "{\n  \"Content-Type\": \"application/json\",\n  \"X-Request-Id\": \"req_42\"\n}",
      "inputLabel": "Raw headers",
      "outputLabel": "JSON view"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'HTTP Header Parser — Convert Raw Headers to JSON',
    description: 'Parse raw HTTP request or response headers into a structured table and JSON. Useful for debugging APIs, proxies and CORS, fully client-side.',
  },
}
