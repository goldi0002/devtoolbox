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
      '100% client-side execution in local browser memory with zero server uploads'
    ],
    notes: [
      'Parses files in small memory chunks using streaming byte slices to prevent browser tab crashes on massive files.',
      'Renders pages in customizable row chunks (25–500 rows) for smooth 60fps scrolling and fast interaction.'
    ],
    tip: 'If your file uses pipes or unusual delimiters, select the delimiter from the dropdown before or after loading.'
  }
}
