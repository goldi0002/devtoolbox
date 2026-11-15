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
  },
  guide: {
    "steps": [
      {
        "name": "Enter a pattern",
        "text": "Type your regular expression without the surrounding slashes, or start from a preset such as Email, URL, IPv4 or ISO 8601 Date."
      },
      {
        "name": "Set the flags",
        "text": "Toggle g (global), i (case-insensitive), m (multiline) and s (dotAll) to change how the pattern matches."
      },
      {
        "name": "Add a test string",
        "text": "Paste the text you want to match against. Matches are highlighted as you type."
      },
      {
        "name": "Inspect matches and groups",
        "text": "Review each match with its index, length and captured groups, then copy the pattern into your code."
      }
    ],
    "faqs": [
      {
        "question": "Which regex flavor does this tester use?",
        "answer": "It uses your browser's JavaScript (ECMAScript) engine. Patterns behave exactly as they will in Node.js and browser code. Syntax specific to PCRE, Python or .NET, such as possessive quantifiers, may not work."
      },
      {
        "question": "Why does my regex only find the first match?",
        "answer": "The global flag is off. Enable g to find every match in the text instead of stopping at the first one."
      },
      {
        "question": "What do the m and s flags do?",
        "answer": "With m, ^ and $ match at the start and end of every line rather than the whole string. With s, the dot also matches newline characters."
      },
      {
        "question": "How do I match a literal dot or slash?",
        "answer": "Escape it with a backslash: \\. matches a dot and \\/ matches a slash. Unescaped, a dot matches any character."
      }
    ],
    "example": {
      "title": "Find ISO dates in a sentence with the global flag on.",
      "input": "Pattern: \\d{4}-\\d{2}-\\d{2}\nFlags: g\n\nCreated on 2024-01-15, updated 2024-03-22.",
      "output": "Match 1: 2024-01-15 (index 11)\nMatch 2: 2024-03-22 (index 31)",
      "inputLabel": "Pattern and test string",
      "outputLabel": "Matches"
    }
  },
}
