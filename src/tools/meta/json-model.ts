import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const JSON_MODEL_META: ToolMeta = {
    slug: 'json-model',
    name: 'JSON → Model',
    description: 'Convert JSON to C# classes or TypeScript interfaces with proper types.',
    category: 'json-tools',
    tag: 'codegen',
    keywords: ['json', 'model', 'csharp', 'typescript', 'interface', 'class'],
    toolComponent: lazy(() => import('../../components/tools/json-tools/JsonModelGenerator')),
    about: {
        summary:
            'JSON Model Generator converts any JSON object into strongly-typed code — TypeScript interfaces or C# classes — in one click. Instead of manually writing types from an API response, paste the JSON and get production-ready type definitions instantly.',
        useCases: [
            'Generating TypeScript interfaces from a REST API response',
            'Creating C# model classes from a JSON payload or config file',
            'Bootstrapping types when integrating a new third-party API',
            'Keeping your types in sync with the actual shape of your data',
            'Speeding up backend and frontend development setup',
        ],
        features: [
            'Generates TypeScript interfaces with correct primitive types',
            'Generates C# classes with proper type annotations',
            'Handles nested objects and arrays automatically',
            'Infers types from values — string, number, boolean, null',
            'Copy generated code with one click',
        ],
        tip: 'Paste a real API response rather than a hand-crafted example — the generator picks up optional fields and mixed types more accurately from real data.',
    },
    addedAt: '2026-03-11',
    complexity: 'moderate',
    featured: true,
    isNew: true,
    status: "beta",
    seo: {
        extraKeywords: [
            'json to typescript',
            'json to csharp',
            'json to interface',
            'json to class',
            'json code generator',
            'json type generator',
            'json to model',
            'json type inference',
            'json to typescript interface',
            'json to csharp class',
            'json to code',
            'json type definitions',
        ],
        title: 'JSON Model Generator — Convert JSON to TypeScript interfaces or C# classes with proper types',
        description: 'Convert JSON to strongly-typed code with JSON Model Generator. Paste any JSON object and instantly get accurate TypeScript interfaces or C# classes with correct type annotations. Free, runs entirely in your browser.',
    }
}