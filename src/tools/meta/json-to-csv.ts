import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const JSON_TO_CSV_META: ToolMeta = {
  slug: 'json-to-csv',
  name: 'JSON to CSV & CSV to JSON Converter',
  category: 'data-tools',
  tag: 'DATA',
  description: 'Convert JSON arrays to CSV spreadsheets or CSV files to JSON with nested object flattening and live tabular preview.',
  keywords: ['json to csv', 'csv to json', 'json spreadsheet converter', 'flatten json to csv', 'csv parser online', 'json table export'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/JsonCsvConverter')),
  guide: {
    "steps": [
      {
        "name": "Choose a direction",
        "text": "Select JSON to CSV or CSV to JSON."
      },
      {
        "name": "Paste your data",
        "text": "Paste a JSON array or CSV text into the input box."
      },
      {
        "name": "Set the delimiter and options",
        "text": "Pick Comma (,), Semicolon (;), Tab (\\t) or Pipe (|). In CSV to JSON mode, Auto-Detect can pick the delimiter. Tick Include Header Row, Quote All Fields, Auto-Parse Numbers or Auto-Parse Booleans as needed."
      },
      {
        "name": "Check the preview and export",
        "text": "Use Table Preview to inspect the rows, then download the converted output."
      }
    ],
    "faqs": [
      {
        "question": "How are nested objects handled?",
        "answer": "With flattening on, nested keys are joined with dots, so address.city becomes a column. In CSV to JSON mode, dotted headers are rebuilt into nested objects."
      },
      {
        "question": "How are quotes escaped?",
        "answer": "Fields that contain the delimiter, a double quote or a line break are wrapped in double quotes, and any double quote inside is doubled."
      },
      {
        "question": "Are numbers and booleans kept?",
        "answer": "With Auto-Parse Numbers and Auto-Parse Booleans on, CSV values such as 34 or true become a number or boolean in the JSON."
      },
      {
        "question": "Is my data uploaded?",
        "answer": "No. The conversion runs in your browser."
      }
    ],
    "example": {
      "title": "Flatten a nested JSON object to CSV.",
      "input": "[{\"name\":\"Alice\",\"age\":34,\"address\":{\"city\":\"Paris\"}}]",
      "output": "name,age,address.city\nAlice,34,Paris",
      "inputLabel": "JSON array",
      "outputLabel": "CSV"
    }
  },
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
