import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const JWT_ENCODER_META: ToolMeta = {
  slug: 'jwt-encoder',
  name: 'JWT Encoder & Token Generator',
  description: 'Create and sign JSON Web Tokens (JWT) with HMAC algorithms (HS256/HS384/HS512) entirely in your browser.',
  category: 'auth-tools',
  tag: 'auth',
  keywords: ['jwt', 'token', 'encoder', 'generate', 'auth', 'bearer', 'json web token', 'hs256', 'signing'],
  status: 'stable',
  featured: false,
  isNew: true,
  complexity: 'simple',
  addedAt: '2026-08-23',
  toolComponent: lazy(() => import('../../components/tools/auth-tools/JwtEncoder')),
  about: {
    summary:
      'JWT Encoder creates signed JSON Web Tokens using the Web Crypto API. Build custom headers and payloads, choose an HMAC algorithm, and generate cryptographically signed tokens — all without any server roundtrip. Perfect for testing APIs, debugging authentication flows, and understanding JWT structure.',
    useCases: [
      'Generating test JWT tokens for API development and debugging',
      'Creating mock authentication tokens for frontend testing',
      'Understanding JWT structure by building tokens manually',
      'Testing token expiry and claim-based authorization logic',
      'Generating tokens for local development and sandbox environments',
    ],
    features: [
      'Supports HS256, HS384, and HS512 HMAC signing algorithms',
      'Customizable header and payload JSON fields',
      'Colored token display showing header, payload, and signature parts',
      'Copy-to-clipboard for the complete token or individual parts',
      'Uses Web Crypto API for secure, browser-native cryptographic signing',
    ],
    tip: 'Pair this with the JWT Decoder tool to create and verify tokens in a full round-trip test without leaving your browser.',
  },
  seo: {
    title: 'JWT Encoder & Token Generator — Create Signed JWTs Online',
    description: 'Create and sign JSON Web Tokens (JWT) with HMAC algorithms (HS256/HS384/HS512) entirely in your browser. Free, private, no server calls.',
    extraKeywords: [
      'jwt encoder', 'create jwt', 'generate jwt', 'jwt generator', 'sign jwt online',
      'hs256 jwt', 'jwt token creator', 'build jwt', 'jwt maker', 'jwt signing tool',
      'json web token encoder', 'generate bearer token', 'jwt test token',
    ],
  },
}
