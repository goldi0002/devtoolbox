import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const URL_PARSER_META: ToolMeta = {
    slug: 'url-parser',
    name: 'URL Parser',
    description: 'Parse URLs into their component parts (protocol, host, path, parameters).',
    category: 'web-tools',
    tag: 'web',
    toolComponent: lazy(() => import('../../components/tools/web-tools/UrlParser')),
    keywords: [
        'url parser',
        'parse url',
        'url component extractor',
        'query string parser',
        'uri parser'
    ],
    about: {
        summary: 'Break down any URL into its constituent components for easy inspection.',
        useCases: ['Debugging complex URLs', 'Extracting query parameters', 'Validating URL structure'],
        features: ['Extracts protocol, host, port, path', 'Parses query parameters into a table', 'Handles complex fragments and origins']
    },
    isNew: true,
    status: 'stable',
}
