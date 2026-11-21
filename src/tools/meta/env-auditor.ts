import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const ENV_AUDITOR_META: ToolMeta = {
  slug: 'env-auditor',
  name: '.env File Auditor & Secret Detector',
  description:
    'Compare .env and .env.example files, detect missing or duplicate keys, catch leaked API secrets, and generate sanitized templates.',
  category: 'analyze-tools',
  tag: '.env audit',
  toolComponent: lazy(() => import('../../components/tools/analyze-tools/EnvAuditor')),
  keywords: [
    'env auditor',
    'dotenv validator',
    'env diff',
    'env secret scanner',
    'env example generator',
    'check missing env vars',
    'api key leak detector',
  ],
  about: {
    summary:
      '.env File Auditor & Secret Detector parses .env and .env.example files entirely inside your browser to surface missing environment variables, undocumented keys, duplicate definitions, empty values, and accidental secret leaks (AWS, GitHub, OpenAI, Stripe, Slack, JWTs, PEM keys, and database URLs with credentials).',
    useCases: [
      'Verifying that local .env files contain every required variable defined in .env.example before deploying',
      'Scanning .env.example files before a git commit to ensure no real API keys or database passwords slipped in',
      'Detecting duplicate dotenv keys that silently override earlier lines',
      'Generating an alphabetically sorted, secret-free .env.example template from an existing .env file',
    ],
    features: [
      'Side-by-side .env vs .env.example key comparison (missing, undocumented, and empty keys)',
      'Built-in pattern & Shannon entropy detector for AWS, GitHub, OpenAI/Anthropic, Stripe, Slack, Google, JWT, and PEM secrets',
      'Masked secret previews so sensitive tokens are never echoed in full inside findings',
      'Duplicate key line-number reporting matching dotenv override semantics',
      'One-click generator for sorted .env and sanitized .env.example templates',
    ],
    tip: 'Paste your .env into the left panel and leave .env.example empty to automatically generate a clean, sorted .env.example template with all values stripped.',
  },
  guide: {
    "steps": [
      {
        "name": "Paste your .env",
        "text": "Paste your active file into .env (Local / Active)."
      },
      {
        "name": "Add the template (optional)",
        "text": "Paste the committed template into .env.example (Template). Leave it empty to generate a template from .env alone."
      },
      {
        "name": "Review the alerts",
        "text": "Check Health Score, Secret Alerts, Missing in .env, Undocumented and Duplicate Keys."
      },
      {
        "name": "Use the generated output",
        "text": "Switch between Sanitized .env.example and Sorted & Deduplicated .env, then copy it with the copy button on the output panel."
      }
    ],
    "faqs": [
      {
        "question": "What counts as a secret?",
        "answer": "Known patterns such as PEM private keys, AWS access key IDs, GitHub tokens, OpenAI and Anthropic keys, Stripe keys, Slack tokens, Google API keys, database URLs with passwords and JWTs. Keys named like SECRET, TOKEN, API_KEY or PASSWORD also get a high-entropy check."
      },
      {
        "question": "Are secret values shown in full?",
        "answer": "No. Findings show a masked preview of the first four and last four characters."
      },
      {
        "question": "Why is a duplicate key flagged?",
        "answer": "Most dotenv loaders let the last definition win. The tool lists every line for the key and keeps the last value in the sorted output."
      },
      {
        "question": "Is my .env uploaded?",
        "answer": "No. Parsing and detection run in your browser."
      }
    ],
    "example": {
      "title": "Generate a sorted .env.example from a .env with a duplicate key.",
      "input": "B_KEY=2\nA_KEY=1\nB_KEY=3",
      "output": "A_KEY=\nB_KEY=",
      "inputLabel": ".env (Local / Active)",
      "outputLabel": "Sanitized .env.example"
    }
  },
  addedAt: '2026-11-14',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: '.env File Auditor & Secret Detector — ToolBox4Devs',
    description:
      'Audit .env and .env.example files 100% client-side. Detect missing keys, duplicate variables, and leaked API secrets without uploading your config.',
    extraKeywords: [
      'dotenv checker online',
      'env secret detector',
      'compare env and env example',
      'sanitize env file',
    ],
  },
}
