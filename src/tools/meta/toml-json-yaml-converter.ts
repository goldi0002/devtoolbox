import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const TOML_JSON_YAML_CONVERTER_META: ToolMeta = {
  slug: 'toml-json-yaml-converter',
  name: 'TOML / JSON / YAML Converter',
  description: 'Convert between TOML, JSON and YAML in any direction. Parse errors show the line and column, and the result downloads with the right file extension. Runs in your browser.',
  category: 'data-tools',
  tag: 'TOML',
  icon: 'FileCode',
  keywords: [
    'toml to json',
    'json to toml',
    'toml to yaml',
    'yaml to toml',
    'toml converter',
    'convert toml online',
    'toml json yaml converter',
    'cargo toml to json',
    'pyproject toml to json',
  ],
  toolComponent: lazy(() => import('../../components/tools/data-tools/TomlJsonYamlConverter')),
  about: {
    summary:
      'TOML / JSON / YAML Converter reads a document in one of the three formats and writes it in another. It handles nested tables, arrays of tables, dates and mixed values, and it reports a syntax error with its line and column. TOML cannot hold a null or a top-level array, so those are reported with the key that caused the problem instead of producing a broken file.',
    useCases: [
      'Reading a Cargo.toml or pyproject.toml as JSON to feed into a script',
      'Turning a Kubernetes or Docker Compose YAML file into TOML for a tool that expects it',
      'Converting a JSON config into TOML for a Rust, Python or Hugo project',
      'Checking that a TOML file parses before committing it',
    ],
    features: [
      'Any direction between TOML, JSON and YAML',
      'Syntax errors with line and column numbers',
      'Clear messages for values TOML cannot represent, such as null and top-level arrays',
      'Copy the result or download it as .toml, .json or .yaml',
      '100% in-browser processing — the TOML parser loads on first use and no document leaves your device',
    ],
    tip: 'Dates in TOML become ISO 8601 strings in JSON and YAML. Converting back makes them quoted strings, so re-check any date fields after a round trip.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    description: 'Convert TOML to JSON, JSON to TOML, YAML to TOML and back. Line-numbered errors, copy and download. Free, private, 100% browser-based.',
    extraKeywords: [
      'toml to json converter free',
      'json to toml converter',
      'toml validator online',
      'convert toml to yaml',
    ],
    title: 'TOML / JSON / YAML Converter — ToolBox4Devs',
  },
  guide: {
    steps: [
      {
        name: 'Choose the input format',
        text: 'Pick TOML, JSON or YAML under From. A sample document loads so you can see the layout.',
      },
      {
        name: 'Choose the output format',
        text: 'Pick the format to convert to under To. The output updates as you type.',
      },
      {
        name: 'Paste your document',
        text: 'Replace the sample with your own file. A syntax error shows its line and column, and TOML errors name the key when a value cannot be written.',
      },
      {
        name: 'Copy or download the result',
        text: 'Copy the converted text, or download it. The file gets the extension of the output format: .toml, .json or .yaml.',
      },
    ],
    faqs: [
      {
        question: 'Why does converting to TOML fail with a null value?',
        answer: 'TOML has no null value. Replace each null with a value or remove the key. The error names the path to the key that caused it.',
      },
      {
        question: 'Why can a JSON array not become TOML?',
        answer: 'A TOML document must be a table at the top level. Put the array under a key, such as items = [...], and convert again.',
      },
      {
        question: 'What happens to dates and times?',
        answer: 'JSON and YAML have no date type here, so TOML dates are written as ISO 8601 strings. Converting those strings back to TOML keeps them as quoted strings, not dates.',
      },
      {
        question: 'Are comments kept?',
        answer: 'No. Comments in TOML and YAML are dropped, because JSON has no comment syntax and the converter works on the data.',
      },
      {
        question: 'Is my document uploaded anywhere?',
        answer: 'No. The conversion runs in your browser. The TOML parser is downloaded on first use, and your text is never sent to a server.',
      },
    ],
    example: {
      title: 'Convert a small TOML table to JSON.',
      input: '[server]\nhost = "localhost"\nport = 8080',
      output: '{\n  "server": {\n    "host": "localhost",\n    "port": 8080\n  }\n}',
      inputLabel: 'TOML',
      outputLabel: 'JSON',
    },
  },
}
