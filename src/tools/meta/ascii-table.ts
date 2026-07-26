import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const ASCII_TABLE_META: ToolMeta = {
  slug: 'ascii-table',
  name: 'ASCII Table',
  description: 'Browse ASCII characters in decimal, hex, and binary with search and quick copy actions.',
  category: 'data-tools',
  tag: 'data',
  keywords: ['ascii table', 'character codes', 'decimal to ascii', 'hex to ascii', 'binary ascii reference'],
  toolComponent: lazy(() => import('../../components/tools/data-tools/AsciiTable')),
  about: {
    summary: 'ASCII Table is a compact reference for control characters, printable characters, and their numeric encodings. It is useful when debugging protocols, serial data, escape sequences, old file formats, or low-level text transformations.',
    useCases: [
      'Checking character codes while debugging parsers or protocol payloads',
      'Mapping decimal, hex, and binary values during scripting or embedded work',
      'Looking up control characters like TAB, LF, CR, ESC, or DEL',
    ],
    features: [
      'Shows decimal, hexadecimal, and binary values side by side',
      'Searches by character, label, or encoded value',
      'Highlights control characters and printable characters in one table',
    ],
    tip: 'Search for “space”, “tab”, or a numeric code like 10 to jump directly to common control characters.',
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
}
