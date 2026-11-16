import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const NANOID_GENERATOR_META: ToolMeta = {
  slug: 'nanoid-generator',
  name: 'NanoID Generator',
  description: 'Generate compact, URL-friendly random IDs with a custom length (4–64) and alphabet, up to 100 at a time.',
  category: 'generate-tools',
  tag: 'generate',
  icon: 'Hash',
  keywords: [
    'nanoid generator',
    'nano id',
    'short id generator',
    'random id generator',
    'url safe id',
    'custom alphabet id',
    'unique id generator',
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/NanoIdGenerator')),
  about: {
    summary:
      'NanoID Generator creates short random identifiers in the NanoID style: a fixed length drawn from a URL-safe alphabet using the browser\'s cryptographically secure random number generator. The default 21 characters from the 64-character NanoID alphabet give about 126 bits of randomness, comparable to a UUID v4 in far fewer characters.',
    useCases: [
      'Short IDs for URLs, slugs, or share links',
      'Primary keys or public identifiers where UUIDs are too long',
      'Test fixtures and seed data with realistic IDs',
      'Invite codes or short tokens from a restricted alphabet, such as numbers only',
    ],
    features: [
      'Uses crypto.getRandomValues with no modulo bias, so every character is equally likely',
      'Length from 4 to 64 characters, default 21',
      'Preset alphabets: NanoID default, alphanumeric, lowercase, no look-alikes, hex, numbers',
      'Custom alphabet of 2 to 256 unique characters',
      'Shows the bits of randomness per ID for the chosen settings',
      'Generate up to 100 IDs and copy one or all',
    ],
    tip: 'Shorter IDs and smaller alphabets mean more chance of a collision. Keep the randomness well above 64 bits for IDs that must be unique across a large system.',
  },
  addedAt: '2026-11-16',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'NanoID Generator — Short, URL-safe random IDs online',
    description: 'Generate NanoID-style random IDs with custom length and alphabet using secure browser randomness. Bulk generate up to 100. Free, 100% client-side.',
    extraKeywords: ['nanoid generator', 'short id generator', 'url safe id generator'],
  },
  guide: {
    steps: [
      { name: 'Pick an alphabet', text: 'Choose a preset such as the NanoID default or numbers only, or pick Custom and type the characters to use.' },
      { name: 'Set length and count', text: 'Choose an ID length between 4 and 64 and how many IDs to make, up to 100. The bits of randomness per ID update as you change them.' },
      { name: 'Generate and copy', text: 'Press Generate, then copy a single ID or the whole list, one ID per line.' },
    ],
    faqs: [
      {
        question: 'Is this the same as the nanoid npm package?',
        answer: 'It follows the same approach: secure random bytes, masking and discarding out-of-range values, and the same default 64-character alphabet and length of 21. It is a separate implementation that runs in the page; it does not load the package.',
      },
      {
        question: 'How unique are the IDs?',
        answer: 'Uniqueness comes from randomness. The default settings give about 126 bits per ID, so a collision is extremely unlikely. The tool shows the bits for your settings; fewer bits means a collision is more likely.',
      },
      {
        question: 'Does it generate CUIDs?',
        answer: 'No. It generates random IDs from an alphabet. CUID2 uses a hash of a timestamp, counter and other inputs, which this tool does not implement.',
      },
      {
        question: 'Why must custom alphabet characters be unique?',
        answer: 'A repeated character would be picked more often than the others, which reduces the randomness of the IDs, so the tool refuses it.',
      },
    ],
    example: {
      title: 'Generate one ID with the default settings.',
      input: 'Alphabet: NanoID default, length: 21, count: 1',
      output: 'V1StGXR8_Z5jdHi6B-myT',
      inputLabel: 'Settings',
      outputLabel: 'Example ID (yours will differ)',
    },
  },
}
