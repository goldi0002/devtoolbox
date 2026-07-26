import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const CURL_CONVERTER_META: ToolMeta = {
  slug: 'curl-converter',
  name: 'cURL to Code Converter',
  description: 'Convert cURL command line requests into clean JavaScript fetch, Node.js Axios, Python requests, Go, Rust, or PHP code snippets instantly.',
  category: 'web-tools',
  tag: 'curl',
  toolComponent: lazy(() => import('../../components/tools/web-tools/CurlConverter')),
  keywords: [
    'curl to fetch',
    'curl to python',
    'curl to javascript',
    'curl to node axios',
    'curl to go',
    'curl to rust',
    'curl converter',
    'parse curl online',
    'curl command to code',
  ],
  about: {
    summary:
      'cURL to Code Converter transforms cURL terminal commands into production-ready code in JavaScript (Fetch), Node.js (Axios), Python (Requests), Go (net/http), Rust (reqwest), and PHP. It automatically extracts HTTP methods, header keys, authorization credentials, and body payloads.',
    useCases: [
      'Translating cURL requests copied from Chrome/Firefox DevTools into application code',
      'Converting API documentation cURL examples into Python or JavaScript functions',
      'Debugging headers, authentication tokens, and request bodies',
      'Porting web requests across multiple programming languages',
    ],
    features: [
      'Multi-language output: JS Fetch, Axios, Python, Go, Rust, and PHP',
      'Parses GET, POST, PUT, DELETE, PATCH, and OPTIONS HTTP methods',
      'Handles custom headers, User-Agent, and Basic Auth flags',
      'Formats JSON payload bodies and form arguments seamlessly',
      'One-click copy to clipboard with syntax highlighting',
      '100% in-browser execution — your API tokens remain private',
    ],
    tip: 'In Chrome or Edge Network tab, right-click any request and select "Copy as cURL", then paste it here to get instant code!',
  },
  addedAt: '2026-07-26',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Convert cURL commands to JavaScript Fetch, Python Requests, Node.js Axios, Go, Rust, and PHP instantly. Free, 100% browser-based tool.',
    extraKeywords: [
      'convert curl online',
      'curl to python online',
      'curl to js fetch online',
      'curl to axios online',
      'curl parser free',
    ],
    title: 'cURL to Code Converter — ToolBox4Devs',
  }
}
