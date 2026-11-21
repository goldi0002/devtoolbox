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
  guide: {
    "steps": [
      {
        "name": "Choose a mode",
        "text": "Pick Encode or Decode."
      },
      {
        "name": "Paste the text",
        "text": "Enter plain text or markup in Input."
      },
      {
        "name": "Read the output",
        "text": "Output updates as you type, and Mode, Chars and Entities show the counts."
      },
      {
        "name": "Optional: keep spaces",
        "text": "In Encode mode, the Keep spaces plain button switches spaces to &nbsp;. Click it again to turn that off."
      }
    ],
    "faqs": [
      {
        "question": "Which characters are always encoded?",
        "answer": "The ampersand, less-than and greater-than signs, the double quote and the single quote. Any character above ASCII 126 is written as a numeric reference such as &#233;."
      },
      {
        "question": "Does decoding handle named and numeric entities?",
        "answer": "Yes. Decoding uses the browser HTML parser, so entities it knows, such as &amp;, &eacute; and &#233;, are converted."
      },
      {
        "question": "Is the markup rendered?",
        "answer": "No. Decoding goes through a textarea, so tags in the input are shown as text and not rendered."
      },
      {
        "question": "Is my text sent anywhere?",
        "answer": "No. Encoding and decoding run in your browser."
      }
    ],
    "example": {
      "title": "Encode ampersands, quotes, tags and accented letters.",
      "input": "Tom & Jerry's <b>Café</b>",
      "output": "Tom &amp; Jerry&#39;s &lt;b&gt;Caf&#233;&lt;/b&gt;",
      "inputLabel": "Input (Encode)",
      "outputLabel": "Output"
    }
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
