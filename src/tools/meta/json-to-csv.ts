import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const JSON_TO_CSV_META: ToolMeta = {
  slug: 'json-to-csv',
  name: 'JSON to CSV & CSV to JSON Converter',
  category: 'data-tools',
  tag: 'DATA',
  description: 'Convert JSON arrays to CSV spreadsheets or CSV files to JSON with nested object flattening and live tabular preview.',
  keywords: ['json to csv', 'csv to json', 'json spreadsheet converter', 'flatten json to csv', 'csv parser online', 'json table export'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/JsonCsvConverter')),
  seo: {
    title: 'JSON to CSV & CSV to JSON Converter — Table & Spreadsheet Tool',
    description: 'Convert JSON objects and arrays into CSV or transform CSV spreadsheets into clean JSON with delimiter selection and dot-notation flattening in your browser.',
    extraKeywords: ['convert json to csv online', 'csv to json generator', 'flatten nested json csv', 'delimiter comma semicolon tab', 'export csv from json'],
  },
  about: {
    summary: 'The JSON to CSV & CSV to JSON Converter performs instant bidirectional conversion between JSON data structures and delimiter-separated values (CSV, TSV, DSV) with tabular previews and flattening of nested objects.',
    useCases: [
      'Exporting API JSON responses into CSV files for Excel or Google Sheets',
      'Importing spreadsheet rows and database exports into JSON payloads for APIs',
      'Flattening complex nested JSON objects using dot notation (user.profile.email)',
      'Inspecting tabular dataset previews without leaving the browser'
    ],
    features: [
      'Bidirectional JSON <-> CSV transformation',
      'Configurable delimiters (comma, semicolon, tab, pipe) with auto-detection',
      'Nested object flattening and dot-notation unflattening',
      'Live interactive tabular data grid preview and one-click file export'
    ],
    notes: [
      'Handles double quote escaping per RFC 4180 specifications',
      'Preserves numbers, booleans, and null values during conversion'
    ],
    tip: 'Click "Table Preview" to inspect the structured columns and rows before downloading your CSV.'
  }
}
