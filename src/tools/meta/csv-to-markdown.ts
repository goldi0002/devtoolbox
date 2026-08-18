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
}
