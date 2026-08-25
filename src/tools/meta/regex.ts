import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const REGEX_META: ToolMeta = {
  slug: 'regex',
  name: 'Regex Tester & Checker',
  description: 'Test and check regular expressions online live against sample text with real-time match and group highlighting.',
  category: 'text-tools',
  tag: 'text',
  keywords: [
    'check regex online',
    'regex tester',
    'regex checker',
    'test regex online',
    'check regex',
    'regexp',
    'regular expression tester',
    'regex pattern tester',
    'regex match highlighter',
    'regex debugger'
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/RegexTester')),
  about: {
    summary:
      'Regex Tester & Checker allows you to write, check, and test regular expressions against sample text in real time. As you type your regex pattern, it highlights matches in the sample text and shows captured groups with full flag controls (global, case-insensitive, multiline, dotAll). Perfect for debugging complex patterns or testing form validations.',
    useCases: [
      'Checking and testing regex patterns for form validation, emails, and passwords',
      'Debugging regex patterns used in code, scripts, or configuration files',
      'Learning regex syntax and seeing live matches with interactive flags',
      'Extracting specific data from text using capture groups',
      'Comparing different regex patterns to find the most efficient one',
    ],
    features: [
      'Live match highlighting as you type your regex pattern',
      'Full support for standard JavaScript ECMAScript regex engine',
      'Displays captured groups and indices separately for easy inspection',
      'Toggle global (g), case-insensitive (i), multiline (m), dotAll (s), and unicode (u) flags',
      'Copy your regex pattern or matched results with one click',
      '100% in-browser processing with zero network logging'
    ],
    tip: 'Start with a simple regex and gradually build it up — the live feedback helps you understand how each part of the pattern works.',
  },
  addedAt: '2026-03-15',
  complexity: 'moderate',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Check Regex Online — Live Regular Expression Tester & Match Highlighter',
    description: 'Check regex online with live match highlighting and capture group inspection. Test regular expressions in real time. Free, 100% client-side tool.',
    extraKeywords: [
      'check regex online',
      'regex tester online',
      'check regex',
      'test regex online',
      'regular expression checker',
      'regex match highlighter',
      'live regex tester',
      'debug regex patterns',
      'learn regex online',
    ],
  }
}
