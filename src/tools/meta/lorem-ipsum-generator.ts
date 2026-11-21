import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const LOREM_IPSUM_GENERATOR_META: ToolMeta = {
  slug: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum Generator',
  description: 'Create placeholder paragraphs for wireframes, prototypes, content mocks, and layout testing.',
  category: 'generate-tools',
  tag: 'generate',
  keywords: [
    'lorem ipsum generator',
    'placeholder text generator',
    'dummy text generator',
    'mock content generator',
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/LoremIpsumGenerator')),
  about: {
    summary: 'Lorem Ipsum Generator produces browser-based placeholder copy for design systems, landing pages, dashboards, and test fixtures. Adjust paragraph, sentence, and word counts to generate just enough filler text without leaving your workflow.',
    useCases: [
      'Filling empty states and card layouts during UI development',
      'Testing typography scales and reading rhythm in prototypes',
      'Generating safe placeholder content for screenshots and demos',
      'Mocking article bodies before real editorial copy is ready',
    ],
    features: [
      'Configurable paragraphs, sentences, and words per sentence',
      'Instant regeneration as you adjust sliders',
      'Word and character counts for layout planning',
      'One-click copy for dropping text into mockups or tests',
    ],
    tip: 'Use shorter sentence lengths when testing cards and dense dashboards, and longer paragraphs when reviewing article layouts.',
  },
  guide: {
    "steps": [
      {
        "name": "Set the paragraphs",
        "text": "Drag Paragraphs to choose 1 to 10 paragraphs."
      },
      {
        "name": "Set the sentences",
        "text": "Sentences per paragraph ranges from 2 to 8."
      },
      {
        "name": "Set the words",
        "text": "Words per sentence ranges from 4 to 20."
      },
      {
        "name": "Copy the text",
        "text": "Copy the Generated copy text and check the Words and Chars counts."
      }
    ],
    "faqs": [
      {
        "question": "Is the text random?",
        "answer": "No. The text cycles through a fixed list of Lorem Ipsum words, so the same settings always give the same output."
      },
      {
        "question": "How are sentences capitalised?",
        "answer": "The first letter of each sentence is capitalised, and the first sentence starts with 'Lorem'."
      },
      {
        "question": "Is anything sent to a server?",
        "answer": "No. The text is generated in your browser."
      }
    ],
    "example": {
      "title": "Generate one short paragraph.",
      "input": "1 paragraph · 2 sentences per paragraph · 4 words per sentence",
      "output": "Lorem ipsum dolor sit. Sit amet consectetur adipiscing.",
      "inputLabel": "Settings",
      "outputLabel": "Generated copy"
    }
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Lorem Ipsum Generator — Create placeholder copy in your browser',
    description: 'Generate placeholder paragraphs for prototypes, wireframes, and layouts instantly. Free and fully client-side.',
    extraKeywords: ['filler text generator', 'prototype text generator', 'ui placeholder text'],
  },
}
