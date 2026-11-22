import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TOTP_AUTHENTICATOR_META: ToolMeta = {
  slug: 'totp-authenticator',
  name: 'TOTP / 2FA Authenticator & URI Builder',
  description: 'Generate RFC 6238 TOTP & RFC 4226 HOTP 2FA codes, test Base32 secrets, and build or parse scannable otpauth:// QR URIs.',
  category: 'auth-tools',
  tag: '2fa',
  icon: 'ShieldCheck',
  keywords: [
    'totp generator',
    '2fa authenticator online',
    'otpauth uri builder',
    'rfc 6238 totp',
    'hotp generator',
    'totp qr code generator',
    'mfa testing tool',
  ],
  toolComponent: lazy(() => import('../../components/tools/auth-tools/TotpAuthenticator')),
  about: {
    summary:
      'TOTP / 2FA Authenticator & URI Builder computes RFC 6238 time-based (TOTP) and RFC 4226 counter-based (HOTP) one-time passcodes entirely in your browser using the native Web Crypto HMAC API. Developers implementing multi-factor authentication can test Base32 secrets, preview next-window codes, parse existing otpauth:// links, and render scannable provisioning QR codes without ever sending shared secrets over the network.',
    useCases: [
      'Testing 2FA / MFA login flows during local development without reaching for a phone',
      'Verifying that backend TOTP libraries match RFC 6238 across SHA-1, SHA-256, and SHA-512',
      'Building and previewing scannable otpauth:// QR codes for authenticator apps',
      'Inspecting and validating existing otpauth://totp/ or otpauth://hotp/ provisioning URIs',
    ],
    features: [
      'Real-time RFC 6238 TOTP generator with live countdown ring and next-window code preview',
      'RFC 4226 HOTP counter-based mode with step increment control',
      'Supports HMAC-SHA1, HMAC-SHA256, and HMAC-SHA512 with 6, 7, or 8 digit output',
      'Cryptographically random 160-bit Base32 secret generator via crypto.getRandomValues()',
      'Bidirectional otpauth:// URI parser/builder with instant SVG QR code preview',
    ],
    tip: 'Keep a dedicated test Base32 secret in your local .env.test and paste it here whenever you need valid 6-digit codes in integration tests.',
  },
  addedAt: '2026-11-21',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'TOTP / 2FA Authenticator & otpauth:// QR Builder — Client-Side',
    description: 'Generate RFC 6238 TOTP & HOTP codes, test 2FA Base32 secrets, and build scannable otpauth:// QR codes privately in your browser.',
    extraKeywords: [
      'totp code generator online',
      '2fa qr code builder',
      'otpauth parser',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Enter or generate a Base32 secret',
        text: 'Paste an existing Base32 secret (A–Z, 2–7) or click New 160-bit Secret to generate one locally.',
      },
      {
        name: 'Choose TOTP or HOTP and algorithm',
        text: 'Select TOTP for 30-second time-based codes or HOTP for counter-based codes, and configure SHA-1, SHA-256, or SHA-512 with 6–8 digits.',
      },
      {
        name: 'Copy live or next-window code',
        text: 'Read the live 2FA code along with its remaining seconds and upcoming next-window code.',
      },
      {
        name: 'Scan QR or parse otpauth:// URI',
        text: 'Scan the generated provisioning QR code with an authenticator app, or paste an existing otpauth:// URI to inspect and test it.',
      },
    ],
    faqs: [
      {
        question: 'Is it safe to paste a real 2FA secret here?',
        answer: 'All HMAC-SHA computations and QR code rendering run strictly in your browser memory via Web Crypto, and nothing is stored or transmitted. Still, we recommend using staging or test secrets when possible.',
      },
      {
        question: 'Why does the TOTP code change every 30 seconds?',
        answer: 'Per RFC 6238, TOTP divides the current Unix timestamp in seconds by the period (default 30s) to derive the HMAC counter, producing a new code each interval.',
      },
      {
        question: 'Does this support SHA-256 and 8-digit codes?',
        answer: 'Yes. You can switch between SHA-1, SHA-256, and SHA-512 and select 6, 7, or 8 digits.',
      },
    ],
    example: {
      title: 'Build an otpauth:// provisioning URI from a Base32 secret.',
      input: 'Secret: JBSWY3DPEHPK3PXP, Issuer: ToolBox4Devs, Account: dev@example.com',
      output: 'otpauth://totp/ToolBox4Devs:dev%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=ToolBox4Devs&algorithm=SHA1&digits=6&period=30',
      inputLabel: '2FA configuration',
      outputLabel: 'otpauth:// URI',
    },
  },
}
