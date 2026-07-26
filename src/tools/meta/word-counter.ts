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
    addedAt: '2026-03-12',

    // ── Component ─────────────────────────────────────────────────────────
    toolComponent: lazy(() => import('../../components/tools/analyze-tools/WordCounter')),
}