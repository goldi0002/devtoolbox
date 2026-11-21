import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const HASH_COMPARATOR_META: ToolMeta = {
  slug: 'hash-comparator',
  name: 'Hash Comparator',
  description: 'Compare two hashes or checksums after trimming whitespace and normalizing letter case.',
  category: 'encode-tools',
  tag: 'encode',
  keywords: ['hash comparator', 'checksum compare', 'md5 compare', 'sha compare', 'digest comparison'],
  toolComponent: lazy(() => import('../../components/tools/encode-tools/HashComparator')),
  about: {
    summary: 'Hash Comparator is a lightweight utility for verifying whether two pasted digests represent the same value once case differences and stray whitespace are removed. It is handy when comparing CLI output, logs, copied checksums, or deployment artifacts.',
    useCases: [
      'Checking whether two copied hashes are actually identical',
      'Comparing checksum output from different tools or environments',
      'Removing formatting noise before verifying artifact integrity',
    ],
    features: [
      'Normalizes case and whitespace before comparing values',
      'Shows normalized versions side by side for quick inspection',
      'Works with MD5, SHA-family hashes, and arbitrary digest strings',
    ],
    tip: 'If your hashes differ only in uppercase vs lowercase hex digits, this tool will still mark them as equal.',
  },
  guide: {
    "steps": [
      {
        "name": "Paste the first hash",
        "text": "Paste the first digest or checksum into Hash A."
      },
      {
        "name": "Paste the second hash",
        "text": "Paste the value to check into Hash B."
      },
      {
        "name": "Read the comparison",
        "text": "The Comparison panel says whether the two values match after normalization."
      },
      {
        "name": "Check the normalized values",
        "text": "Normalized A and Normalized B show exactly what was compared."
      }
    ],
    "faqs": [
      {
        "question": "What does normalization change?",
        "answer": "Letters are lowercased and all whitespace, including spaces inside the value, is removed. Only case and spacing are ignored, so the remaining characters must be identical."
      },
      {
        "question": "Does the tool compute hashes?",
        "answer": "No. It compares two values you paste. To check a file, compute its hash with a tool such as sha256sum first."
      },
      {
        "question": "Does a match prove a file is intact?",
        "answer": "It only shows that the two strings match. The tool cannot tell where either value came from, so compare against a checksum from a source you trust."
      },
      {
        "question": "Can I compare hashes from different algorithms?",
        "answer": "The comparison runs, but the values will not match. Each algorithm produces a different length and value, so compare hashes made with the same algorithm."
      }
    ],
    "example": {
      "title": "Two digests that differ only in case and spacing.",
      "input": "Hash A: ABCD 1234\nHash B: abcd1234",
      "output": "The hashes match after case and whitespace normalization.",
      "inputLabel": "Hashes",
      "outputLabel": "Comparison"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Hash Comparator — Compare MD5, SHA-256 & File Checksums',
    description: 'Check whether two hashes or checksums match, ignoring whitespace and letter case. Verify downloads and file integrity privately in your browser.',
  },
}
