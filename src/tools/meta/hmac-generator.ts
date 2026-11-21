import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const HMAC_GENERATOR_META: ToolMeta = {
  slug: 'hmac-generator',
  name: 'HMAC Generator & Calculator',
  description: 'Calculate HMAC-SHA256, HMAC-SHA512, and HMAC-SHA1 signatures for webhook verification and API security.',
  category: 'crypto-tools',
  tag: 'hmac',
  toolComponent: lazy(() => import('../../components/tools/crypto-tools/HmacGenerator')),
  keywords: [
    'hmac generator',
    'hmac sha256 online',
    'hmac signature calculator',
    'webhook signature verifier',
    'stripe signature generator',
    'github webhook hmac',
    'hmac sha512 online',
    'crypto hmac',
  ],
  about: {
    summary:
      'HMAC Generator & Calculator computes Keyed-Hash Message Authentication Code (HMAC) signatures using Web Crypto standard algorithms including SHA-256, SHA-512, SHA-384, and SHA-1. It supports Hex, Base64, and Base64URL output encodings and UTF-8, Hex, or Base64 secret keys.',
    useCases: [
      'Testing and validating GitHub, Stripe, Shopify, Twilio, and Razorpay webhook payload signatures',
      'Debugging REST API request signing mechanisms (e.g., AWS V4 signatures or custom API headers)',
      'Verifying message integrity between distributed microservices',
      'Generating sample Node.js and Python verification code for backend handlers',
    ],
    features: [
      'Supports SHA-256, SHA-512, SHA-384, and SHA-1 hash algorithms',
      'Flexible secret key encodings: Plain Text (UTF-8), Hexadecimal, and Base64',
      'Multiple output formats: Lowercase Hex, Uppercase Hex, Base64, and URL-safe Base64URL',
      'Pre-built preset configurations for Stripe, GitHub, and Shopify webhooks',
      '100% Client-Side Web Crypto API execution — your secret keys never leave your device',
    ],
    tip: 'For GitHub webhooks, choose HMAC-SHA256 with Hex (lowercase) output format to match the X-Hub-Signature-256 header!',
  },
  guide: {
    "steps": [
      {
        "name": "Paste the payload",
        "text": "Enter the raw message under Raw Payload / Message exactly as your provider sent it."
      },
      {
        "name": "Enter the secret",
        "text": "Type the Secret Key and choose its Key Encoding: UTF-8 / Plain Text, Hex String or Base64 Encoded."
      },
      {
        "name": "Pick the algorithm and format",
        "text": "Select a Hash Algorithm (SHA-256, SHA-512, SHA-1 or SHA-384) and an Output Format."
      },
      {
        "name": "Compare the signature",
        "text": "Compare the Computed HMAC Signature with the signature header your provider sent."
      }
    ],
    "faqs": [
      {
        "question": "Which output formats are available?",
        "answer": "Hex (lowercase), Hex (UPPERCASE), Base64 and Base64URL (safe for URIs)."
      },
      {
        "question": "Why does my signature not match the provider's?",
        "answer": "Check that the payload is identical byte for byte, including whitespace and line endings, and that the key encoding matches the one the provider uses."
      },
      {
        "question": "Which key encodings can I use?",
        "answer": "UTF-8 / Plain Text, Hex String and Base64 Encoded. Pick the one that matches how your secret is stored."
      },
      {
        "question": "Is my secret sent to a server?",
        "answer": "No. The signature is computed in your browser."
      }
    ],
    "example": {
      "title": "Compute an HMAC-SHA256 webhook signature in lowercase hex.",
      "input": "Payload: {\"event\":\"payment_intent.succeeded\",\"amount\":4900,\"currency\":\"usd\"}\nSecret: whsec_3F28A1C9E48201B79D",
      "output": "7941d12eaaf821d9f62bc1db3dad598ec7494d4352229df5aa1c3beb77751241",
      "inputLabel": "Payload and secret",
      "outputLabel": "Computed HMAC Signature"
    }
  },
  addedAt: '2026-07-26',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Calculate HMAC-SHA256, HMAC-SHA512, and HMAC-SHA1 online. Verify Stripe, GitHub, and Shopify webhook signatures. Free, 100% browser-based.',
    extraKeywords: [
      'hmac calculator online',
      'hmac sha256 calculator free',
      'webhook signature tool',
      'compute hmac online',
    ],
    title: 'HMAC Generator & Calculator — ToolBox4Devs',
  }
}
