import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const MARKDOWN_TABLE_TO_JSON_META: ToolMeta = {
  slug: 'markdown-table-to-json',
  name: 'Markdown Table to JSON',
  category: 'text-tools',
  tag: 'text',
  description: 'Convert GitHub-flavored Markdown tables into JSON objects with typed values.',
  keywords: [
    'markdown table to json',
    'markdown to json',
    'table to json',
    'github markdown table converter',
    'markdown table parser',
    'readme table to json',
  ],
  status: 'stable',
  isNew: true,
  complexity: 'simple',
  guide: {
    "steps": [
      {
        "name": "Paste a Markdown table",
        "text": "Paste a table with a header row and a separator row (such as | --- |) into the Markdown table box."
      },
      {
        "name": "Click Convert",
        "text": "Click Convert to produce the JSON. Load Sample Markdown Table fills in an example."
      },
      {
        "name": "Read the JSON",
        "text": "output.json holds one object per row, keyed by the header names."
      },
      {
        "name": "Use the result",
        "text": "Copy output.json into your app or test fixture."
      }
    ],
    "faqs": [
      {
        "question": "How are values typed?",
        "answer": "true and false (in any case) become booleans, null becomes null, and plain numbers such as 98.5 or -3 become numbers. Everything else stays a string."
      },
      {
        "question": "Do leading zeros survive?",
        "answer": "Yes. A value such as 0012 stays a string, so identifiers keep their zeros."
      },
      {
        "question": "How are escaped pipes handled?",
        "answer": "A backslash-escaped pipe (\\|) stays inside the cell as a literal |."
      },
      {
        "question": "What if no table is found?",
        "answer": "The tool reports that no valid Markdown table with a header and separator row was found."
      }
    ],
    "example": {
      "title": "Convert a table row with a boolean and a decimal.",
      "input": "| Name | Active | Score |\n| :--- | :---: | ---: |\n| Ada | true | 98.5 |",
      "output": "[\n  {\n    \"Name\": \"Ada\",\n    \"Active\": true,\n    \"Score\": 98.5\n  }\n]",
      "inputLabel": "Markdown table",
      "outputLabel": "output.json"
    }
  },
  addedAt: '2026-10-25',
  toolComponent: lazy(() => import('../../components/tools/text-tools/MarkdownTableToJson')),
  about: {
    summary: 'Turn Markdown tables from READMEs, documentation, or LLM outputs into JSON objects keyed by the table headers.',
    useCases: [
      'Converting GitHub README tables into structured JSON',
      'Reusing documentation tables as application data',
      'Parsing tabular examples from generated text',
    ],
    features: [
      'Parses GitHub-flavored header and separator rows',
      'Handles optional outer pipes, loose spacing, and escaped pipes',
      'Detects numbers, booleans, and null while preserving other values as strings',
    ],
    tip: 'Numeric-looking values with leading zeroes, such as 0012, remain strings to preserve identifiers.',
  },
  seo: {
    title: 'Markdown Table to JSON Converter — ToolBox4Devs',
    description: 'Convert Markdown tables from READMEs and documentation into JSON objects. Handles escaped pipes and detects numbers, booleans, and null values.',
  },
}