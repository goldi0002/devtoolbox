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
  guide: {
    "steps": [
      {
        "name": "Load your data",
        "text": "Upload a CSV, TSV or TXT file, or paste delimited text. Choose the separator with CSV Delimiter if detection is not right."
      },
      {
        "name": "Infer the rules",
        "text": "Click Auto-Infer Rules to create a starting rule for each column from your data."
      },
      {
        "name": "Adjust the rules",
        "text": "Set required, unique, data type and regex constraints for each column that matters to your schema."
      },
      {
        "name": "Review the errors",
        "text": "Check the Total Rows, Valid Rows, Invalid Rows and Total Violations cards, then read the row-level errors. You can export the error report."
      }
    ],
    "faqs": [
      {
        "question": "Does an empty cell always fail?",
        "answer": "No. An empty cell only fails when its column is marked required, and then it is reported as a required error."
      },
      {
        "question": "How are duplicate values reported?",
        "answer": "Each repeated value in a unique column is reported, for example Duplicate value \"1\" found in unique column 'id'."
      },
      {
        "question": "Which data types can a column use?",
        "answer": "Columns can be typed as any, string, number, integer, boolean, date, email, uuid, url, ipv4, ipv6, phone, alphanumeric, alphabetical, json, hex color, semver, credit card, MAC address, base64 or slug."
      },
      {
        "question": "Is my file uploaded?",
        "answer": "No. Files are read and validated in your browser."
      }
    ],
    "example": {
      "title": "Catch a repeated ID in a unique column.",
      "input": "id,name\n1,Ada\n1,Lin",
      "output": "Duplicate value \"1\" found in unique column 'id'.\nDuplicate value \"1\" found in unique column 'id'.",
      "inputLabel": "CSV data",
      "outputLabel": "Validation errors"
    }
  },
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
