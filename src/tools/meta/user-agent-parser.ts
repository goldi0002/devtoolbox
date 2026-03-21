import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const USER_AGENT_PARSER_META: ToolMeta = {
  slug: 'user-agent-parser',
  name: 'User Agent Parser',
  description: 'Parse raw browser user agent strings into browser, engine, operating system, and device hints.',
  category: 'web-tools',
  tag: 'web',
  keywords: ['user agent parser', 'ua parser', 'browser detection', 'device detection', 'http header debugging'],
  toolComponent: lazy(() => import('../../components/tools/web-tools/UserAgentParser')),
  about: {
    summary: 'User Agent Parser gives you a quick read on what a raw User-Agent header is likely describing. It helps during analytics reviews, support triage, CDN rules, QA checks, or bot filtering when you need a lightweight browser-side interpretation.',
    useCases: [
      'Checking support tickets that include a raw User-Agent header',
      'Understanding browser and device hints during analytics or feature debugging',
      'Reviewing crawler traffic or mobile-vs-desktop requests',
    ],
    features: [
      'Extracts likely browser, rendering engine, operating system, and device class',
      'Includes desktop and mobile sample strings for quick testing',
      'Keeps parsing entirely client-side in the browser',
    ],
    tip: 'User-Agent parsing is heuristic by nature, so treat the result as a practical hint rather than a security-grade identifier.',
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
