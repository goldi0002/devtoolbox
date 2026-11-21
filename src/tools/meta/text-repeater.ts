import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TEXT_REPEATER_META: ToolMeta = {
  slug: 'text-repeater',
  name: 'Text Repeater & Multiplier',
  description: 'Replicate and repeat text, characters, or strings up to thousands of times with custom separators and formatting options.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'text repeater',
    'repeat text online',
    'string replicator',
    'text replicator',
    'text multiplier',
    'repeat text 1000 times',
    'duplicate text generator',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/TextRepeater')),
  about: {
    summary: 'Text Repeater is a fast, highly-customizable text replication tool. Perfect for developers, QA engineers, and designers who need to generate bulk strings, mock data, repeat characters for dividers, or stress-test form fields with massive inputs.',
    useCases: [
      'Stress testing inputs and textarea fields with large amounts of repeated text',
      'Generating long visual dividers or layout boundary strings',
      'Creating bulk text strings for performance and rendering testing',
      'Repeating emoji strings or characters for decorative uses',
    ],
    features: [
      'Repeat any text up to 50,000 times instantly',
      'Multiple separator options (newline, space, tab, comma, custom string, or none)',
      'Add line numbers or item indexes to repeated segments',
      'One-click clipboard copy and text stats (characters, lines, size in KB/MB)',
      'Option to trim trailing whitespace or separators',
    ],
    tip: 'Toggle the "Prefix / Numbering" option to prefix each repetition, making it easy to create numbered list structures or track iterations.',
  },
  guide: {
    "steps": [
      {
        "name": "Enter the source text",
        "text": "Type or paste text into Source Text. Emoji and multi-line text work too."
      },
      {
        "name": "Set the iterations",
        "text": "Use the number box, the slider or the presets to set Iterations, up to 50,000."
      },
      {
        "name": "Choose separator and numbering",
        "text": "Pick a Separator (Newline, Space, Comma, None or Custom) and a Prefix / Numbering style."
      },
      {
        "name": "Copy the output",
        "text": "Copy the result from Repeated Text Output. Total Repeats and Length update as you change settings."
      }
    ],
    "faqs": [
      {
        "question": "What is the maximum number of repeats?",
        "answer": "The limit is 50,000. The number box and slider do not accept larger values."
      },
      {
        "question": "How do I make a numbered list?",
        "answer": "Pick a numbering style such as 1. Text, 1: Text or [1] Text. Each repeat then gets its own number."
      },
      {
        "question": "What does Trim trailing spaces do?",
        "answer": "When it is on, whitespace at the start and end of the finished output is removed."
      },
      {
        "question": "What goes between repeats with a custom separator?",
        "answer": "Whatever you type in the custom field, including spaces and symbols such as | or -."
      }
    ],
    "example": {
      "title": "Repeat a word three times with comma separators and numbering.",
      "input": "Source Text: ab\nIterations: 3\nSeparator: Comma\nPrefix / Numbering: 1. Text",
      "output": "1. ab, 2. ab, 3. ab",
      "inputLabel": "Settings",
      "outputLabel": "Repeated Text Output"
    }
  },
  addedAt: '2026-08-22',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Text Repeater — Replicate and repeat text 1000+ times',
    description: 'Replicate and repeat any text, word, or character thousands of times. Fully customizable with newline, space, custom separators, and item numbering.',
    extraKeywords: [
      'online text repeater',
      'word repeater tool',
      'bulk text multiplier',
      'string doubler',
    ],
  },
}
