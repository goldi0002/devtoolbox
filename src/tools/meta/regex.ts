import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const REGEX_META: ToolMeta = {
    slug: 'regex',
    name: 'Regex Tester',
    description: 'Test regular expressions live against sample text with match highlighting.',
    category: 'text-tools',
    tag: 'text',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test'],
    toolComponent: lazy(() => import('../../components/tools/text-tools/RegexTester')),
    about: {
        summary:
            'Regex Tester allows you to write and test regular expressions against sample text in real time. As you type your regex pattern, it highlights matches in the sample text and shows captured groups. Perfect for debugging complex regexes or learning how they work.',
        useCases: [
            'Testing regex patterns for form validation',
            'Debugging regexes used in code or configuration files',
            'Learning regex syntax by seeing live matches',
            'Extracting specific data from text using capture groups',
            'Comparing different regex patterns to find the most efficient one',
        ],
        features: [
            'Live match highlighting as you type your regex pattern',
            'Supports all standard JavaScript regex features',
            'Displays captured groups separately for easy inspection',
            'Toggle global (g), case-insensitive (i), and multiline (m) flags',
            'Copy your regex pattern or the matched results with one click',
        ],
        tip: 'Start with a simple regex and gradually build it up — the live feedback helps you understand how each part of the pattern works.',
    },
    addedAt: '2026-03-15',
    complexity: 'moderate',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'Regex Tester — Test regular expressions online with live match highlighting',
        description: 'Test regular expressions live against sample text with the Regex Tester tool. Highlights matches and captured groups in real time as you type your regex pattern. Free, runs entirely in your browser.',
        extraKeywords: [
            'regex tester',
            'regular expression tester',
            'test regex online',
            'regex match highlighter',
            'live regex tester',
            'regex testing tool',
            'debug regex patterns',
            'learn regex online',
        ],
    }
}