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
  guide: {
    "steps": [
      {
        "name": "Paste or load text",
        "text": "Enter text under Text to analyze, or select Load sample for an example."
      },
      {
        "name": "Read the summary",
        "text": "Summary copy lists the sentences the heuristics rank highest as bullets."
      },
      {
        "name": "Check keywords and actions",
        "text": "Review the keywords and the Action items list that the analysis finds."
      },
      {
        "name": "Read the sentiment hint",
        "text": "The Sentiment hint is a rough label from word lists, so treat it as a quick cue rather than a verdict."
      }
    ],
    "faqs": [
      {
        "question": "Does it use an AI model?",
        "answer": "No. It uses local JavaScript heuristics to rank sentences, count keywords and match word lists. It does not call an API."
      },
      {
        "question": "Why does the sentiment hint seem wrong?",
        "answer": "It counts a fixed set of positive and negative words, so it does not consider the context around them."
      },
      {
        "question": "Can it replace a full language model?",
        "answer": "No. It is a lightweight local helper for quick review, not a replacement for a full model."
      },
      {
        "question": "Is my text sent anywhere?",
        "answer": "No. The analysis runs in your browser."
      }
    ],
    "example": {
      "title": "Analyze the sample product update text.",
      "input": "Ship the updated onboarding flow this week. The current signup experience is confusing for mobile users and causes too many drop-offs after email verification. We should simplify the CTA copy, reduce the number of required fields, and clarify what happens after account creation. The support team also wants a short checklist they can send to customers. Please review analytics, summarize the main issues, and list the next actions before Friday.",
      "output": "Sentences 5 · Sentiment hint: Mostly negative",
      "inputLabel": "Text to analyze",
      "outputLabel": "Analysis"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Local Text Summarizer & Keyword Extractor — No API, Runs Offline',
    description: 'Summarize text, extract keywords, find action items and estimate sentiment locally in JavaScript. No API key, no upload, works offline.',
  },
}
