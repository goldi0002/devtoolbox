import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CSV_VALIDATOR_META: ToolMeta = {
  slug: 'csv-validator',
  name: 'Delimited File Data Validator (CSV / TSV / TXT)',
  description: 'Validate CSV, TSV, and delimited TXT files against custom column schema rules, required fields, data types, regex, and unique checks with row-level error reporting.',
  category: 'data-tools',
  tag: 'DATA',
  keywords: [
    'csv validator',
    'file validator',
    'csv data verification',
    'tsv validator',
    'txt file validator',
    'validate csv online',
    'csv schema validator',
    'csv column check',
    'csv required field checker',
    'client side csv validator'
  ],
  status: 'stable',
  featured: true,
  isNew: true,
  complexity: 'moderate',
  addedAt: '2026-10-25',
  toolComponent: lazy(() => import('../../components/tools/data-tools/CsvValidator')),
  seo: {
    title: 'Delimited File Data Validator (CSV / TSV / TXT) — 100% Client-Side',
    description: 'Verify CSV, TSV, and delimited TXT files against custom schema rules, required constraints, data types, and unique keys directly in your browser.',
    extraKeywords: [
      'tabular data validator',
      'pipe delimited file verification',
      'csv regex validator',
      'csv data quality checker',
      'export invalid rows csv',
      'data verification tool'
    ]
  },
  about: {
    summary:
      'The Delimited File Data Validator enables developers and data engineers to verify structured CSV, TSV, and text files against customizable column rules (data types, required values, numeric/date ranges, regex patterns, enum lists, and uniqueness) completely in-browser without uploading data to external servers.',
    useCases: [
      'Verifying bulk ETL files and database import dumps before ingestion',
      'Checking user registration CSV exports for missing required values or malformed emails',
      'Auditing pipe-separated or comma-separated supplier data feeds for allowed status codes',
      'Isolating and exporting invalid rows for remediation workflows'
    ],
    features: [
      'Support for CSV, TSV, pipe-delimited (|), and semicolon-delimited text files',
      'Interactive visual rule builder with auto-inference from sample records',
      'Rule checks: Required (not empty), Types (String, Integer, Number, Boolean, Email, UUID, Date), Min/Max, Regex, Enum, and Uniqueness',
      'Row-level error explorer with category filters, live search, and full record inspection modal',
      'Export options: Error Audit CSV, Invalid Rows Only CSV, and Valid Clean Rows CSV',
      'Export and import column validation rules as standard JSON schemas',
      '100% private in-browser memory execution with zero telemetry or network calls'
    ],
    tip: 'Click "Auto-Infer Rules" after loading your data to automatically generate base rules, then fine-tune required and regex constraints.'
  }
}
