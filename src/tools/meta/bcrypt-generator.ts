import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const BCRYPT_GENERATOR_META: ToolMeta = {
  slug: 'bcrypt-generator',
  name: 'Bcrypt Hash Generator & Verifier',
  category: 'crypto-tools',
  tag: 'BCRYPT',
  description: 'Generate secure bcrypt password hashes with adjustable cost factors, analyze hash structures, and verify plaintext passwords against existing hashes.',
  keywords: ['bcrypt generator', 'bcrypt hash online', 'verify bcrypt password', 'bcrypt salt rounds', 'blowfish cipher', 'password hash generator'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/BcryptGenerator')),
  seo: {
    title: 'Bcrypt Hash Generator & Verifier — Password Hashing Tool',
    description: 'Generate bcrypt password hashes, verify candidate strings, and inspect bcrypt format parameters (cost, salt, checksum) client-side in browser.',
    extraKeywords: ['bcrypt online test', 'bcrypt compare password', 'bcrypt cost factor', '2a 2b bcrypt hash', 'secure password hashing'],
  },
  about: {
    summary: 'The Bcrypt Hash Generator & Verifier provides 100% private, client-side password hashing based on the Blowfish cipher with configurable work factors (rounds 4–14) and real-time password comparison.',
    useCases: [
      'Generating database seed hashes for administrator and user authentication',
      'Verifying whether candidate passwords match stored $2a$ / $2b$ hashes during debugging',
      'Inspecting cost factors and extracting embedded 22-character salts from hashes',
      'Benchmarking cryptographic hashing durations across different cost factors'
    ],
    features: [
      'Client-side Bcrypt generation with rounds 4 to 14',
      'Instant plaintext-to-hash verification testing',
      'Structural breakdown (prefix, cost iterations, salt, checksum)',
      'Benchmark duration metrics for cryptographic performance tuning'
    ],
    notes: [
      'Standard recommended production cost factor is 10 to 12 rounds',
      'All computations execute locally inside your browser runtime without network transfer'
    ],
    tip: 'Paste any existing bcrypt hash into the validator to test candidate passwords and extract salt metadata.'
  }
}
