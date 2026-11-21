import { lazy } from 'react'
import { ToolMeta } from '../tool-meta'

export const CSV_TXT_VIEWER_META: ToolMeta = {
  slug: 'csv-txt-viewer',
  name: 'Large CSV & TXT Table Viewer (Up to 1GB)',
  category: 'data-tools',
  tag: 'DATA',
  description: 'View, parse, and analyze massive pipe-separated or delimited CSV and TXT files up to 1GB in a fast paginated table directly in your browser with zero memory freeze.',
  keywords: ['csv viewer', 'txt viewer', 'pipe delimited viewer', 'large csv viewer', 'tsv viewer', 'csv table view', 'split txt to table', '1gb csv viewer', 'large file viewer'],
  status: 'stable',
  complexity: 'advanced',
  isNew: true,
  addedAt: '2026-08-23',
  toolComponent: lazy(() => import('../../components/tools/data-tools/CsvTxtViewer')),
  seo: {
    title: 'Large CSV & TXT Table Viewer (Up to 1GB) — 100% Client-Side',
    description: 'Fast, secure in-browser viewer for massive CSV and text files up to 1GB. Supports pipe |, comma, tab, and semicolon delimiter splitting with paginated table view.',
    extraKeywords: ['large text file reader', 'split txt to columns', 'pipe separated values viewer', 'psv viewer', 'big data csv table', 'client side csv parser', '1gb csv reader']
  },
  about: {
    summary: 'The Large CSV & TXT Table Viewer streams and parses heavy delimited text files (up to 1GB+) entirely in browser memory without crashing or uploading data to external servers.',
    useCases: [
      'Inspecting database export dumps, log files, and data tables separated by pipes (|), commas, or tabs',
      'Viewing and paginating through huge CSV / TXT files up to 1GB without installing desktop software',
      'Verifying data columns, headers, and row counts on massive data pipelines'
    ],
    features: [
      'Chunked streaming parser capable of handling 1GB+ files smoothly',
      'Configurable delimiter support: Auto-detect, Pipe (|), Comma (,), Tab (\\t), and Semicolon (;)',
      'Fast paginated table navigation with real-time row and column stats',
      'Export the current page as CSV or JSON, or copy or download it as a Markdown or HTML table (visible columns, filtered and sorted rows)',
      '100% client-side execution in local browser memory with zero server uploads'
    ],
    notes: [
      'Parses files in small memory chunks using streaming byte slices to prevent browser tab crashes on massive files.',
      'Renders pages in customizable row chunks (25–500 rows) for smooth 60fps scrolling and fast interaction.'
    ],
    tip: 'If your file uses pipes or unusual delimiters, select the delimiter from the dropdown before or after loading.'
  },
  guide: {
    "steps": [
      {
        "name": "Load a file",
        "text": "Drop a CSV or TXT file onto the file area, or choose one. The file is read and parsed in your browser."
      },
      {
        "name": "Choose the delimiter",
        "text": "Pick Auto-Detect Delimiter, Comma, Tab, Pipe or Semicolon. The delimiter in use is shown with the table."
      },
      {
        "name": "Set the header row",
        "text": "Turn on First row contains column headers if the first line holds column names."
      },
      {
        "name": "Page and export",
        "text": "Change the rows per page and move between pages. Export the current page as CSV or JSON, or copy or download it as a Markdown or HTML table with the visible columns and the rows after filtering and sorting."
      }
    ],
    "faqs": [
      {
        "question": "Which delimiters are supported?",
        "answer": "Auto-detect, comma, tab, pipe and semicolon. Pick a delimiter yourself when auto-detection picks the wrong one."
      },
      {
        "question": "Does it upload my file?",
        "answer": "No. The file is parsed in your browser and nothing is sent to a server."
      },
      {
        "question": "What does the export include?",
        "answer": "The CSV and JSON exports cover the current page only. The Markdown and HTML tables use the visible columns and the rows after filtering and sorting."
      },
      {
        "question": "Can I try it without a file?",
        "answer": "Yes. The built-in samples generate example data, such as a 500-row e-commerce CSV and a 600-row pipe-delimited database dump."
      }
    ],
    "example": {
      "title": "Read a pipe-delimited file with the Pipe (|) delimiter and export it as a Markdown table.",
      "input": "id|name\n1|Ada\n2|Lin",
      "output": "| id | name |\n| --- | --- |\n| 1 | Ada |\n| 2 | Lin |",
      "inputLabel": "Pipe-delimited file",
      "outputLabel": "Markdown table"
    }
  },
}
