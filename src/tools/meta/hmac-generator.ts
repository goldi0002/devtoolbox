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
