import { lazy } from "react"
import type { ToolMeta } from "../tool-meta"

export const YAML_JSON_CONVERTER_META: ToolMeta = {
  slug: 'yaml-json-converter',
  name: 'YAML <-> JSON Converter',
  description: 'Convert bidirectionally between YAML and JSON with real-time validation, key sorting, and custom indentation options.',
  category: 'data-tools',
  tag: 'YAML',
  toolComponent: lazy(() => import('../../components/tools/data-tools/YamlJsonConverter')),
  keywords: [
    'yaml to json',
    'json to yaml',
    'yaml converter',
    'convert yaml to json online',
    'convert json to yaml online',
    'kubernetes yaml to json',
    'docker compose yaml to json',
    'openapi yaml converter',
  ],
  about: {
    summary:
      'YAML <-> JSON Converter enables bidirectional translation between YAML and JSON documents. It automatically parses nested structures, handles arrays and objects, formats with configurable space indents, and offers optional alphabetical key sorting.',
    useCases: [
      'Converting Kubernetes manifests and Docker Compose files into JSON for inspection or scripting',
      'Converting OpenAPI/Swagger JSON specifications into clean human-readable YAML',
      'Validating YAML indentation syntax before committing to CI/CD pipelines',
      'Normalizing configuration files across dev, staging, and production environments',
    ],
    features: [
      'Bidirectional YAML ➔ JSON and JSON ➔ YAML conversions',
      'Alphabetical key sorting option for consistent diffing',
      'Custom indentation configuration (2 or 4 spaces)',
      'Real-time syntax error validation with helpful error location reporting',
      '100% in-browser processing — sensitive keys and configs stay completely private',
    ],
    tip: 'Toggle "Alphabetize Keys" to make git diffs clean when comparing configuration versions!',
  },
  addedAt: '2026-07-26',
  complexity: 'moderate',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Convert YAML to JSON and JSON to YAML online. Real-time validation, custom indentation, and key sorting. Free, private, 100% browser-based.',
    extraKeywords: [
      'yaml to json converter free',
      'json to yaml converter free',
      'yaml validator online',
      'convert yaml online',
    ],
    title: 'YAML <-> JSON Converter — ToolBox4Devs',
  }
}
