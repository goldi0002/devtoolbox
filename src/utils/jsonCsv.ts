export interface CsvOptions {
  delimiter: string
  flatten: boolean
  quoteAll: boolean
  includeHeaders: boolean
}

export interface JsonOptions {
  delimiter: string
  unflatten: boolean
  parseNumbers: boolean
  parseBooleans: boolean
}

export function detectDelimiter(text: string): string {
  const firstLine = text.trim().split(/\r?\n/)[0] || ''
  const counts: Record<string, number> = {
    ',': (firstLine.match(/,/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
    '|': (firstLine.match(/\|/g) || []).length,
  }

  let best = ','
  let max = 0
  for (const [delim, count] of Object.entries(counts)) {
    if (count > max) {
      max = count
      best = delim
    }
  }
  return best
}

export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {}

  if (obj === null || obj === undefined) return result
  if (typeof obj !== 'object') {
    result[prefix || 'value'] = obj
    return result
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result[prefix] = ''
      return result
    }
    // If primitive array, join with semicolons
    const isPrimitive = obj.every(x => typeof x !== 'object' || x === null)
    if (isPrimitive) {
      result[prefix] = obj.join('; ')
      return result
    }
    // If array of objects, flatten with indices
    obj.forEach((item, index) => {
      const nested = flattenObject(item, prefix ? `${prefix}[${index}]` : `[${index}]`)
      Object.assign(result, nested)
    })
    return result
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      const isPrimitive = value.every(x => typeof x !== 'object' || x === null)
      if (isPrimitive) {
        result[newKey] = value.join('; ')
      } else {
        value.forEach((item, idx) => {
          Object.assign(result, flattenObject(item, `${newKey}[${idx}]`))
        })
      }
    } else {
      result[newKey] = value
    }
  }

  return result
}

export function unflattenObject(obj: Record<string, any>): any {
  const result: any = {}

  for (const [flatKey, value] of Object.entries(obj)) {
    const parts = flatKey.split(/\.|\[(\d+)\]/).filter(Boolean)
    let current = result

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]
      const isNextNumeric = /^\d+$/.test(nextPart)

      if (!(part in current)) {
        current[part] = isNextNumeric ? [] : {}
      }
      current = current[part]
    }

    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
  }

  return result
}

function escapeCsvCell(val: any, delimiter: string, quoteAll: boolean): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  const needsQuotes = quoteAll || str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function jsonToCsv(jsonStr: string, options: Partial<CsvOptions> = {}): string {
  const {
    delimiter = ',',
    flatten = true,
    quoteAll = false,
    includeHeaders = true
  } = options

  const parsed = JSON.parse(jsonStr)
  let items = Array.isArray(parsed) ? parsed : [parsed]

  if (flatten) {
    items = items.map(item => flattenObject(item))
  }

  // Collect all unique keys
  const headersSet = new Set<string>()
  items.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => headersSet.add(k))
    }
  })

  const headers = Array.from(headersSet)
  if (headers.length === 0) return ''

  const rows: string[] = []

  if (includeHeaders) {
    rows.push(headers.map(h => escapeCsvCell(h, delimiter, quoteAll)).join(delimiter))
  }

  items.forEach(item => {
    const row = headers.map(h => {
      const val = item ? item[h] : ''
      return escapeCsvCell(val, delimiter, quoteAll)
    })
    rows.push(row.join(delimiter))
  })

  return rows.join('\n')
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function csvToJson(csvStr: string, options: Partial<JsonOptions> = {}): any[] {
  const {
    delimiter = ',',
    unflatten = true,
    parseNumbers = true,
    parseBooleans = true
  } = options

  const cleanText = csvStr.trim()
  if (!cleanText) return []

  // Split lines accounting for multiline quoted fields
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '""'
        i++
      } else {
        inQuotes = !inQuotes
        currentLine += char
      }
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++
      lines.push(currentLine)
      currentLine = ''
    } else {
      currentLine += char
    }
  }
  if (currentLine) lines.push(currentLine)

  if (lines.length === 0) return []

  const headerLine = lines[0]
  const headers = parseCsvLine(headerLine, delimiter).map(h => h.trim())

  const results: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cells = parseCsvLine(line, delimiter)
    const rowObj: Record<string, any> = {}

    headers.forEach((header, colIndex) => {
      const rawVal = cells[colIndex] ?? ''
      let parsedVal: any = rawVal

      if (parseBooleans) {
        if (rawVal.toLowerCase() === 'true') parsedVal = true
        else if (rawVal.toLowerCase() === 'false') parsedVal = false
      }

      if (parseNumbers && typeof parsedVal === 'string' && rawVal.trim() !== '') {
        const num = Number(rawVal)
        if (!isNaN(num) && isFinite(num)) {
          parsedVal = num
        }
      }

      if (parsedVal === '' || parsedVal === 'null') {
        if (parsedVal === 'null') parsedVal = null
      }

      rowObj[header] = parsedVal
    })

    if (unflatten) {
      results.push(unflattenObject(rowObj))
    } else {
      results.push(rowObj)
    }
  }

  return results
}
