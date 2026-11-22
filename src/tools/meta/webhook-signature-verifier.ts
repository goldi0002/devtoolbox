import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const WEBHOOK_SIGNATURE_VERIFIER_META: ToolMeta = {
  slug: 'webhook-signature-verifier',
  name: 'Webhook Signature Verifier',
  description: 'Verify or generate Stripe, GitHub, Slack, Shopify, and Standard Webhooks HMAC signatures with timestamp replay checks in your browser.',
  category: 'crypto-tools',
  tag: 'webhook',
  icon: 'ShieldCheck',
  keywords: [
    'webhook signature verifier',
    'stripe webhook signature',
    'github webhook sha256',
    'slack signature verifier',
    'standard webhooks svix',
    'shopify hmac verifier',
    'verify webhook hmac',
    'webhook debugger',
  ],
  toolComponent: lazy(() => import('../../components/tools/crypto-tools/WebhookSignatureVerifier')),
  about: {
    summary:
      'Webhook Signature Verifier checks incoming webhook headers against raw request bodies using each provider\'s exact signing format and constant-time comparison. It supports Stripe (Stripe-Signature t=...,v1=...), GitHub (X-Hub-Signature-256 and legacy X-Hub-Signature), Slack (X-Slack-Signature v0=...), Shopify (X-Shopify-Hmac-Sha256), and Standard Webhooks / Svix (webhook-id, webhook-timestamp, webhook-signature with whsec_ Base64 secrets). You can also switch to Sign mode to generate valid test headers and a local cURL command.',
    useCases: [
      'Debugging why a Stripe, GitHub, Slack, or Standard Webhooks signature fails in local development',
      'Inspecting the exact signed string (such as timestamp + dot + raw body) to catch whitespace or JSON re-serialization bugs',
      'Testing replay-protection tolerance windows against captured webhook timestamps',
      'Generating signed webhook headers and cURL requests to hit localhost webhook handlers',
    ],
    features: [
      'Provider-specific verification for Stripe, GitHub, Slack, Shopify, and Standard Webhooks / Svix',
      'Automatic handling of whsec_ Base64 keys and multi-signature rotation headers',
      'Configurable replay timestamp tolerance window (default 300 seconds) with an ignore-age toggle for debugging old captures',
      'Constant-time signature comparison and exact signed payload preview',
      'Sign Test Request mode that outputs ready-to-paste headers and a copyable cURL command',
      '100% browser-side Web Crypto execution — secrets and payloads never leave your device',
    ],
    tip: 'Always verify webhook signatures against the exact raw request body bytes before JSON.parse() runs. Re-stringifying parsed JSON often changes key order or whitespace and breaks the HMAC.',
  },
  addedAt: '2026-11-21',
  complexity: 'moderate',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Webhook Signature Verifier — Stripe, GitHub, Slack, Shopify & Svix',
    description: 'Verify and generate Stripe, GitHub, Slack, Shopify, and Standard Webhooks HMAC signatures with timestamp checks. 100% client-side in your browser.',
    extraKeywords: [
      'stripe signature verifier online',
      'github x-hub-signature-256 tester',
      'slack webhook signature debugger',
      'standard webhooks verifier',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Select the webhook provider',
        text: 'Pick Stripe, GitHub, Slack, Shopify, or Standard Webhooks / Svix. A working sample payload, secret, and header load automatically.',
      },
      {
        name: 'Paste your secret and raw body',
        text: 'Enter the signing secret (such as whsec_...) and paste the exact raw request body without reformatting whitespace.',
      },
      {
        name: 'Paste the signature headers',
        text: 'Enter the incoming signature header (and timestamp / webhook-id headers for Slack or Standard Webhooks), and review the replay tolerance.',
      },
      {
        name: 'Inspect or generate test requests',
        text: 'Check whether the signature matches and inspect the exact signed string, or switch to Sign Test Request to generate valid headers and a cURL command.',
      },
    ],
    faqs: [
      {
        question: 'Why does a signature fail even though my secret is right?',
        answer: 'Webhooks sign the raw request body byte-for-byte. Passing a parsed and re-serialized JSON object instead of the raw body, or altering trailing newlines, changes the HMAC digest.',
      },
      {
        question: 'How does Standard Webhooks / Svix handle whsec_ secrets?',
        answer: 'Per the Standard Webhooks specification, secrets starting with whsec_ have the prefix stripped and the remainder Base64-decoded into raw HMAC key bytes. Stripe whsec_ secrets, by contrast, are used directly as UTF-8 bytes.',
      },
      {
        question: 'What if a Stripe or Standard Webhooks header contains multiple v1 signatures?',
        answer: 'During secret rotation, providers send multiple v1 signatures in the same header. The verifier checks every v1 value and passes if any matches in constant time.',
      },
      {
        question: 'Can I verify old captured webhooks without failing the timestamp check?',
        answer: 'Yes. Enable "Ignore timestamp age" to check only the cryptographic HMAC signature without enforcing the replay tolerance window.',
      },
    ],
    example: {
      title: 'Verify a GitHub X-Hub-Signature-256 header against a raw JSON body.',
      input: 'Provider: GitHub\nSecret: github_webhook_secret_key\nBody: {"action":"opened","number":42}',
      output: 'X-Hub-Signature-256: sha256=e7c8a... (verified via HMAC-SHA256 of raw body)',
      inputLabel: 'Webhook inputs',
      outputLabel: 'Verification result',
    },
  },
}
