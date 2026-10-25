import Papa from 'papaparse'

export type ColumnDataType =
  | 'any'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'email'
  | 'uuid'
  | 'url'
  | 'ipv4'
  | 'ipv6'
  | 'phone'
  | 'alphanumeric'
  | 'alphabetical'
  | 'json'
  | 'hex_color'
  | 'semver'
  | 'credit_card'
  | 'mac_address'
  | 'base64'
  | 'slug'

export type RuleType =
  | 'required'
  | 'type'
  | 'range'
  | 'positive'
  | 'non_negative'
  | 'length'
  | 'exact_length'
  | 'starts_with'
  | 'ends_with'
  | 'contains'
  | 'not_contains'
  | 'pattern'
  | 'enum'
  | 'forbidden'
  | 'unique'
  | 'date_after'
  | 'date_before'
  | 'trim'
  | 'uppercase'
  | 'lowercase'
  | 'word_count'
  | 'null_string'

export interface ColumnRule {
  columnName: string
  dataType: ColumnDataType
  required: boolean
  unique: boolean
  // Numeric bounds
  min?: number
  max?: number
  positiveOnly?: boolean
  nonNegativeOnly?: boolean
  // Text constraints
  minLength?: number
  maxLength?: number
  exactLength?: number
  startsWith?: string
  endsWith?: string
  contains?: string
  notContains?: string
  disallowNullStrings?: boolean
  trimCheck?: boolean
  uppercaseOnly?: boolean
  lowercaseOnly?: boolean
  minWords?: number
  maxWords?: number
  // Regex and allowed/disallowed options
  pattern?: string
  allowedValues?: string[]
  forbiddenValues?: string[]
  // Date chronologies
  dateAfter?: string
  dateBefore?: string
}

export interface ValidationError {
  id: string
  rowIndex: number // 1-based data row index (excluding header)
  columnName: string
  columnIndex: number
  cellValue: string
  ruleType: RuleType
  message: string
}

export interface ValidationSummary {
  totalRows: number
  validRows: number
  invalidRows: number
  totalErrors: number
  errorsByColumn: Record<string, number>
  errorsByRule: Record<string, number>
  executionTimeMs: number
}

export interface ValidationResult {
  headers: string[]
  rows: string[][]
  errors: ValidationError[]
  summary: ValidationSummary
  delimiter: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|::1|::)$/
const PHONE_REGEX = /^\+?[0-9\s().-]{7,25}$/
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/
const ALPHABETICAL_REGEX = /^[a-zA-Z\s]+$/
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9a-zA-Z.-]+))?(?:\+([0-9a-zA-Z.-]+))?$/
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

const DISALLOWED_NULL_STRINGS = new Set(['null', 'nil', 'none', 'undefined', 'n/a', 'na', '#n/a', '-', 'blank', 'empty'])

// Luhn algorithm validator for credit cards
function isValidLuhn(numStr: string): boolean {
  const sanitized = numStr.replace(/[\s-]/g, '')
  if (!/^\d{13,19}$/.test(sanitized)) return false

  let sum = 0
  let shouldDouble = false
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function detectDelimiter(sampleText: string): string {
  const delimiters = [',', '\t', '|', ';']
  const lines = sampleText.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 10)
  if (lines.length === 0) return ','

  let bestDelim = ','
  let maxConsistentCount = 0

  for (const delim of delimiters) {
    const counts = lines.map(line => line.split(delim).length - 1)
    const firstCount = counts[0]
    if (firstCount > 0 && counts.every(c => c === firstCount)) {
      if (firstCount > maxConsistentCount) {
        maxConsistentCount = firstCount
        bestDelim = delim
      }
    }
  }

  if (maxConsistentCount === 0) {
    let highestAvg = 0
    for (const delim of delimiters) {
      const avg = lines.reduce((acc, l) => acc + (l.split(delim).length - 1), 0) / lines.length
      if (avg > highestAvg) {
        highestAvg = avg
        bestDelim = delim
      }
    }
  }

  return bestDelim
}

export function inferColumnType(values: string[]): ColumnDataType {
  const nonEmpty = values.map(v => v.trim()).filter(v => v.length > 0)
  if (nonEmpty.length === 0) return 'string'

  if (nonEmpty.every(v => UUID_REGEX.test(v))) return 'uuid'
  if (nonEmpty.every(v => EMAIL_REGEX.test(v))) return 'email'
  if (nonEmpty.every(v => IPV4_REGEX.test(v))) return 'ipv4'
  if (nonEmpty.every(v => SEMVER_REGEX.test(v))) return 'semver'
  if (nonEmpty.every(v => HEX_COLOR_REGEX.test(v))) return 'hex_color'
  if (nonEmpty.every(v => /^(true|false|1|0|yes|no)$/i.test(v))) return 'boolean'
  if (nonEmpty.every(v => /^-?\d+$/.test(v))) return 'integer'
  if (nonEmpty.every(v => !isNaN(Number(v)) && v !== '')) return 'number'

  if (
    nonEmpty.every(v => {
      try {
        const u = new URL(v)
        return u.protocol === 'http:' || u.protocol === 'https:'
      } catch {
        return false
      }
    })
  ) {
    return 'url'
  }

  if (
    nonEmpty.every(v => {
      if (v.length < 8) return false
      const parsed = Date.parse(v)
      return !isNaN(parsed) && /[-/.]/.test(v)
    })
  ) {
    return 'date'
  }

  return 'string'
}

export function generateDefaultRules(headers: string[], sampleRows: string[][]): ColumnRule[] {
  return headers.map((col, idx) => {
    const colValues = sampleRows.map(r => r[idx] ?? '')
    const inferredType = inferColumnType(colValues)
    const hasEmpty = colValues.some(v => v.trim() === '')
    const isIdCol = /^(id|uuid|code|key|user_id|order_id|sku)$/i.test(col.trim())

    return {
      columnName: col,
      dataType: inferredType,
      required: !hasEmpty || isIdCol,
      unique: isIdCol,
      disallowNullStrings: true,
      allowedValues: [],
      forbiddenValues: []
    }
  })
}

export function parseDelimitedData(rawText: string, customDelimiter?: string): { headers: string[]; rows: string[][]; delimiter: string } {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return { headers: [], rows: [], delimiter: ',' }
  }

  const delimiter = customDelimiter && customDelimiter !== 'auto' ? customDelimiter : detectDelimiter(trimmed)

  const parsed = Papa.parse<string[]>(trimmed, {
    delimiter,
    skipEmptyLines: 'greedy'
  })

  const allRows = (parsed.data || []).map(row => row.map(cell => (cell ?? '').toString()))
  if (allRows.length === 0) {
    return { headers: [], rows: [], delimiter }
  }

  const headers = allRows[0].map(h => h.trim())
  const rows = allRows.slice(1)

  return { headers, rows, delimiter }
}

export function validateDelimitedData(
  headers: string[],
  rows: string[][],
  rules: ColumnRule[]
): { errors: ValidationError[]; summary: ValidationSummary } {
  const startTime = performance.now()
  const errors: ValidationError[] = []
  const invalidRowSet = new Set<number>()
  const errorsByColumn: Record<string, number> = {}
  const errorsByRule: Record<string, number> = {}

  const ruleMap = new Map<number, ColumnRule>()
  const uniqueTrackers = new Map<number, Map<string, number>>()

  rules.forEach(rule => {
    const colIdx = headers.findIndex(h => h.toLowerCase() === rule.columnName.toLowerCase())
    if (colIdx !== -1) {
      ruleMap.set(colIdx, rule)
      if (rule.unique) {
        uniqueTrackers.set(colIdx, new Map<string, number>())
      }
    }
  })

  const compiledPatterns = new Map<number, RegExp>()
  rules.forEach(rule => {
    const colIdx = headers.findIndex(h => h.toLowerCase() === rule.columnName.toLowerCase())
    if (colIdx !== -1 && rule.pattern && rule.pattern.trim()) {
      try {
        compiledPatterns.set(colIdx, new RegExp(rule.pattern.trim()))
      } catch {
        // invalid regex in rule
      }
    }
  })

  function addError(
    rowIndex: number,
    columnName: string,
    columnIndex: number,
    cellValue: string,
    ruleType: RuleType,
    message: string
  ) {
    errors.push({
      id: `${rowIndex}-${columnIndex}-${ruleType}`,
      rowIndex,
      columnName,
      columnIndex,
      cellValue,
      ruleType,
      message
    })
    invalidRowSet.add(rowIndex)
    errorsByColumn[columnName] = (errorsByColumn[columnName] || 0) + 1
    errorsByRule[ruleType] = (errorsByRule[ruleType] || 0) + 1
  }

  // Row by row validation
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    const rowNumber = r + 1

    for (let c = 0; c < headers.length; c++) {
      const rule = ruleMap.get(c)
      if (!rule) continue

      const rawCell = row[c] ?? ''
      const cell = rawCell.trim()
      const colName = headers[c]

      // 1. Required Check
      if (rule.required && cell === '') {
        addError(rowNumber, colName, c, rawCell, 'required', `Column '${colName}' is required but cell is empty.`)
        continue
      }

      // If cell is empty and not required, skip further checks
      if (cell === '') {
        continue
      }

      // 2. Disallow Null Strings check (e.g., 'NULL', 'N/A', 'none', 'undefined', '-')
      if (rule.disallowNullStrings && DISALLOWED_NULL_STRINGS.has(cell.toLowerCase())) {
        addError(rowNumber, colName, c, cell, 'null_string', `Literal null placeholder "${cell}" is not permitted in '${colName}'.`)
      }

      // 3. Trim Check (flags accidental leading/trailing whitespace)
      if (rule.trimCheck && rawCell !== cell) {
        addError(rowNumber, colName, c, rawCell, 'trim', `Cell contains un-trimmed leading or trailing whitespace.`)
      }

      // 4. Case constraints
      if (rule.uppercaseOnly && cell !== cell.toUpperCase() && /[a-z]/.test(cell)) {
        addError(rowNumber, colName, c, cell, 'uppercase', `Value must be entirely uppercase.`)
      }
      if (rule.lowercaseOnly && cell !== cell.toLowerCase() && /[A-Z]/.test(cell)) {
        addError(rowNumber, colName, c, cell, 'lowercase', `Value must be entirely lowercase.`)
      }

      // 5. Text Prefixes and Suffixes
      if (rule.startsWith && !cell.startsWith(rule.startsWith)) {
        addError(rowNumber, colName, c, cell, 'starts_with', `Value must start with prefix "${rule.startsWith}".`)
      }
      if (rule.endsWith && !cell.endsWith(rule.endsWith)) {
        addError(rowNumber, colName, c, cell, 'ends_with', `Value must end with suffix "${rule.endsWith}".`)
      }

      // 6. Substring Inclusions and Exclusions
      if (rule.contains && !cell.includes(rule.contains)) {
        addError(rowNumber, colName, c, cell, 'contains', `Value must contain required substring "${rule.contains}".`)
      }
      if (rule.notContains && cell.includes(rule.notContains)) {
        addError(rowNumber, colName, c, cell, 'not_contains', `Value contains forbidden substring "${rule.notContains}".`)
      }

      // 7. Length Constraints
      if (rule.exactLength !== undefined && cell.length !== rule.exactLength) {
        addError(rowNumber, colName, c, cell, 'exact_length', `Length (${cell.length}) must be exactly ${rule.exactLength} characters.`)
      }
      if (rule.minLength !== undefined && cell.length < rule.minLength) {
        addError(rowNumber, colName, c, cell, 'length', `Length (${cell.length}) is shorter than minimum (${rule.minLength}).`)
      }
      if (rule.maxLength !== undefined && cell.length > rule.maxLength) {
        addError(rowNumber, colName, c, cell, 'length', `Length (${cell.length}) exceeds maximum (${rule.maxLength}).`)
      }

      // 8. Word Count Constraints
      if (rule.minWords !== undefined || rule.maxWords !== undefined) {
        const words = cell.split(/\s+/).filter(Boolean)
        if (rule.minWords !== undefined && words.length < rule.minWords) {
          addError(rowNumber, colName, c, cell, 'word_count', `Word count (${words.length}) is below minimum (${rule.minWords}).`)
        }
        if (rule.maxWords !== undefined && words.length > rule.maxWords) {
          addError(rowNumber, colName, c, cell, 'word_count', `Word count (${words.length}) exceeds maximum (${rule.maxWords}).`)
        }
      }

      // 9. Data Type Check (20+ types supported)
      if (rule.dataType !== 'any' && rule.dataType !== 'string') {
        let typeValid = true
        let typeErrorMsg = ''

        switch (rule.dataType) {
          case 'integer':
            if (!/^-?\d+$/.test(cell)) {
              typeValid = false
              typeErrorMsg = `Expected integer, received "${cell}".`
            }
            break
          case 'number':
            if (isNaN(Number(cell))) {
              typeValid = false
              typeErrorMsg = `Expected valid numeric value, received "${cell}".`
            }
            break
          case 'boolean':
            if (!/^(true|false|1|0|yes|no)$/i.test(cell)) {
              typeValid = false
              typeErrorMsg = `Expected boolean (true/false/yes/no/1/0), received "${cell}".`
            }
            break
          case 'email':
            if (!EMAIL_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid email address format "${cell}".`
            }
            break
          case 'uuid':
            if (!UUID_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid UUID format "${cell}".`
            }
            break
          case 'url':
            try {
              const u = new URL(cell)
              if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                typeValid = false
                typeErrorMsg = `URL must use http or https protocol.`
              }
            } catch {
              typeValid = false
              typeErrorMsg = `Invalid URL format "${cell}".`
            }
            break
          case 'ipv4':
            if (!IPV4_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid IPv4 address format "${cell}".`
            }
            break
          case 'ipv6':
            if (!IPV6_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid IPv6 address format "${cell}".`
            }
            break
          case 'phone':
            if (!PHONE_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid phone number format "${cell}".`
            }
            break
          case 'alphanumeric':
            if (!ALPHANUMERIC_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Value must contain only letters and digits without symbols or spaces.`
            }
            break
          case 'alphabetical':
            if (!ALPHABETICAL_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Value must contain only letters and spaces.`
            }
            break
          case 'json':
            try {
              JSON.parse(cell)
            } catch {
              typeValid = false
              typeErrorMsg = `Invalid JSON string in cell.`
            }
            break
          case 'hex_color':
            if (!HEX_COLOR_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Expected hex color (e.g. #fff, #3b82f6), received "${cell}".`
            }
            break
          case 'semver':
            if (!SEMVER_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Expected valid SemVer format (e.g. 1.2.3, v2.0.0-beta), received "${cell}".`
            }
            break
          case 'credit_card':
            if (!isValidLuhn(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid credit card number (failed Luhn checksum).`
            }
            break
          case 'mac_address':
            if (!MAC_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid MAC address format (e.g. 00:1A:2B:3C:4D:5E).`
            }
            break
          case 'base64':
            if (!BASE64_REGEX.test(cell) || cell.length % 4 !== 0) {
              typeValid = false
              typeErrorMsg = `Invalid Base64 encoded string.`
            }
            break
          case 'slug':
            if (!SLUG_REGEX.test(cell)) {
              typeValid = false
              typeErrorMsg = `Invalid URL slug format (must be lowercase alphanumeric with hyphens).`
            }
            break
          case 'date': {
            const parsed = Date.parse(cell)
            if (isNaN(parsed)) {
              typeValid = false
              typeErrorMsg = `Invalid date format "${cell}".`
            }
            break
          }
        }

        if (!typeValid) {
          addError(rowNumber, colName, c, cell, 'type', typeErrorMsg)
        }
      }

      // 10. Numeric Range and Sign Constraints
      if (rule.dataType === 'number' || rule.dataType === 'integer') {
        const numVal = Number(cell)
        if (!isNaN(numVal)) {
          if (rule.positiveOnly && numVal <= 0) {
            addError(rowNumber, colName, c, cell, 'positive', `Value ${numVal} must be strictly greater than 0.`)
          }
          if (rule.nonNegativeOnly && numVal < 0) {
            addError(rowNumber, colName, c, cell, 'non_negative', `Value ${numVal} cannot be negative.`)
          }
          if (rule.min !== undefined && numVal < rule.min) {
            addError(rowNumber, colName, c, cell, 'range', `Value ${numVal} is below minimum allowed (${rule.min}).`)
          }
          if (rule.max !== undefined && numVal > rule.max) {
            addError(rowNumber, colName, c, cell, 'range', `Value ${numVal} exceeds maximum allowed (${rule.max}).`)
          }
        }
      }

      // 11. Date Chronology Checks
      if (rule.dataType === 'date' || rule.dateAfter || rule.dateBefore) {
        const cellDate = Date.parse(cell)
        if (!isNaN(cellDate)) {
          if (rule.dateAfter) {
            const minDate = Date.parse(rule.dateAfter)
            if (!isNaN(minDate) && cellDate <= minDate) {
              addError(rowNumber, colName, c, cell, 'date_after', `Date must be after ${rule.dateAfter}.`)
            }
          }
          if (rule.dateBefore) {
            const maxDate = Date.parse(rule.dateBefore)
            if (!isNaN(maxDate) && cellDate >= maxDate) {
              addError(rowNumber, colName, c, cell, 'date_before', `Date must be before ${rule.dateBefore}.`)
            }
          }
        }
      }

      // 12. Regex Pattern Check
      const compiledRegex = compiledPatterns.get(c)
      if (compiledRegex && !compiledRegex.test(cell)) {
        addError(rowNumber, colName, c, cell, 'pattern', `Value "${cell}" does not match pattern /${rule.pattern}/.`)
      }

      // 13. Allowed Values (Enum / Whitelist)
      if (rule.allowedValues && rule.allowedValues.length > 0) {
        const allowedSet = new Set(rule.allowedValues.map(v => v.trim().toLowerCase()))
        if (!allowedSet.has(cell.toLowerCase())) {
          addError(
            rowNumber,
            colName,
            c,
            cell,
            'enum',
            `Value "${cell}" is not in allowed list [${rule.allowedValues.join(', ')}].`
          )
        }
      }

      // 14. Forbidden Values (Blacklist)
      if (rule.forbiddenValues && rule.forbiddenValues.length > 0) {
        const forbiddenSet = new Set(rule.forbiddenValues.map(v => v.trim().toLowerCase()))
        if (forbiddenSet.has(cell.toLowerCase())) {
          addError(
            rowNumber,
            colName,
            c,
            cell,
            'forbidden',
            `Value "${cell}" is explicitly in the forbidden values list.`
          )
        }
      }

      // 15. Track for Uniqueness Check
      if (rule.unique) {
        const tracker = uniqueTrackers.get(c)!
        const prevCount = tracker.get(cell) || 0
        tracker.set(cell, prevCount + 1)
      }
    }
  }

  // Second pass: Unique constraint check
  if (uniqueTrackers.size > 0) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]
      const rowNumber = r + 1

      for (const [colIdx, tracker] of uniqueTrackers.entries()) {
        const cell = (row[colIdx] ?? '').trim()
        if (cell !== '' && (tracker.get(cell) || 0) > 1) {
          const colName = headers[colIdx]
          addError(
            rowNumber,
            colName,
            colIdx,
            cell,
            'unique',
            `Duplicate value "${cell}" found in unique column '${colName}'.`
          )
        }
      }
    }
  }

  const executionTimeMs = Math.round(performance.now() - startTime)
  const totalRows = rows.length
  const invalidRows = invalidRowSet.size
  const validRows = Math.max(0, totalRows - invalidRows)

  return {
    errors,
    summary: {
      totalRows,
      validRows,
      invalidRows,
      totalErrors: errors.length,
      errorsByColumn,
      errorsByRule,
      executionTimeMs
    }
  }
}

export function exportErrorsToCsv(errors: ValidationError[]): string {
  const rows = errors.map(e => ({
    'Row Number': e.rowIndex,
    'Column Name': e.columnName,
    'Cell Value': e.cellValue,
    'Rule Type': e.ruleType,
    'Violation Message': e.message
  }))
  return Papa.unparse(rows)
}

export function exportRowsToCsv(
  headers: string[],
  rows: string[][],
  rowIndices: number[], // 1-based indices
  delimiter = ','
): string {
  const filtered = rowIndices
    .map(idx => rows[idx - 1])
    .filter(Boolean)

  return Papa.unparse(
    {
      fields: headers,
      data: filtered
    },
    { delimiter }
  )
}

export const SAMPLE_CSV_DATA = `id,customer_name,email,age,membership,total_spend,website,ip_address,status,signup_date
USR-101,Amina Sharma,amina.sharma@example.com,29,Gold,450.50,https://amina.dev,192.168.1.10,active,2024-03-15
USR-102,Liam Vance,liam.vance-not-an-email,17,Silver,120.00,ftp://invalid-url,999.999.999.999,pending,2024-06-20
USR-103,Sofia Chen,sofia.chen@example.org,34,Platinum,1850.75,https://sofiachen.io,10.0.0.5,active,2023-11-01
USR-104,,marcus.ross@sample.io,42,Bronze,-15.00,https://marcus.me,172.16.0.42,active,2024-01-10
USR-105,Devon Patel,devon.patel@example.com,22,Gold,310.20,https://devon.tech,192.168.1.15,unknown_status,2025-02-14
USR-101,Duplicate User,duplicate@example.com,38,Bronze,89.00,https://dup.com,192.168.1.20,active,2024-05-01
USR-106,Elena Rostova,elena.rostova@domain.com,145,Diamond,9500.00,https://elena.com,192.168.1.25,suspended,1999-01-01`

export const SAMPLE_RULES: ColumnRule[] = [
  {
    columnName: 'id',
    dataType: 'string',
    required: true,
    unique: true,
    pattern: '^USR-\\d{3}$',
    disallowNullStrings: true
  },
  {
    columnName: 'customer_name',
    dataType: 'alphabetical',
    required: true,
    unique: false,
    minLength: 2,
    maxLength: 50,
    trimCheck: true,
    disallowNullStrings: true
  },
  {
    columnName: 'email',
    dataType: 'email',
    required: true,
    unique: false,
    disallowNullStrings: true
  },
  {
    columnName: 'age',
    dataType: 'integer',
    required: true,
    unique: false,
    min: 18,
    max: 100,
    positiveOnly: true
  },
  {
    columnName: 'membership',
    dataType: 'string',
    required: true,
    unique: false,
    allowedValues: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    forbiddenValues: ['Diamond', 'VIP']
  },
  {
    columnName: 'total_spend',
    dataType: 'number',
    required: true,
    unique: false,
    min: 0,
    nonNegativeOnly: true
  },
  {
    columnName: 'website',
    dataType: 'url',
    required: false,
    unique: false
  },
  {
    columnName: 'ip_address',
    dataType: 'ipv4',
    required: false,
    unique: false
  },
  {
    columnName: 'status',
    dataType: 'string',
    required: true,
    unique: false,
    lowercaseOnly: true,
    allowedValues: ['active', 'pending', 'suspended']
  },
  {
    columnName: 'signup_date',
    dataType: 'date',
    required: true,
    unique: false,
    dateAfter: '2020-01-01'
  }
]
