import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const WORD_FREQUENCY_META: ToolMeta = {
  slug: 'word-frequency',
  name: 'Word / Character Frequency',
  description: 'Count how often each word and character appears in a text, sorted by frequency, with percentages and copyable CSV.',
  category: 'analyze-tools',
  tag: 'Analyze',
  icon: 'BarChart3',
  keywords: [
    'word frequency',
    'character frequency',
    'letter frequency',
    'word count frequency',
    'most common words',
    'text frequency analyzer',
    'character counter',
    'keyword density',
  ],
  toolComponent: lazy(() => import('../../components/tools/analyze-tools/WordFrequency')),
  about: {
    summary: 'Word / Character Frequency counts how often each word and each character appears in a block of text. Words are split on letters and numbers in any script, so accented and non-Latin text works. Results appear in two sortable tables with totals and percentages. Everything runs in your browser; nothing is uploaded.',
    useCases: [
      'Finding the most repeated words in an article or draft.',
      'Checking keyword density before publishing copy.',
      'Spotting stray characters, odd spacing or unexpected symbols in a dataset.',
      'Comparing vocabulary across two versions of a text.',
    ],
    features: [
      'Word table sorted by count, with percentages of all counted words.',
      'Character table that includes spaces, newlines, tabs and punctuation, with names for invisible characters.',
      'Ignore case and ignore common English stop words options.',
      'Click any column header to sort; the table is keyboard accessible.',
      'Show the top 10, 25, 50 or 100 rows, or all of them.',
      'Totals for words and characters, plus copy as CSV or plain text.',
    ],
    tip: 'Turn on "Ignore stop words" before reading a word table; otherwise "the", "and" and "of" usually come out on top.',
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Word & Character Frequency Analyzer — Count words and letters online',
    description: 'Count word and character frequency in any text. Sort by count, ignore case or stop words, and copy CSV. Works with accented and non-Latin text. 100% client-side and private.',
    extraKeywords: [
      'word frequency counter',
      'character frequency counter',
      'letter frequency analyzer',
      'most frequent words in text',
      'keyword frequency tool',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Paste your text',
        text: 'Type or paste the text into the field, or drop a plain text file onto it. Results update as you type; very long text may take a moment to refresh.',
      },
      {
        name: 'Set the options',
        text: 'Ignore case merges "The" and "the". Ignore stop words removes common words such as "the", "and" and "of" from the word table. Show top limits how many rows each table displays.',
      },
      {
        name: 'Sort the tables',
        text: 'Click a column header to sort by that column; click it again to reverse the order. The arrow and aria-sort state show the current sort. Sorting works with the keyboard too.',
      },
      {
        name: 'Copy the results',
        text: 'Copy CSV or Copy text copies the rows currently shown, so a top-25 view copies 25 rows. The CSV has a header row and quotes any field that needs it.',
      },
    ],
    faqs: [
      {
        question: 'How are words split?',
        answer: 'A word is a run of letters or numbers in any script. An apostrophe inside a word is kept, so "don\'t" is one word. Hyphens and other punctuation separate words, so "well-known" counts as two.',
      },
      {
        question: 'Why does the character table show "Space" or "U+200D"?',
        answer: 'Invisible characters are hard to read in a table, so spaces, newlines and tabs are named. Other control or formatting characters are shown as their Unicode code point, for example U+200D for a zero-width joiner.',
      },
      {
        question: 'How are percentages calculated?',
        answer: 'Each percentage is the item\'s count divided by the total for that table. With Ignore stop words on, the word percentages use the total after stop words are removed.',
      },
      {
        question: 'Is my text uploaded anywhere?',
        answer: 'No. Counting and sorting run in your browser, and nothing is sent to a server.',
      },
    ],
    example: {
      title: 'Count the words in a short sentence with stop words removed.',
      input: 'The cat sat on the mat. The cat was happy.',
      output: 'cat: 2 (40.00%)\nhappy: 1 (20.00%)\nmat: 1 (20.00%)\nsat: 1 (20.00%)',
      inputLabel: 'Text',
      outputLabel: 'Word table (Ignore stop words on, plain text copy)',
    },
  },
}
