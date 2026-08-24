// Comprehensive JSON Processing, Auto-Repair, Querying, Formatting, and Analysis Engine
// Safe for both Web Worker background execution and main thread / SSR execution.

export interface JsonStats {
  totalKeys: number
  depth: number
  totalObjects: number
  totalArrays: number
  totalPrimitives: number
  stringCount: number
  numberCount: number
  booleanCount: number
  nullCount: number
  rawSizeBytes: number
  formattedSizeBytes: number
  minifiedSizeBytes: number
  lineCount: number
  parseTimeMs: number
}

export interface JsonErrorDetail {
  message: string
  line: number
  column: number
  offset: number
  snippet: string
  suggestion?: string
}

export type SortKeyMode = 'none' | 'asc' | 'desc' | 'natural' | 'length'
export type CaseMode = 'none' | 'camel' | 'snake' | 'kebab' | 'pascal' | 'constant'
export type IndentOption = 2 | 4 | 3 | '\t' | 'minified' | 'compact'

export interface FormatOptions {
  indent: IndentOption
  sortKeys?: SortKeyMode
  caseMode?: CaseMode
  removeNulls?: boolean
  removeEmptyStrings?: boolean
  removeEmptyArrays?: boolean
  removeEmptyObjects?: boolean
  escapeUnicode?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Syntax Error Pinpointing & Analysis
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeJsonError(rawInput: string): JsonErrorDetail {
  if (!rawInput.trim()) {
    return {
      message: 'Empty JSON input',
      line: 1,
      column: 1,
      offset: 0,
      snippet: '',
      suggestion: 'Paste or type valid JSON data into the editor.'
    }
  }

  let line = 1
  let column = 1
  let offset = 0
  let message = 'Invalid JSON syntax'
  let suggestion: string | undefined

  try {
    JSON.parse(rawInput)
    return {
      message: 'Valid JSON',
      line: 1,
      column: 1,
      offset: 0,
      snippet: ''
    }
  } catch (e: any) {
    message = e.message || 'Syntax Error'

    // Extract position if browser error message provides it (e.g. "at position 42" or "line 3 column 5")
    const posMatch = message.match(/at position (\d+)/i) || message.match(/position (\d+)/i)
    const lineColMatch = message.match(/line (\d+) column (\d+)/i)

    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10)
      column = parseInt(lineColMatch[2], 10)
      // Calculate offset from line/column
      const lines = rawInput.split('\n')
      offset = 0
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        offset += lines[i].length + 1
      }
      offset += column - 1
    } else if (posMatch) {
      offset = parseInt(posMatch[1], 10)
      if (offset >= rawInput.length) offset = Math.max(0, rawInput.length - 1)
      const textBefore = rawInput.slice(0, offset)
      const linesBefore = textBefore.split('\n')
      line = linesBefore.length
      column = linesBefore[linesBefore.length - 1].length + 1
    } else {
      // Fallback: estimate error location through character inspection
      let inString = false
      let escape = false
      let depth = 0
      for (let i = 0; i < rawInput.length; i++) {
        const char = rawInput[i]
        if (escape) {
          escape = false
          continue
        }
        if (char === '\\') {
          escape = true
          continue
        }
        if (char === '"') {
          inString = !inString
          continue
        }
        if (!inString) {
          if (char === '{' || char === '[') depth++
          else if (char === '}' || char === ']') depth--
          else if (char === '\n') {
            line++
            column = 1
            offset = i
          }
        }
        column++
      }
    }

    // Build snippet around the error
    const lines = rawInput.split('\n')
    const errLineIndex = Math.max(0, line - 1)
    const errLineText = lines[errLineIndex] || ''
    const startCol = Math.max(0, column - 25)
    const endCol = Math.min(errLineText.length, column + 25)
    const snippetSection = errLineText.slice(startCol, endCol)
    const pointerSpaces = Math.max(0, (column - 1) - startCol)
    const snippet = `${snippetSection}\n${' '.repeat(pointerSpaces)}^`

    // Provide intelligent auto-fix suggestion based on common patterns
    if (message.includes('Expected double-quoted property name') || message.includes('is not valid JSON')) {
      if (errLineText.includes("'")) {
        suggestion = 'Single quotes are not allowed in JSON. Click "Auto-Repair JSON" to convert single quotes to double quotes.'
      } else if (/[a-zA-Z0-9_$]+\s*:/.test(errLineText)) {
        suggestion = 'Unquoted keys detected. Click "Auto-Repair JSON" to automatically quote all property keys.'
      } else if (/,\s*[}\]]/.test(errLineText)) {
        suggestion = 'Trailing comma detected before closing bracket. Click "Auto-Repair JSON" to remove it.'
      }
    } else if (message.includes('Unexpected token') || message.includes('Unexpected end of JSON')) {
      if (errLineText.includes('//') || errLineText.includes('/*')) {
        suggestion = 'Comments are not standard JSON. Click "Auto-Repair JSON" to strip all comments.'
      } else if (errLineText.includes('True') || errLineText.includes('False') || errLineText.includes('None')) {
        suggestion = 'Python-style literals (True, False, None) detected. Click "Auto-Repair JSON" to convert to valid JSON.'
      } else {
        suggestion = 'Syntax error near this line. Use "Auto-Repair JSON" or check for missing/unbalanced quotes or braces.'
      }
    }

    return {
      message,
      line,
      column,
      offset,
      snippet,
      suggestion
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Relaxed JSON Parser & Auto-Repair Engine
// ─────────────────────────────────────────────────────────────────────────────

export function autoRepairJson(input: string): string {
  if (!input || !input.trim()) return ''

  let text = input.trim()

  // 1. Remove JavaScript variable declaration wrappers e.g., "const data = { ... };" or "var config = [ ... ];"
  text = text.replace(/^(?:const|let|var)\s+[a-zA-Z0-9_$]+\s*=\s*/, '')
  text = text.replace(/;+\s*$/, '')

  // 2. Remove export default / module.exports
  text = text.replace(/^(?:export\s+default|module\.exports\s*=)\s*/, '')

  // 3. Remove single line and multi-line comments safely while preserving string literals
  text = stripJsonComments(text)

  // 4. Convert Python literals
  text = text.replace(/\bTrue\b/g, 'true')
  text = text.replace(/\bFalse\b/g, 'false')
  text = text.replace(/\bNone\b/g, 'null')
  text = text.replace(/\bundefined\b/g, 'null')
  text = text.replace(/\bNaN\b/g, 'null')
  text = text.replace(/\bInfinity\b/g, 'null')

  // 5. Fix hexadecimal and octal numbers (e.g. 0x1A -> 26)
  text = text.replace(/:\s*(0x[0-9a-fA-F]+)/g, (_, hex) => `: ${parseInt(hex, 16)}`)

  // 6. Convert single-quoted keys and strings to standard double quotes
  // Use state machine to avoid breaking apostrophes inside double quotes
  text = convertSingleQuotesToDoubleQuotes(text)

  // 7. Quote unquoted object keys (e.g. { foo: 1, bar_baz: "2" })
  text = quoteUnquotedKeys(text)

  // 8. Remove trailing commas in objects and arrays (e.g. [1, 2, 3,] or {"a": 1,})
  text = text.replace(/,(\s*[\]}])/g, '$1')

  // 9. Fix missing commas between properties or array elements
  // e.g. "key": 1 \n "key2": 2 -> "key": 1,\n "key2": 2
  text = fixMissingCommas(text)

  // 10. Balance unclosed brackets/braces if truncated
  text = balanceBrackets(text)

  return text
}

function stripJsonComments(text: string): string {
  let result = ''
  let inString = false
  let isEscaped = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
        result += char
      }
      continue
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        i++ // Skip '/'
      }
      continue
    }

    if (inString) {
      result += char
      if (isEscaped) {
        isEscaped = false
      } else if (char === '\\') {
        isEscaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    // Check for comment starts
    if (char === '/' && next === '/') {
      inLineComment = true
      i++
      continue
    }
    if (char === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }

    if (char === '"') {
      inString = true
    }

    result += char
  }

  return result
}

function convertSingleQuotesToDoubleQuotes(text: string): string {
  let result = ''
  let inDouble = false
  let inSingle = false
  let isEscaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (isEscaped) {
      result += char
      isEscaped = false
      continue
    }

    if (char === '\\') {
      result += char
      isEscaped = true
      continue
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble
      result += char
      continue
    }

    if (char === "'" && !inDouble) {
      inSingle = !inSingle
      result += '"' // Replace single quote with double quote
      continue
    }

    // Inside single quotes, if there is an unescaped double quote, escape it
    if (inSingle && char === '"') {
      result += '\\"'
      continue
    }

    result += char
  }

  return result
}

function quoteUnquotedKeys(text: string): string {
  // Regex matches unquoted alphanumeric key before a colon
  return text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, '$1"$2":')
}

function fixMissingCommas(text: string): string {
  // Detects: "val"\n"key": or 123\n"key": or true\n"key":
  return text.replace(/(["\dtruefalsenull\]}])(\s*\n\s*)("[a-zA-Z0-9_$]+"\s*:)/g, '$1,$2$3')
}

function balanceBrackets(text: string): string {
  let openBraces = 0
  let openBrackets = 0
  let inString = false
  let isEscaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (isEscaped) {
      isEscaped = false
      continue
    }
    if (char === '\\') {
      isEscaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (char === '{') openBraces++
      else if (char === '}') openBraces = Math.max(0, openBraces - 1)
      else if (char === '[') openBrackets++
      else if (char === ']') openBrackets = Math.max(0, openBrackets - 1)
    }
  }

  let repaired = text
  while (openBraces > 0) {
    repaired += '\n}'
    openBraces--
  }
  while (openBrackets > 0) {
    repaired += '\n]'
    openBrackets--
  }

  return repaired
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Transformation & Key Sorting / Case Conversions / Cleaning
// ─────────────────────────────────────────────────────────────────────────────

export function transformJsonKeys(
  value: any,
  sortMode: SortKeyMode = 'none',
  caseMode: CaseMode = 'none',
  cleanOptions?: {
    removeNulls?: boolean
    removeEmptyStrings?: boolean
    removeEmptyArrays?: boolean
    removeEmptyObjects?: boolean
  }
): any {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    let arr = value.map(item => transformJsonKeys(item, sortMode, caseMode, cleanOptions))
    if (cleanOptions?.removeNulls) {
      arr = arr.filter(item => item !== null && item !== undefined)
    }
    if (cleanOptions?.removeEmptyStrings) {
      arr = arr.filter(item => item !== '')
    }
    if (cleanOptions?.removeEmptyArrays) {
      arr = arr.filter(item => !(Array.isArray(item) && item.length === 0))
    }
    if (cleanOptions?.removeEmptyObjects) {
      arr = arr.filter(item => !(typeof item === 'object' && item !== null && !Array.isArray(item) && Object.keys(item).length === 0))
    }
    return arr
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)

    if (sortMode === 'asc') {
      keys.sort((a, b) => a.localeCompare(b))
    } else if (sortMode === 'desc') {
      keys.sort((a, b) => b.localeCompare(a))
    } else if (sortMode === 'natural') {
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    } else if (sortMode === 'length') {
      keys.sort((a, b) => a.length - b.length || a.localeCompare(b))
    }

    const newObj: Record<string, any> = {}

    for (const key of keys) {
      let transformedKey = key
      if (caseMode !== 'none') {
        transformedKey = convertCase(key, caseMode)
      }

      const val = transformJsonKeys(value[key], sortMode, caseMode, cleanOptions)

      // Cleaning checks
      if (cleanOptions?.removeNulls && (val === null || val === undefined)) continue
      if (cleanOptions?.removeEmptyStrings && val === '') continue
      if (cleanOptions?.removeEmptyArrays && Array.isArray(val) && val.length === 0) continue
      if (cleanOptions?.removeEmptyObjects && typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length === 0) continue

      newObj[transformedKey] = val
    }

    return newObj
  }

  return value
}

function convertCase(str: string, mode: CaseMode): string {
  if (!str) return str
  // Split into words by uppercase transitions, underscores, hyphens, spaces
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)

  if (words.length === 0) return str

  switch (mode) {
    case 'camel':
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('')
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_')
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-')
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_')
    default:
      return str
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Formatting & JSON Stringification
// ─────────────────────────────────────────────────────────────────────────────

export function formatJsonData(parsed: any, options: FormatOptions): string {
  const transformed = transformJsonKeys(
    parsed,
    options.sortKeys,
    options.caseMode,
    {
      removeNulls: options.removeNulls,
      removeEmptyStrings: options.removeEmptyStrings,
      removeEmptyArrays: options.removeEmptyArrays,
      removeEmptyObjects: options.removeEmptyObjects
    }
  )

  if (options.indent === 'minified' || options.indent === 'compact') {
    return JSON.stringify(transformed)
  }

  const space = options.indent === '\t' ? '\t' : options.indent
  let formatted = JSON.stringify(transformed, null, space)

  if (options.escapeUnicode) {
    formatted = formatted.replace(/[\u007F-\uFFFF]/g, chr => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4)
    })
  }

  return formatted
}

export function escapeJsonString(jsonStr: string): string {
  return JSON.stringify(jsonStr)
}

export function unescapeJsonString(escapedStr: string): string {
  try {
    const trimmed = escapedStr.trim()
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return JSON.parse(trimmed)
    }
    return JSON.parse(`"${trimmed.replace(/"/g, '\\"')}"`)
  } catch {
    return escapedStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Deep Metrics & Analysis
// ─────────────────────────────────────────────────────────────────────────────

export function computeJsonStats(data: any, rawStr?: string): JsonStats {
  const startTime = performance.now()
  let totalKeys = 0
  let maxDepth = 0
  let totalObjects = 0
  let totalArrays = 0
  let totalPrimitives = 0
  let stringCount = 0
  let numberCount = 0
  let booleanCount = 0
  let nullCount = 0

  function traverse(node: any, currentDepth: number) {
    if (currentDepth > maxDepth) maxDepth = currentDepth

    if (node === null) {
      nullCount++
      totalPrimitives++
      return
    }

    if (Array.isArray(node)) {
      totalArrays++
      for (let i = 0; i < node.length; i++) {
        traverse(node[i], currentDepth + 1)
      }
      return
    }

    if (typeof node === 'object') {
      totalObjects++
      const keys = Object.keys(node)
      totalKeys += keys.length
      for (const key of keys) {
        traverse(node[key], currentDepth + 1)
      }
      return
    }

    totalPrimitives++
    if (typeof node === 'string') stringCount++
    else if (typeof node === 'number') numberCount++
    else if (typeof node === 'boolean') booleanCount++
  }

  traverse(data, 1)

  const raw = rawStr || JSON.stringify(data)
  const minified = JSON.stringify(data)
  const formatted = JSON.stringify(data, null, 2)
  const lineCount = formatted.split('\n').length
  const parseTimeMs = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)))

  const encoder = new TextEncoder()
  const rawSizeBytes = encoder.encode(raw).length
  const formattedSizeBytes = encoder.encode(formatted).length
  const minifiedSizeBytes = encoder.encode(minified).length

  return {
    totalKeys,
    depth: maxDepth,
    totalObjects,
    totalArrays,
    totalPrimitives,
    stringCount,
    numberCount,
    booleanCount,
    nullCount,
    rawSizeBytes,
    formattedSizeBytes,
    minifiedSizeBytes,
    lineCount,
    parseTimeMs
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Advanced Query & Filtering Engine (JSONPath / DotPath / JS Expressions)
// ─────────────────────────────────────────────────────────────────────────────

export interface QueryResult {
  data: any
  matchCount: number
  error?: string
  queryTimeMs: number
}

export function queryJsonData(
  rootData: any,
  queryString: string,
  queryType: 'path' | 'jsexpr' | 'search' = 'path'
): QueryResult {
  const start = performance.now()
  const q = queryString.trim()

  if (!q) {
    const isArr = Array.isArray(rootData)
    return {
      data: rootData,
      matchCount: isArr ? rootData.length : (typeof rootData === 'object' && rootData !== null ? Object.keys(rootData).length : 1),
      queryTimeMs: Number((performance.now() - start).toFixed(2))
    }
  }

  try {
    if (queryType === 'search') {
      // Recursive full-text / regex search across all keys and values
      const matches: Array<{ path: string; value: any }> = []
      const isRegex = q.startsWith('/') && q.lastIndexOf('/') > 0
      let regex: RegExp
      if (isRegex) {
        const lastSlash = q.lastIndexOf('/')
        const pattern = q.slice(1, lastSlash)
        const flags = q.slice(lastSlash + 1) || 'i'
        regex = new RegExp(pattern, flags)
      } else {
        regex = new RegExp(escapeRegExp(q), 'i')
      }

      const searchTraverse = (node: any, currentPath: string) => {
        if (node === null || node === undefined) return

        if (Array.isArray(node)) {
          node.forEach((item, index) => {
            searchTraverse(item, `${currentPath}[${index}]`)
          })
          return
        }

        if (typeof node === 'object') {
          for (const key of Object.keys(node)) {
            const nextPath = currentPath ? `${currentPath}.${key}` : key
            if (regex.test(key)) {
              matches.push({ path: nextPath, value: node[key] })
            }
            searchTraverse(node[key], nextPath)
          }
          return
        }

        // Primitive check
        if (regex.test(String(node))) {
          matches.push({ path: currentPath, value: node })
        }
      }

      searchTraverse(rootData, '$')
      return {
        data: matches,
        matchCount: matches.length,
        queryTimeMs: Number((performance.now() - start).toFixed(2))
      }
    }

    if (queryType === 'jsexpr') {
      // Safe sandboxed JavaScript expression filter e.g. "item => item.age > 20" or "x.status === 'active'"
      // Or expression operating on $ or data
      const sandboxFn = new Function('$, data, root', `
        "use strict";
        try {
          const fn = (${q});
          if (typeof fn === 'function') {
            if (Array.isArray(data)) {
              return data.filter(fn);
            }
            return fn(data);
          }
          return (${q});
        } catch(e) {
          throw e;
        }
      `)

      const result = sandboxFn(rootData, rootData, rootData)
      const count = Array.isArray(result) ? result.length : (result !== undefined ? 1 : 0)
      return {
        data: result,
        matchCount: count,
        queryTimeMs: Number((performance.now() - start).toFixed(2))
      }
    }

    // Path / Dot Notation / Wildcard Query e.g. "users[0].name", "$.store.book[*].title", "items.*.id"
    const cleanedPath = q.replace(/^\$\.?/, '')
    const result = evaluateDotPath(rootData, cleanedPath)
    const count = Array.isArray(result) ? result.length : (result !== undefined ? 1 : 0)

    return {
      data: result,
      matchCount: count,
      queryTimeMs: Number((performance.now() - start).toFixed(2))
    }
  } catch (err: any) {
    return {
      data: null,
      matchCount: 0,
      error: err.message || 'Query error',
      queryTimeMs: Number((performance.now() - start).toFixed(2))
    }
  }
}

function evaluateDotPath(obj: any, path: string): any {
  if (!path) return obj
  const segments = path.split(/\.(?![^[]*\])/).filter(Boolean)

  let current = [obj]

  for (const seg of segments) {
    const nextList: any[] = []

    for (const target of current) {
      if (target === null || target === undefined) continue

      // Check array indexing e.g. "users[0]" or "items[*]" or "[*]"
      const arrayMatch = seg.match(/^([^[]*)\[(.*?)\]$/)

      if (arrayMatch) {
        const prop = arrayMatch[1]
        const idx = arrayMatch[2].trim()
        const parent = prop ? target[prop] : target

        if (!parent) continue

        if (idx === '*' || idx === '') {
          if (Array.isArray(parent)) {
            nextList.push(...parent)
          } else if (typeof parent === 'object') {
            nextList.push(...Object.values(parent))
          }
        } else {
          const num = parseInt(idx, 10)
          if (!isNaN(num) && parent[num] !== undefined) {
            nextList.push(parent[num])
          }
        }
      } else if (seg === '*') {
        if (Array.isArray(target)) {
          nextList.push(...target)
        } else if (typeof target === 'object') {
          nextList.push(...Object.values(target))
        }
      } else {
        if (target[seg] !== undefined) {
          nextList.push(target[seg])
        }
      }
    }

    current = nextList
  }

  if (current.length === 0) return undefined
  if (current.length === 1 && !path.includes('*') && !path.includes('[]')) return current[0]
  return current
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TypeScript Type Generator from JSON
// ─────────────────────────────────────────────────────────────────────────────

export function jsonToTypeScript(data: any, rootName = 'RootObject'): string {
  const interfaces: Map<string, string> = new Map()

  function getTypeName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9]/g, '')
  }

  function inferType(val: any, propName: string): string {
    if (val === null) return 'null | any'
    if (val === undefined) return 'undefined'
    if (typeof val === 'string') return 'string'
    if (typeof val === 'number') return 'number'
    if (typeof val === 'boolean') return 'boolean'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]'
      const itemTypes = new Set<string>()
      for (const item of val.slice(0, 10)) {
        itemTypes.add(inferType(item, `${propName}Item`))
      }
      const typeUnion = Array.from(itemTypes).join(' | ')
      return typeUnion.includes('|') ? `(${typeUnion})[]` : `${typeUnion}[]`
    }

    if (typeof val === 'object') {
      const typeName = getTypeName(propName || 'NestedObject')
      const lines: string[] = []
      lines.push(`export interface ${typeName} {`)

      for (const [k, v] of Object.entries(val)) {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k)
        const childType = inferType(v, `${typeName}_${k}`)
        lines.push(`  ${safeKey}: ${childType};`)
      }

      lines.push('}')
      interfaces.set(typeName, lines.join('\n'))
      return typeName
    }

    return 'any'
  }

  inferType(data, rootName)

  const output: string[] = []
  // Put root object at the top
  if (interfaces.has(rootName)) {
    output.push(interfaces.get(rootName)!)
    interfaces.delete(rootName)
  }

  for (const [, def] of interfaces.entries()) {
    output.push(def)
  }

  return output.join('\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Sample Data Generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateSampleJson(type: 'ecommerce' | 'github' | 'broken' | 'large_benchmark' | 'weather'): string {
  switch (type) {
    case 'ecommerce':
      return JSON.stringify({
        status: 'success',
        code: 200,
        data: {
          store: {
            id: 'store_98214',
            name: 'CyberTech Components HQ',
            currency: 'USD',
            rating: 4.89,
            active: true
          },
          categories: ['Processors', 'Graphics Cards', 'Memory Modules', 'NVMe Storage'],
          products: [
            {
              sku: 'CPU-9950X',
              name: 'Ryzen 9 9950X 16-Core Processor',
              price: 649.99,
              stock: 42,
              tags: ['high-performance', 'zen5', 'am5'],
              specs: { cores: 16, threads: 32, baseClockGhz: 4.3, boostClockGhz: 5.7, tdpWatts: 170 },
              reviews: [
                { user: 'alex_dev', score: 5, comment: 'Phenomenal compile times for Rust & C++.' },
                { user: 'sarah_k', score: 5, comment: 'Handles multiple 4K renders simultaneously.' }
              ]
            },
            {
              sku: 'GPU-5090',
              name: 'GeForce RTX 5090 32GB',
              price: 1999.00,
              stock: 8,
              tags: ['flagship', 'blackwell', 'ai-workstation'],
              specs: { memoryGb: 32, memoryType: 'GDDR7', busWidth: 512, powerWatts: 575 },
              reviews: [
                { user: 'deep_learner', score: 5, comment: 'Local LLM inference is lightning fast.' }
              ]
            },
            {
              sku: 'RAM-DDR5-64G',
              name: 'DDR5-6400 CL30 64GB Dual Kit',
              price: 219.50,
              stock: 95,
              tags: ['low-latency', 'rgb', 'expo'],
              specs: { capacityGb: 64, speedMhz: 6400, casLatency: 30, voltage: 1.35 }
            }
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            totalItems: 3,
            hasNextPage: false
          }
        },
        metadata: {
          timestamp: '2026-08-24T18:30:00.000Z',
          serverNode: 'us-east-cluster-04',
          latencyMs: 14.2
        }
      }, null, 2)

    case 'github':
      return JSON.stringify({
        id: 84920194,
        node_id: 'MDEwOlJlcG9zaXRvcnk4NDkyMDE5NA==',
        name: 'ToolBox4Devs',
        full_name: 'developer/toolbox4devs',
        private: false,
        owner: {
          login: 'developer',
          id: 1048291,
          avatar_url: 'https://avatars.githubusercontent.com/u/1048291',
          type: 'Organization',
          site_admin: false
        },
        description: 'Comprehensive 100% client-side developer utility suite with zero backend dependencies.',
        stargazers_count: 14280,
        watchers_count: 320,
        forks_count: 1140,
        open_issues_count: 12,
        license: {
          key: 'mit',
          name: 'MIT License',
          spdx_id: 'MIT',
          url: 'https://api.github.com/licenses/mit'
        },
        topics: ['developer-tools', 'json', 'formatter', 'typescript', 'react', 'pwa', 'offline-first'],
        visibility: 'public',
        default_branch: 'main'
      }, null, 2)

    case 'broken':
      return `// API Response Log with comments and common JSON flaws
{
  name: 'Developer Workstation', // Unquoted key & single quotes
  version: 2.5,
  features: [
    'Syntax Checker',
    'Worker Parsing',
    'JSONPath Querying', // Trailing comma below
  ],
  isProductionReady: True, // Python boolean
  fallbackStrategy: None,   // Python None
  settings: {
    port: 0x1F90,          // Hexadecimal number (8080)
    strictMode: False,
    timeoutMs: 5000,
  }
}`

    case 'large_benchmark': {
      const items = []
      for (let i = 1; i <= 1000; i++) {
        items.push({
          id: i,
          uuid: `usr_${Math.random().toString(36).substring(2, 9)}_${i}`,
          username: `developer_${i}`,
          email: `dev${i}@example.internal`,
          role: i % 10 === 0 ? 'admin' : (i % 3 === 0 ? 'editor' : 'viewer'),
          score: Math.floor(Math.random() * 10000) / 10,
          isActive: i % 7 !== 0,
          details: {
            loginCount: (i * 13) % 500,
            lastIp: `192.168.1.${(i % 254) + 1}`,
            country: ['US', 'DE', 'JP', 'GB', 'SG', 'BR', 'CA'][i % 7],
            preferences: {
              theme: i % 2 === 0 ? 'dark' : 'light',
              notifications: { email: true, push: i % 5 === 0 }
            }
          },
          tags: [`cluster-${(i % 4) + 1}`, `tier-${(i % 3) + 1}`]
        })
      }
      return JSON.stringify({
        benchmark: 'Stress Test Payload',
        recordCount: items.length,
        generatedAt: new Date().toISOString(),
        users: items
      }, null, 2)
    }

    case 'weather':
      return JSON.stringify({
        city: 'San Francisco',
        coordinates: { lat: 37.7749, lon: -122.4194 },
        current: {
          tempC: 18.5,
          tempF: 65.3,
          condition: 'Partly Cloudy',
          humidityPct: 72,
          windKmh: 14.8,
          uvIndex: 4
        },
        forecast: [
          { day: 'Mon', high: 19, low: 12, condition: 'Sunny', rainChance: 0 },
          { day: 'Tue', high: 21, low: 13, condition: 'Clear', rainChance: 5 },
          { day: 'Wed', high: 17, low: 11, condition: 'Foggy', rainChance: 20 },
          { day: 'Thu', high: 18, low: 12, condition: 'Partly Cloudy', rainChance: 10 }
        ]
      }, null, 2)
  }
}
