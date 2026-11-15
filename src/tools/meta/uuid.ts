import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const UUID_META: ToolMeta = {
    slug: 'uuid',
    name: 'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs one at a time or in bulk up to 100.',
    category: 'generate-tools',
    tag: 'generate',
    keywords: ['uuid', 'guid', 'unique', 'id', 'generate'],
    toolComponent: lazy(() => import('../../components/tools/generate-tools/UuidGenerator')),
    about: {
        summary:
            'UUID Generator creates version 4 UUIDs (Universally Unique Identifiers) using cryptographically secure random values. UUIDs are 128-bit identifiers used across databases, APIs, and distributed systems to uniquely identify records without a central coordination authority.',
        useCases: [
            'Generating primary keys for database records',
            'Creating unique identifiers for API resources or events',
            'Seeding test data with realistic-looking IDs',
            'Generating correlation IDs for distributed tracing',
            'Creating unique filenames, session tokens, or idempotency keys',
        ],
        features: [
            'Generates RFC 4122 compliant version 4 UUIDs',
            'Bulk generation — up to 100 UUIDs at once',
            'Uses crypto.getRandomValues for cryptographic randomness',
            'Copy individual UUIDs or the entire batch',
            'Uppercase and lowercase format options',
        ],
        tip: 'UUID v4 is randomly generated with no embedded timestamp or machine identity — making it safe to use in public-facing systems without leaking any server information.',
    },
    addedAt: '2026-03-14',
    complexity: 'simple',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'UUID Generator — Create RFC 4122 v4 UUIDs instantly',
        description: 'Generate RFC 4122 v4 UUIDs one at a time or in bulk up to 100. Free, runs entirely in your browser.',
        extraKeywords: [
            'uuid generator',
            'guid generator',
            'unique id generator',
            'generate uuid online',
            'bulk uuid generator',
            'random uuid generator',
            'crypto uuid generator',
            'uuid v4 generator',
            'uuid generator online',
            'uuid generator free',
            'uuid generator tool',
            'uuid generator browser',
            'uuid generator no backend',
            'uuid generator client-side',
            'uuid generator secure',
            'uuid generator random',
            'uuid generator bulk',
            'uuid generator uppercase',
            'uuid generator lowercase',
            'uuid generator copy',
            'uuid generator batch',
            'uuid generator version 4',
        ],
    },
    guide: {
        "steps": [
            {
                "name": "Generate a single UUID",
                "text": "Click Generate to create one random version 4 UUID."
            },
            {
                "name": "Or generate a batch",
                "text": "Enter a count of up to 100 in the batch generator to create many UUIDs at once."
            },
            {
                "name": "Copy what you need",
                "text": "Copy a single UUID or the whole batch to your clipboard."
            },
            {
                "name": "Use it in your code or database",
                "text": "Paste the IDs into seed data, fixtures, config files or a UUID column."
            }
        ],
        "faqs": [
            {
                "question": "What is a version 4 UUID?",
                "answer": "A 128-bit identifier in which 122 bits are random. It is written as 36 characters in the pattern 8-4-4-4-12, and the third group always starts with 4."
            },
            {
                "question": "Can two UUIDs ever be the same?",
                "answer": "In theory yes, in practice no. With 122 random bits you would need to generate billions of UUIDs per second for decades before a collision became likely."
            },
            {
                "question": "Are these UUIDs cryptographically random?",
                "answer": "Yes. They are generated from crypto.getRandomValues, the browser's secure random source, not Math.random."
            },
            {
                "question": "Should I use UUID v4 as a database primary key?",
                "answer": "It works well for uniqueness across services, but random values fragment B-tree indexes on large tables. If insert order matters, consider a time-ordered ID such as UUID v7 or ULID."
            }
        ],
        "example": {
            "title": "A version 4 UUID. Yours will differ, because every value is random.",
            "input": "Click Generate",
            "output": "3f2b8c1e-9d4a-4f6b-8a2e-5c7d9e1f0a3b",
            "inputLabel": "Action",
            "outputLabel": "Result"
        }
    },
}