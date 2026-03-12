import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const HTML_FORMATTER_META: ToolMeta = {
    slug: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format and minify HTML code for better readability or compactness.',
    category: 'web-tools',
    tag: 'web',
    keywords: ['html', 'format', 'minify', 'pretty', 'beautify'],
    toolComponent: lazy(() => import('../../components/tools/web-tools/HtmlFormatter')),
    about: {
        summary:
            'HTML Formatter uses Prettier under the hood to format messy or minified HTML into clean, properly indented markup. It also minifies HTML by stripping whitespace and comments — useful for optimizing templates before deploying to production.',
        useCases: [
            'Beautifying minified HTML from a CMS or build tool output',
            'Formatting HTML email templates for easier editing',
            'Cleaning up hand-written HTML with inconsistent indentation',
            'Minifying HTML templates to reduce page size',
            'Preparing HTML snippets for documentation or code reviews',
        ],
        features: [
            'Powered by Prettier — the industry standard code formatter',
            'Minify HTML by collapsing whitespace and removing comments',
            'Choose 2 or 4 space indentation',
            'Handles inline elements, void elements, and deep nesting correctly',
            'Formats embedded <style> and <script> blocks too',
            'Copy formatted output with one click',
        ],
        tip: 'Prettier also formats embedded CSS inside <style> tags and JavaScript inside <script> tags — so the entire HTML file gets cleaned up in one pass.',
    },
    addedAt: '2026-03-13',
    complexity: 'moderate',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'HTML Formatter & Minifier — Format and minify HTML code online',
        description: 'Format and minify HTML code for better readability or compactness. Free, runs entirely in your browser.',
        extraKeywords: [
            'html formatter online',
            'html minifier online',
            'format html code',
            'minify html code',
            'html pretty print',
            'html beautifier online',
            'online html formatter and minifier',
        ],
    },
}