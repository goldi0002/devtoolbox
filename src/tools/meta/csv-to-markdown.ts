import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const CSV_TO_MARKDOWN_META: ToolMeta = {
    slug: 'csv-to-markdown',
    name: 'CSV to Markdown',
    description: 'Convert CSV or TSV data into a well-formatted Markdown table instantly.',
    category: 'text-tools',
    tag: 'text',
    toolComponent: lazy(() => import('../../components/tools/text-tools/CsvToMarkdown')),
    keywords: [
        'csv to markdown',
        'tsv to markdown',
        'csv to md',
        'markdown table generator',
        'csv to table',
        'convert csv to markdown'
    ],
    about: {
        summary: 'Convert your comma-separated or tab-separated data into Markdown tables.',
        useCases: ['Creating tables for GitHub READMEs', 'Formatting data for Markdown documentation'],
        features: ['Support for headers', 'Handles CSV and TSV formats']
    },
    isNew: true,
    status: 'stable',
    guide: {
      "steps": [
        {
          "name": "Paste CSV or TSV",
          "text": "Paste comma- or tab-separated data into CSV / TSV Input."
        },
        {
          "name": "Set the header option",
          "text": "Leave First row is header ticked to use the first row as column names, or untick it to add an empty header row."
        },
        {
          "name": "Click Convert",
          "text": "Click Convert to build the table. The result appears in output.md."
        },
        {
          "name": "Use the Markdown",
          "text": "Copy the table into a README, issue or document."
        }
      ],
      "faqs": [
        {
          "question": "Are quoted fields supported?",
          "answer": "Yes. Fields are parsed with PapaParse, so a comma inside quotes stays in the same cell."
        },
        {
          "question": "Are pipe characters escaped?",
          "answer": "No. A | inside a cell is written as-is, which can break the Markdown table."
        },
        {
          "question": "What happens with rows of different lengths?",
          "answer": "The number of columns comes from the first row. Other rows are written as they are, so a row with a different number of cells can misalign the table."
        },
        {
          "question": "Is my data uploaded?",
          "answer": "No. The conversion runs in your browser."
        }
      ],
      "example": {
        "title": "Turn a three-column CSV into a Markdown table.",
        "input": "name,age,city\nAlice,28,New York",
        "output": "| name | age | city |\n| --- | --- | --- |\n| Alice | 28 | New York |",
        "inputLabel": "CSV / TSV Input",
        "outputLabel": "output.md"
      }
    },
    seo: {
        title: 'CSV to Markdown Table Converter — Online & Free',
        description: 'Convert CSV or TSV data into a clean, aligned Markdown table for READMEs, GitHub issues and docs. Runs entirely in your browser.',
    },
}
