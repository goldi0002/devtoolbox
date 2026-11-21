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
  guide: {
    "steps": [
      {
        "name": "Choose an algorithm",
        "text": "Pick HS256, HS384 or HS512."
      },
      {
        "name": "Edit the header and payload",
        "text": "Change Header (JSON) and Payload (JSON Claims). The chosen algorithm overrides the alg field in the header."
      },
      {
        "name": "Enter a signing secret",
        "text": "Type the key into Signing Secret Key. It is used only for HMAC signing."
      },
      {
        "name": "Generate the token",
        "text": "Click Generate JWT Token. The header, payload and signature are shown in colour, and you can copy the whole token."
      }
    ],
    "faqs": [
      {
        "question": "Does it verify tokens?",
        "answer": "No. This tool only creates and signs tokens. Use the JWT decoder to inspect one."
      },
      {
        "question": "Are RS256 or ES256 supported?",
        "answer": "No. Only the HMAC algorithms HS256, HS384 and HS512 are available."
      },
      {
        "question": "Are iat or exp added for me?",
        "answer": "No. The token contains exactly the header and payload JSON you enter."
      },
      {
        "question": "Why do I see an error?",
        "answer": "The header and payload must be valid JSON, and the signing secret cannot be empty."
      },
      {
        "question": "Is my secret sent anywhere?",
        "answer": "No. Signing uses the Web Crypto API in your browser."
      }
    ],
    "example": {
      "title": "Sign a payload with HS256 using the sample secret your-256-bit-secret.",
      "input": "{\"sub\":\"user_123\",\"iat\":1700000000}",
      "output": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcwMDAwMDAwMH0.qJyQX_EgwL52J9JhduhYJEL9lZwGyYdPol_CDSXhpEY",
      "inputLabel": "Payload (JSON Claims)",
      "outputLabel": "Generated JWT Token"
    }
  },
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
