import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const TEXT_DIFF_META: ToolMeta = {
    slug: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two text blocks line-by-line and highlight every change.',
    category: 'text-tools',
    tag: 'diff',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes'],
    toolComponent: lazy(() => import('../../components/tools/text-tools/TextDiff')),
    about: {
        summary:
            'Text Diff compares two blocks of text line-by-line and highlights exactly what changed — additions in green, deletions in red. Useful for comparing code snippets, configuration files, API responses, or any two pieces of text where you need to spot differences fast.',
        useCases: [
            'Comparing two versions of a config file or environment variables',
            'Spotting differences between two API responses',
            'Reviewing changes in SQL queries or script outputs',
            'Comparing translated text against the original source',
            'Identifying what changed between two log outputs',
        ],
        features: [
            'Line-by-line diff with added and removed lines highlighted',
            'Side-by-side or unified diff view',
            'Shows unchanged lines for context',
            'Works with any plain text — code, JSON, markdown, logs',
            'Diff summary showing total additions and deletions',
        ],
        tip: 'For comparing JSON, format both sides with the JSON Formatter first — that way whitespace differences don\'t create false positives in the diff.',
    },
    addedAt: '2026-03-14',
    complexity: 'moderate',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'Text Diff Tool — Compare two text blocks and highlight differences',
        description: 'Compare two pieces of text line-by-line with the Text Diff tool. Additions are highlighted in green, deletions in red. Useful for comparing code snippets, config files, API responses, and more. Free, runs entirely in your browser.',
        extraKeywords: [
            'text diff tool',
            'compare text online',
            'difference between two texts',
            'text comparison tool',
            'line by line diff',
            'text changes highlighter',
            'diff checker for text',
            'compare code snippets',
            'compare api responses',
        ],
    }
}