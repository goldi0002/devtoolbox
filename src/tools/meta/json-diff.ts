import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const JSON_DIFF_META: ToolMeta = {
  slug: 'json-diff',
  name: 'JSON Diff',
  description: 'Compare two JSON documents by structure and list every added, removed and changed value by its JSON path.',
  category: 'json-tools',
  tag: 'json',
  icon: 'GitCompare',
  keywords: [
    'json diff',
    'json compare',
    'compare json',
    'json difference',
    'json changes',
    'diff two json',
    'structural diff',
  ],
  toolComponent: lazy(() => import('../../components/tools/json-tools/JsonDiff')),
  about: {
    summary: 'JSON Diff compares two JSON documents by their structure instead of their text. It walks both values and lists each key or array item that was added, removed or changed, with its JSON path, so reformatting or reordered keys never show up as noise. Everything runs in your browser; nothing is uploaded.',
    useCases: [
      'Spotting what changed between two API responses.',
      'Reviewing edits to a JSON config or package manifest.',
      'Checking a migration or transform kept every field.',
      'Comparing test fixtures against real output.',
    ],
    features: [
      'Key order and whitespace are ignored; only real value changes count.',
      'Each change is listed with its JSON path, e.g. $.user.tags[1].',
      'Detects type changes, such as a number that became a string.',
      'Optional "Ignore array order" mode for lists where order does not matter.',
      'Copy the change list as plain text.',
    ],
    tip: 'Turn on "Ignore array order" when comparing lists of IDs or tags; otherwise one item inserted at the start shows every later item as changed.',
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'JSON Diff — Compare two JSON documents by structure online',
    description: 'Compare two JSON files and see every added, removed and changed value by JSON path. Ignores key order and formatting. 100% client-side and private.',
    extraKeywords: [
      'json diff online',
      'compare two json objects',
      'json compare tool',
      'json object difference',
      'json diff ignore order',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Paste both documents',
        text: 'Paste the original JSON into Original (left) and the new version into Changed (right). Parse errors are shown under the field that has them.',
      },
      {
        name: 'Read the change list',
        text: 'Each row shows the JSON path and what happened: added, removed, changed (old → new) or a type change. Counters above the list total each kind.',
      },
      {
        name: 'Choose how arrays compare',
        text: 'By default array items are compared by position. Tick Ignore array order to report only items that exist on one side and not the other.',
      },
      {
        name: 'Copy the result',
        text: 'Copy changes puts the list on your clipboard, one change per line, marked + for added, - for removed and ~ for changed.',
      },
    ],
    faqs: [
      {
        question: 'Does key order or formatting count as a change?',
        answer: 'No. The documents are parsed first, so indentation, spacing and the order of keys in an object are ignored.',
      },
      {
        question: 'What is a type change?',
        answer: 'The value at a path has a different JSON type on each side, for example 1 and "1", or null and an object. It is reported once, without listing the contents underneath.',
      },
      {
        question: 'How does Ignore array order handle duplicates?',
        answer: 'Items are matched one to one, so [1, 1, 2] against [1, 2] reports one removed 1. Objects inside arrays match when their content is equal, whatever their key order.',
      },
      {
        question: 'Is my JSON uploaded anywhere?',
        answer: 'No. Parsing and comparison run in your browser and nothing is sent to a server.',
      },
    ],
    example: {
      title: 'Compare two versions of a user record.',
      input: '{"name":"Ada","age":36,"tags":["admin"],"city":"London"}\n---\n{"name":"Ada","age":37,"tags":["admin","ops"],"id":"7"}',
      output: '~ $.age: 36 → 37\n+ $.tags[1]: "ops"\n- $.city: "London"\n+ $.id: "7"',
      inputLabel: 'Original --- Changed',
      outputLabel: 'Changes',
    },
  },
}
