import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const WORD_COUNTER_META: ToolMeta = {
    // ── Identity ──────────────────────────────────────────────────────────
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, paragraphs and reading time instantly.',
    category: 'analyze-tools',
    tag: 'Analyze',

    // ── Discovery ─────────────────────────────────────────────────────────
    keywords: [
        'word count', 'character count', 'text analysis', 'writing tools',
        'reading time', 'unique word count', 'sentence count', 'seo optimization',
    ],
    seo: {
        title: 'Word Counter — Count Words & Analyze Text | ToolBox4Devs',
        description: 'Free browser-based word counter. Instantly count words, characters, sentences and reading time. No data leaves your browser.',
        extraKeywords: ['text analysis', 'writing optimization', 'content analysis', 'word frequency'],
    },

    // ── Content ───────────────────────────────────────────────────────────
    about: {
        summary: 'Paste any text to instantly see word count, character count, sentence count, estimated reading time, and the most frequently used words.',
        useCases: [
            'Check essay or article word count',
            'Estimate reading time for blog posts',
            'Analyze word frequency in content',
            'Count characters for social media limits',
        ],
        features: [
            'Counts words, characters, sentences, paragraphs and lines.',
            'Shows top word frequency with a visual bar chart.',
            'Estimates reading time at 200 words per minute.',
        ],
        tip: 'For the most accurate count, remove unnecessary leading/trailing spaces. The top words panel can help spot overused words in your writing.',
        notes: [
            'Reading time is estimated at 200 words per minute.',
            'Word frequency ignores single-character words and punctuation.',
        ],
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: 'stable',   // was 'beta' — no reason to ship as beta for a simple tool
    complexity: 'simple',
    featured: true,
    isNew: true,
    guide: {
      "steps": [
        {
          "name": "Enter text",
          "text": "Paste or type text into Text Input."
        },
        {
          "name": "Read the stat cards",
          "text": "Words, Characters (with a no-spaces count), Sentences, Paragraphs, Lines and Read time update as you type."
        },
        {
          "name": "Review the secondary stats",
          "text": "Check Avg word length and the Top words list, which shows the most frequent words with their counts and percentages."
        },
        {
          "name": "Load or clear",
          "text": "Use ← example to load sample text, or Clear to empty the box."
        }
      ],
      "faqs": [
        {
          "question": "How is reading time estimated?",
          "answer": "The word count is divided by 200 words per minute, and the result is shown in seconds or in minutes and seconds."
        },
        {
          "question": "What counts as a word?",
          "answer": "Any run of non-whitespace characters, so a hyphenated term or a number with a full stop counts as one word."
        },
        {
          "question": "Which words appear in Top words?",
          "answer": "Words are lowercased and punctuation is removed (apostrophes are kept). Single-character words are ignored, and only the eight most frequent words are shown."
        },
        {
          "question": "How are sentences counted?",
          "answer": "Sentences end at a full stop, exclamation mark or question mark."
        }
      ],
      "example": {
        "title": "Count a one-sentence line.",
        "input": "The quick brown fox jumps over the lazy dog.",
        "output": "9 words · 44 characters (36 without spaces) · 1 sentence · 3s read time",
        "inputLabel": "Text Input",
        "outputLabel": "Stats"
      }
    },
    addedAt: '2026-03-12',

    // ── Component ─────────────────────────────────────────────────────────
    toolComponent: lazy(() => import('../../components/tools/analyze-tools/WordCounter')),
}