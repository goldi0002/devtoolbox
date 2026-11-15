import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const JSON_FORMATTER_META: ToolMeta = {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate, query, filter, repair, and inspect JSON in real time with non-blocking Web Worker performance. 100% client-side.',
    category: 'json-tools',
    tag: 'JSON',
    toolComponent: lazy(() => import('../../components/tools/json-tools/JsonFormatter')),
    keywords: [
        'json formatter',
        'json validator',
        'json beautifier',
        'format json online',
        'json pretty print',
        'minify json',
        'json syntax checker',
        'json viewer',
        'json lint',
        'beautify json',
        'json filter',
        'jsonpath query',
        'json tree viewer',
        'json auto repair',
        'large json formatter',
    ],
    about: {
        summary:
            'JSON Formatter & Validator instantly formats raw or minified JSON into clean, readable output with proper indentation. Powered by an asynchronous non-blocking engine, it supports massive JSON payloads, JSONPath & JS expression filtering, interactive collapsible Tree & Table visualizers, 1-click Auto-Repair for broken JSON, key case conversions, and TypeScript interface exports. Everything runs in your browser, no data is sent anywhere.',
        useCases: [
            'Formatting minified API responses into readable, indented JSON',
            'Filtering large JSON responses with JSONPath, dot notation, or JS expressions',
            'Fixing relaxed or broken JSON (unquoted keys, single quotes, trailing commas, Python literals)',
            'Inspecting deep JSON hierarchies with an interactive Tree Explorer and Table Grid',
            'Validating JSON payloads with pinpoint line & column syntax error diagnostics',
            'Generating TypeScript interfaces and type definitions directly from JSON',
            'Minifying JSON payloads to reduce bandwidth and payload size for production',
        ],
        features: [
            'Non-blocking background processing supporting large multi-megabyte JSON files',
            'Format with 2 spaces, 4 spaces, 3 spaces, or Tab indentation, plus minification',
            'Pinpoint syntax error locator with visual indicator and 1-click Auto-Repair',
            'JSONPath, dot notation, and JavaScript expression query filter engine',
            'Interactive Collapsible Tree Explorer with type highlighting and quick JSONPath copy',
            'Searchable and sortable Table Grid view for JSON arrays with instant CSV export',
            'Deep structural metrics: key counts, nesting depth, type breakdown, and compression analysis',
            'Key sorting (A-Z, Z-A, Natural, Length) and recursive key case conversions',
            'Export to TypeScript interfaces, YAML, or downloadable JSON file',
            '100% Client-Side execution — zero data sent to external servers',
        ],
        tip: 'Need to extract specific data from a nested API response? Use the Query bar with dot notation like "data.products[*].name" or a JavaScript expression like "x => x.price > 100" to filter instantly.',
    },
    addedAt: '2026-03-10',
    complexity: 'moderate',
    featured: true,
    isNew: true,
    status: 'beta',
    seo: {
        description: 'Instantly format, validate, filter, repair, and minify JSON in your browser with non-blocking Web Worker performance. Features interactive Tree & Table views, JSONPath queries, and TypeScript export.',
        extraKeywords: [
            'json formatter online',
            'json validator online',
            'json beautifier online',
            'format json free',
            'json pretty print online',
            'minify json online',
            'json syntax checker online',
            'json viewer online',
            'json lint online',
            'jsonpath filter online',
            'large json formatter',
        ],
        title: 'JSON Formatter & Validator — ToolBox4Devs',
    },
    guide: {
        "steps": [
            {
                "name": "Paste or load your JSON",
                "text": "Paste raw, minified or broken JSON into the editor. Large payloads are parsed in a background worker, so the page stays responsive."
            },
            {
                "name": "Fix any syntax errors",
                "text": "If the JSON is invalid, the error is pinned to its line and column. Use Auto-Repair to fix single quotes, unquoted keys and trailing commas."
            },
            {
                "name": "Choose indentation or minify",
                "text": "Pick 2, 3 or 4 spaces or tabs to beautify, or minify to a single line. Optionally sort keys or change their case."
            },
            {
                "name": "Explore, query and export",
                "text": "Switch to the Tree or Table view, filter with JSONPath or dot notation, then copy the result or export it as TypeScript, YAML or a file."
            }
        ],
        "faqs": [
            {
                "question": "How do I fix \"Unexpected token\" errors in JSON?",
                "answer": "The formatter shows the exact line and column where parsing failed. The most common causes are trailing commas, single quotes instead of double quotes, unquoted keys and comments. Auto-Repair corrects these in one click."
            },
            {
                "question": "What is the difference between formatting and minifying JSON?",
                "answer": "Formatting adds line breaks and indentation so people can read the structure. Minifying removes all optional whitespace to make the payload as small as possible. The data is identical in both cases."
            },
            {
                "question": "Can it handle large JSON files?",
                "answer": "Yes. Parsing and formatting run in a Web Worker, so multi-megabyte files do not freeze the page. The practical limit is the memory available to your browser tab."
            },
            {
                "question": "How do I pull one field out of a nested JSON response?",
                "answer": "Type a path such as data.products[*].name in the query bar. JSONPath, dot notation and JavaScript expressions like x => x.price > 100 are all supported."
            }
        ],
        "example": {
            "title": "Beautify a minified API response with 2-space indentation.",
            "input": "{\"id\":1,\"name\":\"Ada\",\"roles\":[\"admin\",\"dev\"],\"active\":true}",
            "output": "{\n  \"id\": 1,\n  \"name\": \"Ada\",\n  \"roles\": [\n    \"admin\",\n    \"dev\"\n  ],\n  \"active\": true\n}",
            "inputLabel": "Minified JSON",
            "outputLabel": "Formatted JSON"
        }
    },
}
