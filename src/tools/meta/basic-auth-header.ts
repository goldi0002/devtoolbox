import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const BASIC_AUTH_HEADER_META: ToolMeta = {
  slug: 'basic-auth-header',
  name: 'Basic Auth Header',
  description: 'Generate and decode HTTP Basic Authorization headers using username and password pairs.',
  category: 'auth-tools',
  tag: 'auth',
  keywords: ['basic auth header', 'authorization header', 'http basic auth', 'basic auth encode', 'basic auth decode'],
  toolComponent: lazy(() => import('../../components/tools/auth-tools/BasicAuthHeader')),
  about: {
    summary: 'Basic Auth Header gives you a quick way to build or inspect HTTP Basic Authorization headers while testing APIs, reverse proxies, scripts, and local services. It helps remove the friction of manual Base64 work during authentication debugging.',
    useCases: [
      'Generating Authorization headers for curl or API clients',
      'Decoding copied Basic auth strings from configs or logs',
      'Checking whether a username/password pair was encoded as expected',
    ],
    features: [
      'Builds a ready-to-paste Authorization header from credentials',
      'Decodes an existing Basic header into username and password fields',
      'Keeps all encoding and decoding local in the browser',
    ],
    tip: 'Basic auth is transport-safe only when paired with HTTPS because the credentials are merely encoded, not encrypted.',
  },
  guide: {
    "steps": [
      {
        "name": "Enter credentials",
        "text": "Type a Username and Password. The Authorization header updates as you type."
      },
      {
        "name": "Copy the header",
        "text": "Copy the Authorization header value, which starts with Basic followed by Base64 text."
      },
      {
        "name": "Decode an existing header",
        "text": "Paste a Basic header into Decode existing header. The leading Basic word is optional."
      },
      {
        "name": "Check the decoded values",
        "text": "Read Decoded username and Decoded password. If the input cannot be decoded, both show a dash."
      }
    ],
    "faqs": [
      {
        "question": "Is Basic auth encrypted?",
        "answer": "No. Base64 only encodes the credentials so they fit in a header, and anyone who sees the header can decode them. Always send Basic auth over HTTPS."
      },
      {
        "question": "What if the password contains a colon?",
        "answer": "Only the first colon separates the username from the password, so everything after it is kept as the password."
      },
      {
        "question": "Is the Basic prefix required when decoding?",
        "answer": "No. A leading Basic word is removed before decoding, and it is matched regardless of letter case."
      },
      {
        "question": "Are my credentials sent to a server?",
        "answer": "No. Encoding and decoding run in your browser using the built-in btoa and atob functions."
      }
    ],
    "example": {
      "title": "Build a Basic header from a username and password.",
      "input": "Username: service-account\nPassword: s3cret-token",
      "output": "Basic c2VydmljZS1hY2NvdW50OnMzY3JldC10b2tlbg==",
      "inputLabel": "Credentials",
      "outputLabel": "Authorization header"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Basic Auth Header Generator & Decoder — HTTP Authorization',
    description: 'Generate an HTTP Basic Authorization header from a username and password, or decode an existing one. Runs in your browser; credentials never leave it.',
  },
}
