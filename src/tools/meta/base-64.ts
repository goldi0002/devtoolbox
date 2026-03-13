import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const BASE_64_META: ToolMeta = {
  slug: 'base64',
  name: 'Base64',
  description: 'Encode plain text to Base64 or decode Base64 back to plain text.',
  category: 'encode-tools',
  tag: 'encode',
  keywords: [
    'base64 encoder',
    'base64 decoder',
    'encode to base64',
    'decode from base64',
    'base64 converter',
    'base64 encoding tool',
    'base64 decoding tool',
    'base64 online',
    'base64 encode decode',
    'base64 translator',
    'base64 utility',
    'base64 encoding and decoding',
  ],
  toolComponent: lazy(() => import('../../components/tools/encode-tools/Base64Tool')),
  about: {
    summary:
      'Base64 is an encoding scheme that converts binary or text data into a string of ASCII characters. It\'s widely used to safely transmit data in URLs, HTTP headers, email, and data URIs. This tool encodes any text to Base64 and decodes Base64 strings back to their original form instantly.',
    useCases: [
      'Encoding credentials for HTTP Basic Authentication headers',
      'Embedding small images or fonts as data URIs in CSS or HTML',
      'Encoding binary data for safe transmission in JSON payloads',
      'Decoding Base64 strings received from APIs or email headers',
      'Inspecting Base64-encoded tokens or configuration values',
    ],
    features: [
      'Encode plain text or ASCII to Base64 instantly',
      'Decode Base64 strings back to human-readable text',
      'Live conversion as you type — no button needed',
      'Handles padding characters (=) automatically',
      'Copy encoded or decoded output with one click',
    ],
    tip: 'Base64 is encoding, not encryption — it\'s not secure on its own. Never use it to hide sensitive data like passwords.',
  },
  addedAt: '2026-03-12',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Base64 Encoder & Decoder — Convert text to Base64 and back',
    description: 'Encode plain text to Base64 or decode Base64 strings back to text instantly. Free, runs entirely in your browser.',
    extraKeywords: [
      'base64 encoder',
      'base64 decoder',
      'encode to base64',
      'decode from base64',
      'base64 converter',
      'base64 encoding tool',
      'base64 decoding tool',
    ],
  }
}