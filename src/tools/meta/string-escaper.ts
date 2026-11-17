import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const STRING_ESCAPER_META: ToolMeta = {
  slug: 'string-escaper',
  name: 'String Escape & Unescape',
  category: 'encode-tools',
  tag: 'ESCAPE',
  description: 'Escape and unescape strings for JSON, JavaScript, Python, Java, C#, SQL, CSV, HTML, and Shell.',
  keywords: ['string escaper', 'unescape string', 'escape json string', 'escape sql quotes', 'escape html', 'slash escape'],
  status: 'stable',
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
  },
  guide: {
    "steps": [
      {
        "name": "Pick escape or unescape",
        "text": "Choose Escape String to make raw text safe to paste into code, or Unescape String to turn an escaped string back into plain text."
      },
      {
        "name": "Choose the target format",
        "text": "Select JSON, JavaScript / TS, Python, Java / C#, SQL, HTML Entities, CSV, Shell / Bash or Unicode Escape. Each uses that language's escaping rules."
      },
      {
        "name": "Set the options",
        "text": "When escaping, Preserve Real Newlines keeps line breaks as real line breaks instead of \\n. For JavaScript and Java / C#, Escape Non-ASCII turns every non-ASCII character into \\uXXXX."
      },
      {
        "name": "Paste and copy",
        "text": "Type or paste into the input; the result updates as you type and can be copied with one click."
      }
    ],
    "faqs": [
      {
        "question": "How are emoji written with Escape Non-ASCII?",
        "answer": "As a UTF-16 surrogate pair, for example 😀 becomes \\ud83d\\ude00. That is the form JSON, JavaScript, Java and C# expect, and unescaping turns it back into the emoji."
      },
      {
        "question": "What does SQL mode do?",
        "answer": "It doubles single quotes, so O'Brien becomes O''Brien. Use it for string literals; for user input in real queries, prefer parameterized queries."
      },
      {
        "question": "When does CSV mode add quotes?",
        "answer": "Only when the value contains a comma, a double quote or a line break. It then wraps the value in double quotes and doubles any quotes inside."
      },
      {
        "question": "How does Shell mode quote text?",
        "answer": "It wraps the text in POSIX single quotes and writes each single quote inside as '\\\\'', so the shell treats the whole value literally."
      }
    ],
    "example": {
      "title": "Escape text for a JavaScript string with Escape Non-ASCII on.",
      "input": "Say \"hi\" 😀\nBye",
      "output": "Say \\\"hi\\\" \\ud83d\\ude00\\nBye",
      "inputLabel": "Raw input",
      "outputLabel": "Escaped result (JavaScript)"
    }
  }
}
