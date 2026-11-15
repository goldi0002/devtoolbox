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
  },
  guide: {
    "steps": [
      {
        "name": "Pick encode or decode",
        "text": "Choose whether you are turning text into Base64 or turning a Base64 string back into text."
      },
      {
        "name": "Enter text or upload a file",
        "text": "Type or paste your input, or upload a file to get its Base64 representation. The result updates as you type."
      },
      {
        "name": "Set URL-safe or data URI output",
        "text": "Turn on URL-safe mode to use - and _ with no padding, or data URI mode to prefix the result for use in HTML and CSS."
      },
      {
        "name": "Copy or swap the result",
        "text": "Copy the output, or use the swap button to send it back to the input and convert in the other direction."
      }
    ],
    "faqs": [
      {
        "question": "Is Base64 a form of encryption?",
        "answer": "No. Base64 is a reversible encoding with no key, so anyone can decode it. Use it to move data safely through text-only channels, never to protect secrets."
      },
      {
        "question": "What is URL-safe Base64?",
        "answer": "Standard Base64 uses + and /, which have special meaning in URLs. The URL-safe variant replaces them with - and _ and usually drops the trailing = padding. JWTs use this variant."
      },
      {
        "question": "Why does Base64 output end with = or ==?",
        "answer": "Base64 encodes three bytes into four characters. When the input length is not a multiple of three, = characters pad the final group to four characters."
      },
      {
        "question": "How much larger is Base64 than the original data?",
        "answer": "About 33% larger, because every three bytes become four characters. That is why inlining large images as Base64 data URIs is usually a bad trade."
      }
    ],
    "example": {
      "title": "Encode a short string to standard Base64.",
      "input": "Hello, World!",
      "output": "SGVsbG8sIFdvcmxkIQ==",
      "inputLabel": "Plain text",
      "outputLabel": "Base64"
    }
  },
}