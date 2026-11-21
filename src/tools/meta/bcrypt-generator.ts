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
  guide: {
    "steps": [
      {
        "name": "Set the cost factor",
        "text": "Choose Cost Factor (Rounds) between 4 and 14 before generating a hash. Higher values take longer to compute."
      },
      {
        "name": "Generate a hash",
        "text": "Enter a password and select Generate Bcrypt Hash. The hash is computed in your browser."
      },
      {
        "name": "Verify a password",
        "text": "Paste an existing hash into the verifier, type the plaintext and select Verify Match."
      },
      {
        "name": "Inspect the hash",
        "text": "The validator shows the prefix or version, the cost factor and the extracted salt of the hash you pasted."
      }
    ],
    "faqs": [
      {
        "question": "Why does the same password give a different hash each time?",
        "answer": "bcrypt adds a new random salt to every hash, so two hashes of one password differ. Both still verify against that password."
      },
      {
        "question": "Which hash prefixes can the verifier read?",
        "answer": "The verifier accepts hashes that start with $2a$, $2b$ or $2y$, as the field label says."
      },
      {
        "question": "What does a higher cost factor change?",
        "answer": "Each extra round doubles the work needed to compute a hash. That slows down guessing, and it also slows your own hashing."
      },
      {
        "question": "Is my password sent to a server?",
        "answer": "No. Hashing and verification run in your browser."
      }
    ],
    "example": {
      "title": "Read the details of an existing bcrypt hash.",
      "input": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "output": "Prefix / Version: $2a$ · Cost Factor (Rounds): 10 · Extracted Salt (22 chars): N9qo8uLOickgx2ZMRZoMye",
      "inputLabel": "Bcrypt hash",
      "outputLabel": "Validator details"
    }
  },
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
