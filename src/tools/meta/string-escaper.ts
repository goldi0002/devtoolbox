import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const STRING_ESCAPER_META: ToolMeta = {
  slug: 'string-escaper',
  name: 'String Escape & Unescape',
  category: 'encode-tools',
  tag: 'ESCAPE',
  description: 'Escape and unescape strings for JSON, JavaScript, Python, Java, C#, SQL, CSV, HTML, and Shell.',
  keywords: ['string escaper', 'unescape string', 'escape json string', 'escape sql quotes', 'escape html', 'slash escape'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/StringEscaper')),
  seo: {
    title: 'String Escape & Unescape Tool — Multi-Language String Cleaner',
    description: 'Escape and unescape strings across JSON, JavaScript, Python, Java, C#, SQL, CSV, and Shell with quote and newline options in your browser.',
    extraKeywords: ['json escape online', 'sql string escape', 'unescape json string', 'csv quote escape', 'shell argument escape'],
  },
  about: {
    summary: 'The String Escape & Unescape Tool formats strings for code literals, database queries, API payloads, or shell commands with bidirectional conversion.',
    useCases: [
      'Embedding multiline strings and quotes inside JSON configuration files',
      'Escaping single quotes to prevent SQL syntax errors in raw queries',
      'Encoding special characters into HTML entities or Unicode escape codes (\\uXXXX)',
      'Safely passing parameters into Bash and POSIX terminal commands'
    ],
    features: [
      'Multi-language format support: JSON, JS/TS, Python, Java, C#, SQL, HTML, CSV, Shell',
      'Bidirectional Escape and Unescape modes',
      'Optional newline preservation and non-ASCII Unicode encoding',
      'Real-time output with one-click copy'
    ],
    notes: [
      'SQL escaping doubles single quotes according to ANSI SQL standards',
      'Shell mode wraps strings in POSIX-compliant single quotes'
    ],
    tip: 'Toggle between Escape and Unescape mode to instantly clean strings copied from stack traces or log files.'
  }
}
