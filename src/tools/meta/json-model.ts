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
    guide: {
      "steps": [
        {
          "name": "Name the model",
          "text": "Enter a Model / Struct Name. It is used as the root type name in every language."
        },
        {
          "name": "Paste JSON",
          "text": "Paste a JSON object into the input. If it is empty, the built-in sample is used."
        },
        {
          "name": "Generate",
          "text": "Click Generate All Models to build all five outputs."
        },
        {
          "name": "Copy a language",
          "text": "Copy the TypeScript interface, C# class, Python (Pydantic) model, Go struct or Rust (serde) struct you need."
        }
      ],
      "faqs": [
        {
          "question": "Which languages are generated?",
          "answer": "TypeScript interfaces, C# classes, Python Pydantic models, Go structs and Rust serde structs."
        },
        {
          "question": "How are nested objects named?",
          "answer": "Each nested object becomes its own type, named after its key with the first letter capitalized. So a profile key becomes a Profile type."
        },
        {
          "question": "How are array types chosen?",
          "answer": "The element type comes from the first item in the array. An empty array gets a generic type, such as unknown[] in TypeScript or List<object> in C#."
        },
        {
          "question": "Why do I get an error?",
          "answer": "The root value must be a JSON object. Arrays and plain values are rejected, and invalid JSON shows the parser's message."
        }
      ],
      "example": {
        "title": "Turn a small JSON object into a TypeScript interface.",
        "input": "{ \"id\": 1, \"name\": \"Ada\" }",
        "output": "interface User {\n  id: number;\n  name: string;\n}",
        "inputLabel": "JSON (Model / Struct Name: User)",
        "outputLabel": "TypeScript interface"
      }
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