import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const CURL_CONVERTER_META: ToolMeta = {
  slug: 'curl-converter',
  name: 'cURL to Code Converter',
  description: 'Convert cURL commands into clean JavaScript fetch, Node.js Axios, Python requests, Go, Rust, or PHP code snippets instantly.',
  category: 'web-tools',
  tag: 'curl',
  toolComponent: lazy(() => import('../../components/tools/web-tools/CurlConverter')),
  keywords: [
    'curl convert',
    'convert curl',
    'curl converter',
    'curl to fetch',
    'curl to python',
    'curl to javascript',
    'curl to node axios',
    'curl to go',
    'curl to rust',
    'curl to php',
    'parse curl online',
    'curl command to code',
    'curl parser online'
  ],
  about: {
    summary:
      'cURL to Code Converter transforms raw terminal cURL requests into production-ready code in JavaScript (Fetch), Node.js (Axios), Python (Requests), Go (net/http), Rust (reqwest), and PHP. It automatically parses HTTP methods, headers, authentication tokens, cookies, and JSON/form body payloads.',
    useCases: [
      'Translating cURL requests copied from browser DevTools (Network tab) into application code',
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
  guide: {
    "steps": [
      {
        "name": "Paste a cURL command",
        "text": "Paste the command into cURL Command Input, or use Load sample cURL to try a preset."
      },
      {
        "name": "Pick a target language",
        "text": "Select JavaScript (Fetch), Node.js (Axios), Python (Requests), Go (net/http), Rust (reqwest) or PHP (cURL)."
      },
      {
        "name": "Review the generated code",
        "text": "Generated Code Output updates as you type and includes the method, URL, headers, body and Basic Auth."
      },
      {
        "name": "Copy the snippet",
        "text": "Use the copy button above Generated Code Output."
      }
    ],
    "faqs": [
      {
        "question": "Which curl options are read?",
        "answer": "The method (-X or --request), headers (-H or --header), User-Agent (-A or --user-agent), Basic Auth (-u or --user) and the body (-d, --data, --data-raw or --data-binary). The URL is taken from the http or https argument. Other options are ignored."
      },
      {
        "question": "Does adding a body change the method?",
        "answer": "Yes. If there is a body and no explicit method, the method becomes POST."
      },
      {
        "question": "Can I paste a multi-line command?",
        "answer": "Yes. Backslash line continuations are joined before the command is parsed."
      },
      {
        "question": "Is my token sent anywhere?",
        "answer": "No. The conversion runs in your browser and nothing is sent to a server."
      }
    ],
    "example": {
      "title": "Convert a GET request with a header to Python (Requests).",
      "input": "curl https://api.example.com/users -H \"Accept: application/json\"",
      "output": "import requests\n\nurl = \"https://api.example.com/users\"\nheaders = {\n    \"Accept\": \"application/json\",\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.status_code)\nprint(response.text)",
      "inputLabel": "cURL Command Input",
      "outputLabel": "Python (Requests)"
    }
  },
  addedAt: '2026-07-26',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Convert cURL commands to JavaScript Fetch, Python Requests, Node.js Axios, Go, Rust, and PHP instantly. Free, 100% browser-based cURL convert tool.',
    extraKeywords: [
      'curl convert',
      'convert curl online',
      'curl converter online',
      'curl to python online',
      'curl to js fetch online',
      'curl to axios online',
      'curl parser free',
    ],
    title: 'cURL to Code Converter — Convert cURL to Python, JS Fetch & Axios — ToolBox4Devs',
  }
}
