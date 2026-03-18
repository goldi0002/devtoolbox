import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const HTML_ENTITY_META: ToolMeta = {
  slug: 'html-entity',
  name: 'HTML Entity Encoder',
  description: 'Encode plain text into safe HTML entities and decode entity strings back into readable text in your browser.',
  category: 'encode-tools',
  tag: 'encode',
  keywords: [
    'html entity encoder',
    'html entity decoder',
    'escape html',
    'unescape html entities',
    'html special characters',
  ],
  toolComponent: lazy(() => import('../../components/tools/encode-tools/HtmlEntityTool')),
  about: {
    summary: 'HTML Entity Encoder helps you safely escape special characters for HTML snippets, templates, docs, and test fixtures, then decode them again when you need the original text. Everything runs locally in the browser so your copied markup never leaves your machine.',
    useCases: [
      'Escaping user-visible strings before dropping them into HTML examples or docs',
      'Decoding copied entity strings from CMS fields or generated markup',
      'Checking how quotes, ampersands, angle brackets, and non-breaking spaces are represented',
    ],
    features: [
      'Encode and decode with one click',
      'Supports common named entities plus numeric references',
      'Live output with character and entity counts',
      'Copy-ready output for templates, docs, or fixtures',
    ],
    tip: 'Named entities like &amp; are easier to read, while numeric entities can help when you need exact code points.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'HTML Entity Encoder — escape and decode HTML safely',
    description: 'Encode special characters into HTML entities or decode entity strings back to plain text instantly in your browser.',
    extraKeywords: ['html escape tool', 'html unescape tool', 'entity converter'],
  },
}
