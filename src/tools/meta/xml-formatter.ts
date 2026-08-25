import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const XML_FORMATTER_META: ToolMeta = {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format, beautify or minify XML strings natively in your browser.',
    category: 'web-tools',
    tag: 'web',
    toolComponent: lazy(() => import('../../components/tools/web-tools/XmlFormatter')),
    keywords: [
        'xml formatter',
        'beautify xml',
        'minify xml',
        'xml pretty print',
        'format xml online'
    ],
    about: {
        summary: 'Format your messy XML files into highly readable, indented structures or minify them into a single line.',
        useCases: ['Formatting API responses', 'Cleaning up SOAP envelopes', 'Minifying XML before transmission'],
        features: ['Adjustable indentation sizes', 'Minification mode', 'Syntax error catching']
    },
    isNew: true,
    status: 'stable',
}
