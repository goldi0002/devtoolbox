import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const REGEX_RAILROAD_VISUALIZER_META: ToolMeta = {
  slug: 'regex-railroad-visualizer',
  name: 'Regex Railroad Visualizer',
  description: 'Visualize JavaScript regular expressions as interactive SVG railroad state diagrams with token-by-token plain-English explanations.',
  category: 'text-tools',
  tag: 'regex',
  icon: 'Regex',
  keywords: [
    'regex railroad diagram',
    'regex visualizer',
    'regular expression diagram svg',
    'regex explainer',
    'regex ast visualizer',
    'regex state machine diagram',
  ],
  toolComponent: lazy(() => import('../../components/tools/text-tools/RegexRailroadVisualizer')),
  about: {
    summary:
      'Regex Railroad Visualizer parses JavaScript regular expressions into an abstract syntax tree and renders them as clear, left-to-right SVG railroad diagrams. Optional paths appear as dashed bypass rails, quantifiers render amber repetition loops, alternations split into parallel branches, and capturing or lookaround groups are framed with labels—paired with a plain-English token breakdown and live test matcher.',
    useCases: [
      'Understanding complex legacy regular expressions during code reviews or incident debugging',
      'Exporting crisp SVG railroad diagrams to embed in engineering docs, PRs, or READMEs',
      'Teaching and verifying quantifier greediness, lookaheads, lookbehinds, and alternation precedence',
      'Checking live matches alongside the visual execution path',
    ],
    features: [
      'Pure TypeScript RegExp parser supporting groups, named groups, lookarounds, character classes, escapes, and lazy quantifiers',
      'Zoomable SVG Railroad Diagram with bypass tracks, repetition loops, and parallel alternation branches',
      'One-click SVG markup copy and .svg file download',
      'Token-by-token plain-English breakdown table',
      'Live test string matcher with flag toggles (g, i, m, s, u)',
    ],
    tip: 'Use the SVG download button to drop visual diagrams of validation rules directly into architecture RFCs or API documentation.',
  },
  addedAt: '2026-11-21',
  complexity: 'moderate',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Regex Railroad Diagram Visualizer & Explainer — SVG Online',
    description: 'Turn any JavaScript regular expression into an interactive SVG railroad diagram and plain-English token breakdown. 100% browser-side.',
    extraKeywords: [
      'regex railroad svg',
      'regex diagram generator',
      'explain regex online',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Enter or pick a regex pattern',
        text: 'Type any JavaScript regular expression or load one of the built-in presets such as Email, SemVer, ISO Date, IPv4, or JWT.',
      },
      {
        name: 'Trace the railroad diagram',
        text: 'Follow the tracks from the green start node to the indigo end node; dashed top rails show optional skips and amber bottom rails show loops.',
      },
      {
        name: 'Inspect the plain-English breakdown',
        text: 'Read the step-by-step token table to verify capturing group indices, character sets, and greedy vs lazy quantifiers.',
      },
      {
        name: 'Export SVG or test against text',
        text: 'Download the diagram as an .svg file or paste sample text to verify live matches.',
      },
    ],
    faqs: [
      {
        question: 'What do the colored rails in the railroad diagram mean?',
        answer: 'Dashed upper rails indicate optional bypasses (such as ? or *), amber lower rails indicate repetition loops (+, *, {m,n}), and vertical forks represent | alternations.',
      },
      {
        question: 'Does it support named capturing groups and lookarounds?',
        answer: 'Yes. Named groups (?<name>...), non-capturing groups (?:...), and positive/negative lookaheads and lookbehinds are all parsed and labeled.',
      },
      {
        question: 'Can I export the diagram for documentation?',
        answer: 'Yes. Click Copy or the SVG download button to save a standalone vector .svg file.',
      },
    ],
    example: {
      title: 'Visualize and explain an ISO date pattern.',
      input: '^(\\d{4})-(\\d{2})-(\\d{2})$',
      output: '1. ^ (Start) -> 2. Group #1 (\\d{4}) -> 3. "-" -> 4. Group #2 (\\d{2}) -> 5. "-" -> 6. Group #3 (\\d{2}) -> 7. $ (End)',
      inputLabel: 'Regex pattern',
      outputLabel: 'Visual & token flow',
    },
  },
}
