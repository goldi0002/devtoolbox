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
    },
    guide: {
        "steps": [
            {
                "name": "Choose encode or decode",
                "text": "Pick whether you are percent-encoding text or turning an encoded string back into readable text."
            },
            {
                "name": "Pick the encoding mode",
                "text": "Use encodeURIComponent for a single query value, or encodeURI for a complete URL whose structure should be kept."
            },
            {
                "name": "Paste your input",
                "text": "Type or paste the URL or value. The result updates as you type."
            },
            {
                "name": "Copy or swap",
                "text": "Copy the output, or swap it into the input to convert it back."
            }
        ],
        "faqs": [
            {
                "question": "What is the difference between encodeURI and encodeURIComponent?",
                "answer": "encodeURI leaves characters that structure a URL, such as : / ? & and =, untouched. encodeURIComponent encodes those too, which makes it the right choice for a single query parameter value."
            },
            {
                "question": "Why is a space sometimes %20 and sometimes +?",
                "answer": "%20 is the standard percent-encoding for a space. The + form comes from HTML form encoding (application/x-www-form-urlencoded) and is only valid in query strings."
            },
            {
                "question": "Which characters need to be URL-encoded?",
                "answer": "Anything outside letters, digits and - _ . ~ should be encoded when it appears inside a value. That includes spaces, &, =, ?, #, / and all non-ASCII characters."
            },
            {
                "question": "What is double encoding?",
                "answer": "Encoding a string that is already encoded, which turns %20 into %2520. If a decoded URL still contains percent sequences, it was probably encoded twice; decode it again."
            }
        ],
        "example": {
            "title": "Encode a query string value with encodeURIComponent.",
            "input": "name=John Doe&city=São Paulo",
            "output": "name%3DJohn%20Doe%26city%3DS%C3%A3o%20Paulo",
            "inputLabel": "Plain text",
            "outputLabel": "Percent-encoded"
        }
    },
}