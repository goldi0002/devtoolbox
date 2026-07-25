import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const LOCAL_AI_TEXT_ASSISTANT_META: ToolMeta = {
  slug: 'local-ai-text-assistant',
  name: 'Local AI Text Assistant',
  description: 'Summarize text, surface keywords, detect action items, and estimate sentiment fully in JavaScript with no API.',
  category: 'analyze-tools',
  tag: 'ai',
  keywords: ['offline ai', 'local ai tool', 'text summarizer javascript', 'keyword extractor', 'no api ai'],
  toolComponent: lazy(() => import('../../components/tools/analyze-tools/LocalAiAssistant')),
  about: {
    summary: 'Local AI Text Assistant adds an AI-like feature to the site without relying on any external model or API. It uses browser-side heuristics to rank sentences, extract keywords, identify action-oriented lines, and provide a lightweight sentiment hint for quick text review.',
    useCases: [
      'Summarizing meeting notes, support tickets, or product feedback locally',
      'Extracting likely action items from pasted text without sending data anywhere',
      'Getting a fast, privacy-friendly first pass before deeper editing or analysis',
    ],
    features: [
      'Runs entirely in JavaScript in the browser with no API calls',
      'Generates summary bullets, top keywords, action items, and a sentiment hint',
      'Useful for quick internal notes, drafts, bug reports, and review workflows',
    ],
    tip: 'This tool is intentionally heuristic, so treat it as a fast local assistant rather than a replacement for a full LLM.',
  },
  addedAt: '2026-03-20',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
}
