import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const URL_ENCODER_META: ToolMeta = {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URLs and query string parameters instantly in your browser.',
    category: 'encode-tools',
    tag: 'encode',
    keywords: ['url', 'encode', 'decode', 'uri', 'query', 'percent encoding'],
    toolComponent: lazy(() => import('../../components/tools/encode-tools/UrlEncoderDecoder')),
    about: {
        summary:
            'URL Encoder converts special characters in a URL into percent-encoded format so they can be safely transmitted over the web. URL Decoder reverses this — turning encoded strings like %20 back into readable text. Essential for working with query parameters, API endpoints, and web forms.',
        useCases: [
            'Encoding query string values that contain spaces or special characters',
            'Decoding percent-encoded URLs from logs or browser address bars',
            'Building API requests with special characters in parameters',
            'Debugging URL routing issues in web applications',
            'Encoding form data before submitting via GET requests',
        ],
        features: [
            'Two modes — encodeURIComponent for query values, encodeURI for full URLs',
            'Decode percent-encoded strings back to plain text',
            'Live conversion as you type',
            'Swap button — flip encoded output back to input instantly',
            'Common encoding reference table for quick lookup',
        ],
        tip: 'Use encodeURIComponent for individual query values (it encodes & = ? too). Use encodeURI only for full URLs where you want to preserve the URL structure characters.',
    },
    addedAt: '2026-03-13',
    complexity: 'simple',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'URL Encoder & Decoder — Percent-encode URLs and query parameters',
        description: 'Encode or decode URLs and query string parameters instantly in your browser. Free, runs entirely in your browser.',
        extraKeywords: [
            'url encoder',
            'url decoder',
            'uri encoder',
            'uri decoder',
            'percent encoding tool',
            'url encoding tool',
            'url decoding tool',
            'encode url online',
            'decode url online',
        ],
    }
}