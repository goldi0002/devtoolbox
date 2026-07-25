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
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
