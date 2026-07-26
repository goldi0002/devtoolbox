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
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
