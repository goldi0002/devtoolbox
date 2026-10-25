import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const PIPELINE_STUDIO_META: ToolMeta = {
    slug: 'pipeline-studio',
    name: 'DevFlow Pipeline Studio',
    description: 'Visual developer workflow pipeline to chain, format, decode, filter, and hash payloads in zero-latency browser memory.',
    category: 'analyze-tools',
    tag: 'Pipeline',
    toolComponent: lazy(() => import('../../components/tools/PipelineStudio')),
    keywords: [
        'developer pipeline',
        'pipeline studio',
        'chain dev tools',
        'multi step data transform',
        'cyberchef alternative',
        'decode and format json',
        'jwt to json pipeline',
        'base64 decode and beautify',
        'developer workflow recipes',
        'offline developer recipes',
        'devflow'
    ],
    about: {
        summary:
            'DevFlow Pipeline Studio connects multiple client-side developer transformations into a continuous, zero-latency visual execution chain. Decode Base64 strings, beautify JSON, extract nested keys, inspect JWT claims, run regex replacements, and generate SHA-256 hashes sequentially without switching tabs or copying across tools. 100% private in browser memory.',
        useCases: [
            'Chaining multi-step decoding: Base64 decode to formatted JSON to key extraction',
            'Unpacking nested webhook and API authentication tokens without leaving your browser',
            'Cleaning and deduplicating massive server logs with regex filters and sorting',
            'Converting API model properties from camelCase to SQL-compliant snake_case',
            'Sharing reproducible developer debugging pipelines with teammates via compressed URL hashes'
        ],
        features: [
            'Visual sequential step pipeline with real-time execution timing in milliseconds',
            'Reorder, enable, disable, and configure parameters on any transformation step',
            'Pre-built curated developer recipes for webhooks, auth tokens, logs, and database naming',
            'One-click URL hash sharing with zero server roundtrips using compressed state',
            'Intermediate step inspection and live final output diffing',
            '100% Client-Side execution — zero outbound network requests or server telemetry'
        ],
        tip: 'Need to share a complex transformation chain with a teammate? Click "Share Recipe" to generate a self-contained compressed URL that restores your exact input and steps.'
    },
    addedAt: '2026-10-25',
    complexity: 'advanced',
    featured: true,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'DevFlow Pipeline Studio — Chain Developer Tools in Browser Memory',
        description: 'Visual multi-tool developer pipeline workspace. Chain Base64 decoding, JSON formatting, JWT token inspection, regex filtering, and cryptographic hashing in browser memory.',
        extraKeywords: [
            'developer workflow pipeline',
            'cyberchef online modern alternative',
            'chain dev tools',
            'client side multi step transforms',
            'devflow studio'
        ]
    }
}
