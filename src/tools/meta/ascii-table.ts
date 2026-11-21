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
  guide: {
    "steps": [
      {
        "name": "Search the table",
        "text": "Type a character, a label such as SPACE or TAB, a decimal code, a hex code like 0x41, or a binary value into the search box."
      },
      {
        "name": "Read a row",
        "text": "Each row shows the decimal, hex and binary value, the character and its label."
      },
      {
        "name": "Spot control characters",
        "text": "Codes 0 to 31 and 127 are control characters. Their Char cell shows a dot and their Label gives the name, such as LF or ESC."
      },
      {
        "name": "Copy a code",
        "text": "Use the copy button on a row to copy its decimal code."
      }
    ],
    "faqs": [
      {
        "question": "Which characters are covered?",
        "answer": "The table lists the 128 ASCII codes from 0 to 127. Accented letters, emoji and other non-ASCII characters are not included."
      },
      {
        "question": "How does the search match?",
        "answer": "It checks each row's label, character, decimal code and binary value for your text. A hex search matches the hex code, and a leading 0x is ignored."
      },
      {
        "question": "Why does the space character have a symbol?",
        "answer": "Code 32 is shown as a visible space symbol in the Char column and labelled SPACE, so it is easy to find."
      },
      {
        "question": "Is anything sent to a server?",
        "answer": "No. The table is built from a list in the page and searching happens in your browser."
      }
    ],
    "example": {
      "title": "Find the code for uppercase A by its hex value.",
      "input": "0x41",
      "output": "Dec 65, Hex 0x41, Binary 01000001, Char A",
      "inputLabel": "Search",
      "outputLabel": "Matching row"
    }
  },
  addedAt: '2026-03-20',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'ASCII Table — Decimal, Hex, Binary & Character Code Chart',
    description: 'Searchable ASCII table with decimal, hex and binary codes for every character, including control codes. Search and copy any value.',
  },
}
