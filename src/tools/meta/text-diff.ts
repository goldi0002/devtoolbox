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
    },
    guide: {
        "steps": [
            {
                "name": "Paste the original text",
                "text": "Put the first version in the Original (A) box."
            },
            {
                "name": "Paste the changed text",
                "text": "Put the second version in the Modified (B) box."
            },
            {
                "name": "Click Compare",
                "text": "The tool compares both versions line by line."
            },
            {
                "name": "Review the changes",
                "text": "Added lines are highlighted in green and removed lines in red, with unchanged lines kept for context."
            }
        ],
        "faqs": [
            {
                "question": "How does the comparison work?",
                "answer": "It is a line-based diff, the same approach git uses. Each line in A is matched against B, and lines that exist on only one side are marked as removed or added."
            },
            {
                "question": "Why are lines marked as changed when they look identical?",
                "answer": "Usually because of invisible differences: trailing spaces, tabs versus spaces, or Windows (CRLF) versus Unix (LF) line endings."
            },
            {
                "question": "How should I compare two JSON documents?",
                "answer": "Format both with the same indentation and sort their keys first. Otherwise key order and whitespace create differences that are not real changes."
            },
            {
                "question": "Can I compare code or config files?",
                "answer": "Yes. Any plain text works, including source code, .env files, YAML, SQL and logs."
            }
        ],
        "example": {
            "title": "Compare two versions of a config file.",
            "input": "A:\nPORT=3000\nDEBUG=true\n\nB:\nPORT=8080\nDEBUG=true\nLOG_LEVEL=info",
            "output": "- PORT=3000\n+ PORT=8080\n  DEBUG=true\n+ LOG_LEVEL=info",
            "inputLabel": "Original and modified",
            "outputLabel": "Diff"
        }
    },
}