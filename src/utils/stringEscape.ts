export type EscapeFormat = 
  | 'json' 
  | 'javascript' 
  | 'python' 
  | 'java' 
  | 'csharp' 
  | 'sql' 
  | 'html' 
  | 'csv' 
  | 'shell' 
  | 'unicode'

export interface EscapeOptions {
  preserveNewlines?: boolean
  escapeUnicode?: boolean
}

export function escapeString(input: string, format: EscapeFormat, options: EscapeOptions = {}): string {
  if (!input) return ''

  switch (format) {
    case 'json': {
      let escaped = JSON.stringify(input)
      // JSON.stringify wraps in quotes. Strip outer quotes if raw escaped string is desired.
      escaped = escaped.slice(1, -1)
      if (options.preserveNewlines) {
        escaped = escaped.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
      }
      return escaped
    }

    case 'javascript': {
      let res = input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/`/g, '\\`')
        .replace(/\t/g, '\\t')
      if (!options.preserveNewlines) {
        res = res.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
      }
      if (options.escapeUnicode) {
        res = Array.from(res)
          .map(char => char.charCodeAt(0) > 127 ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}` : char)
          .join('')
      }
      return res
    }

    case 'python': {
      let res = input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\t/g, '\\t')
      if (!options.preserveNewlines) {
        res = res.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
      }
      return res
    }

    case 'java':
    case 'csharp': {
      let res = input
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\t/g, '\\t')
      if (!options.preserveNewlines) {
        res = res.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
      }
      if (options.escapeUnicode) {
        res = Array.from(res)
          .map(char => char.charCodeAt(0) > 127 ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}` : char)
          .join('')
      }
      return res
    }

    case 'sql': {
      // Standard SQL escaping doubles single quotes
      return input.replace(/'/g, "''")
    }

    case 'html': {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    case 'csv': {
      if (input.includes(',') || input.includes('"') || input.includes('\n') || input.includes('\r')) {
        return `"${input.replace(/"/g, '""')}"`
      }
      return input
    }

    case 'shell': {
      // Safely escape for POSIX sh / bash single-quoted string
      return `'${input.replace(/'/g, "'\\''")}'`
    }

    case 'unicode': {
      return Array.from(input)
        .map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
        .join('')
    }

    default:
      return input
  }
}

export function unescapeString(input: string, format: EscapeFormat): string {
  if (!input) return ''

  switch (format) {
    case 'json':
    case 'javascript':
    case 'python':
    case 'java':
    case 'csharp': {
      try {
        // Try strict JSON unescape first
        return JSON.parse(`"${input.replace(/"/g, '\\"')}"`)
      } catch {
        return input
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, '\\')
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      }
    }

    case 'sql': {
      return input.replace(/''/g, "'")
    }

    case 'html': {
      return input
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
    }

    case 'csv': {
      let res = input.trim()
      if (res.startsWith('"') && res.endsWith('"')) {
        res = res.slice(1, -1).replace(/""/g, '"')
      }
      return res
    }

    case 'shell': {
      let res = input.trim()
      if (res.startsWith("'") && res.endsWith("'")) {
        res = res.slice(1, -1).replace(/'\\''/g, "'")
      }
      return res
    }

    case 'unicode': {
      return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
    }

    default:
      return input
  }
}
