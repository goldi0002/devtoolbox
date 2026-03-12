import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const JSON_FORMATTER_META: ToolMeta = {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate and minify JSON instantly — paste your JSON to beautify it, spot syntax errors, or compress it. Free, runs entirely in your browser.',
    category: 'json-tools',
    tag: 'json',
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
    ],
    about: {
        summary:
            'JSON Formatter & Validator instantly formats raw or minified JSON into clean, readable output with proper indentation. It validates your JSON in real time and pinpoints syntax errors — missing commas, unclosed brackets, incorrect quotes — so you can fix them fast. Everything runs in your browser, no data is sent anywhere.',
        useCases: [
            'Formatting minified API responses into readable, indented JSON',
            'Validating JSON payloads before sending them to a server or saving to a file',
            'Minifying JSON to reduce payload size for production use',
            'Finding syntax errors like missing commas, extra brackets, or unquoted keys',
            'Cleaning up JSON copied from logs, terminal output, or debugging tools',
            'Quickly inspecting the structure of an unfamiliar JSON response',
        ],
        features: [
            'Format with 2 or 4 space indentation — your choice',
            'Minify to a single compact line with no whitespace',
            'Real-time syntax validation with clear, precise error messages',
            'Works with deeply nested objects and large JSON files',
            'Copy formatted or minified output with one click',
            'No data leaves your browser — 100% client-side',
        ],
        tip: 'If you\'re comparing two JSON responses, format both here first then paste them into the Text Diff tool — whitespace differences won\'t pollute your diff results.',
    },
    addedAt: '2026-03-10',
    complexity: 'moderate',
    featured: true,
    isNew: true,
    status: 'beta',
    seo: {
        description: 'Instantly format, validate and minify JSON in your browser. Paste raw or minified JSON to beautify it with proper indentation, spot syntax errors, or compress it for production use. Free, no backend.',
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
        ],
        title: 'JSON Formatter & Validator — ToolBox4Devs',
    }
}