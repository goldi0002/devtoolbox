import { describe, it, expect } from 'vitest'
import { getToolBySlug } from '../tools/registry'
import {
  detectDelimiter,
  inferColumnType,
  generateDefaultRules,
  parseDelimitedData,
  validateDelimitedData,
  exportErrorsToCsv,
  exportRowsToCsv,
  ColumnRule
} from '../utils/csvValidatorEngine'

describe('CSV Validator Metadata & Registry', () => {
  it('registers csv-validator properly in tool registry', () => {
    const meta = getToolBySlug('csv-validator')
    expect(meta).toBeDefined()
    expect(meta?.slug).toBe('csv-validator')
    expect(meta?.name).toContain('Delimited File Data Validator')
    expect(meta?.category).toBe('data-tools')
    expect(meta?.status).toBe('stable')
    expect(meta?.toolComponent).toBeDefined()
    expect(meta?.about.features.length).toBeGreaterThan(3)
  })
})

describe('CSV Validator Engine - Parsing & Inference', () => {
  it('detects delimiters accurately', () => {
    expect(detectDelimiter('a,b,c\n1,2,3\n4,5,6')).toBe(',')
    expect(detectDelimiter('a\tb\tc\n1\t2\t3\n4\t5\t6')).toBe('\t')
    expect(detectDelimiter('a|b|c\n1|2|3\n4|5|6')).toBe('|')
    expect(detectDelimiter('a;b;c\n1;2;3\n4;5;6')).toBe(';')
  })

  it('infers data types from sample values', () => {
    expect(inferColumnType(['123', '456', '-789'])).toBe('integer')
    expect(inferColumnType(['12.34', '56.78', '90'])).toBe('number')
    expect(inferColumnType(['true', 'false', 'true'])).toBe('boolean')
    expect(inferColumnType(['user@example.com', 'admin@domain.org'])).toBe('email')
    expect(inferColumnType(['550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000'])).toBe('uuid')
    expect(inferColumnType(['2026-05-12', '2026-10-25'])).toBe('date')
    expect(inferColumnType(['https://example.com', 'https://api.github.com'])).toBe('url')
    expect(inferColumnType(['192.168.1.1', '10.0.0.1'])).toBe('ipv4')
    expect(inferColumnType(['1.0.0', 'v2.1.3-beta'])).toBe('semver')
    expect(inferColumnType(['#ffffff', '#0f172a'])).toBe('hex_color')
    expect(inferColumnType(['Acme Corp', 'Beta Ltd'])).toBe('string')
  })

  it('generates default rules for detected headers', () => {
    const headers = ['id', 'email', 'notes']
    const sampleRows = [
      ['USR-1', 'test@test.com', 'hello'],
      ['USR-2', 'user@domain.com', '']
    ]
    const rules = generateDefaultRules(headers, sampleRows)
    expect(rules).toHaveLength(3)
    expect(rules[0].columnName).toBe('id')
    expect(rules[0].unique).toBe(true)
    expect(rules[1].columnName).toBe('email')
    expect(rules[1].dataType).toBe('email')
  })

  it('parses delimited data into headers and rows', () => {
    const raw = 'name,age,active\nAlice,30,true\nBob,25,false'
    const result = parseDelimitedData(raw, ',')
    expect(result.headers).toEqual(['name', 'age', 'active'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual(['Alice', '30', 'true'])
  })
})

describe('CSV Validator Engine - 20+ Rule Type Validations', () => {
  // 1. Required Check
  it('Rule 1: flags empty cells when required: true', () => {
    const headers = ['id', 'name']
    const rows = [['1', 'Alice'], ['2', '']]
    const rules: ColumnRule[] = [
      { columnName: 'id', dataType: 'string', required: true, unique: false },
      { columnName: 'name', dataType: 'string', required: true, unique: false }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    expect(errors.some(e => e.ruleType === 'required')).toBe(true)
  })

  // 2. Disallow Null Strings
  it('Rule 2: flags literal null/NA strings when disallowNullStrings: true', () => {
    const headers = ['status']
    const rows = [['NULL'], ['N/A'], ['valid']]
    const rules: ColumnRule[] = [
      { columnName: 'status', dataType: 'string', required: false, unique: false, disallowNullStrings: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const nullErrors = errors.filter(e => e.ruleType === 'null_string')
    expect(nullErrors).toHaveLength(2)
  })

  // 3. Trim Check
  it('Rule 3: flags un-trimmed leading or trailing whitespace', () => {
    const headers = ['username']
    const rows = [[' alice '], ['bob'], ['charlie ']]
    const rules: ColumnRule[] = [
      { columnName: 'username', dataType: 'string', required: false, unique: false, trimCheck: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const trimErrors = errors.filter(e => e.ruleType === 'trim')
    expect(trimErrors).toHaveLength(2)
  })

  // 4. Uppercase Only
  it('Rule 4: enforces all uppercase strings', () => {
    const headers = ['code']
    const rows = [['USA'], ['gbR'], ['CAN']]
    const rules: ColumnRule[] = [
      { columnName: 'code', dataType: 'string', required: false, unique: false, uppercaseOnly: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'uppercase')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('gbR')
  })

  // 5. Lowercase Only
  it('Rule 5: enforces all lowercase strings', () => {
    const headers = ['tag']
    const rows = [['frontend'], ['Backend'], ['devops']]
    const rules: ColumnRule[] = [
      { columnName: 'tag', dataType: 'string', required: false, unique: false, lowercaseOnly: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'lowercase')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('Backend')
  })

  // 6. Starts With Prefix
  it('Rule 6: validates startsWith prefix constraint', () => {
    const headers = ['sku']
    const rows = [['PROD-101'], ['ITEM-202'], ['PROD-303']]
    const rules: ColumnRule[] = [
      { columnName: 'sku', dataType: 'string', required: false, unique: false, startsWith: 'PROD-' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'starts_with')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('ITEM-202')
  })

  // 7. Ends With Suffix
  it('Rule 7: validates endsWith suffix constraint', () => {
    const headers = ['filename']
    const rows = [['report.csv'], ['data.json'], ['backup.csv']]
    const rules: ColumnRule[] = [
      { columnName: 'filename', dataType: 'string', required: false, unique: false, endsWith: '.csv' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'ends_with')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('data.json')
  })

  // 8. Contains Substring
  it('Rule 8: validates must contain substring', () => {
    const headers = ['email']
    const rows = [['alice@acme.com'], ['bob@other.org'], ['carol@acme.com']]
    const rules: ColumnRule[] = [
      { columnName: 'email', dataType: 'string', required: false, unique: false, contains: '@acme.com' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'contains')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('bob@other.org')
  })

  // 9. Does Not Contain (notContains)
  it('Rule 9: validates forbidden substring exclusion', () => {
    const headers = ['memo']
    const rows = [['Quarterly review'], ['CONFIDENTIAL draft'], ['Public report']]
    const rules: ColumnRule[] = [
      { columnName: 'memo', dataType: 'string', required: false, unique: false, notContains: 'CONFIDENTIAL' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'not_contains')
    expect(errs).toHaveLength(1)
  })

  // 10. Exact Length
  it('Rule 10: validates exact string character length', () => {
    const headers = ['pin']
    const rows = [['1234'], ['123'], ['12345']]
    const rules: ColumnRule[] = [
      { columnName: 'pin', dataType: 'string', required: false, unique: false, exactLength: 4 }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'exact_length')
    expect(errs).toHaveLength(2)
  })

  // 11. Min and Max Length
  it('Rule 11: validates minLength and maxLength', () => {
    const headers = ['username']
    const rows = [['a'], ['validUser'], ['thisUsernameIsWayTooLongForOurDatabase']]
    const rules: ColumnRule[] = [
      { columnName: 'username', dataType: 'string', required: false, unique: false, minLength: 3, maxLength: 15 }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'length')
    expect(errs).toHaveLength(2)
  })

  // 12. Word Count Limits
  it('Rule 12: validates word count bounds', () => {
    const headers = ['headline']
    const rows = [['SingleWord'], ['Two words here today'], ['One two three four five six seven eight nine ten eleven']]
    const rules: ColumnRule[] = [
      { columnName: 'headline', dataType: 'string', required: false, unique: false, minWords: 2, maxWords: 5 }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'word_count')
    expect(errs).toHaveLength(2)
  })

  // 13. Numeric Min and Max Range
  it('Rule 13: validates numeric min and max bounds', () => {
    const headers = ['percentage']
    const rows = [['-5'], ['50'], ['105']]
    const rules: ColumnRule[] = [
      { columnName: 'percentage', dataType: 'number', required: false, unique: false, min: 0, max: 100 }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'range')
    expect(errs).toHaveLength(2)
  })

  // 14. Positive Only (> 0)
  it('Rule 14: validates positive only (> 0)', () => {
    const headers = ['quantity']
    const rows = [['0'], ['5'], ['-2']]
    const rules: ColumnRule[] = [
      { columnName: 'quantity', dataType: 'integer', required: false, unique: false, positiveOnly: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'positive')
    expect(errs).toHaveLength(2)
  })

  // 15. Non-Negative Only (>= 0)
  it('Rule 15: validates non-negative numbers (>= 0)', () => {
    const headers = ['balance']
    const rows = [['0'], ['100'], ['-0.01']]
    const rules: ColumnRule[] = [
      { columnName: 'balance', dataType: 'number', required: false, unique: false, nonNegativeOnly: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'non_negative')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('-0.01')
  })

  // 16. Date After
  it('Rule 16: validates chronological dateAfter bound', () => {
    const headers = ['event_date']
    const rows = [['2025-01-01'], ['2019-12-31']]
    const rules: ColumnRule[] = [
      { columnName: 'event_date', dataType: 'date', required: false, unique: false, dateAfter: '2020-01-01' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'date_after')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('2019-12-31')
  })

  // 17. Date Before
  it('Rule 17: validates chronological dateBefore bound', () => {
    const headers = ['dob']
    const rows = [['1995-04-12'], ['2035-08-20']]
    const rules: ColumnRule[] = [
      { columnName: 'dob', dataType: 'date', required: false, unique: false, dateBefore: '2026-01-01' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'date_before')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('2035-08-20')
  })

  // 18. Regex Pattern
  it('Rule 18: validates custom regex patterns', () => {
    const headers = ['postal']
    const rows = [['12345'], ['90210-1234'], ['INVALID']]
    const rules: ColumnRule[] = [
      { columnName: 'postal', dataType: 'string', required: false, unique: false, pattern: '^\\d{5}(-\\d{4})?$' }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'pattern')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('INVALID')
  })

  // 19. Allowed Values (Enum Whitelist)
  it('Rule 19: validates allowed values whitelist', () => {
    const headers = ['priority']
    const rows = [['low'], ['critical'], ['unknown_priority']]
    const rules: ColumnRule[] = [
      { columnName: 'priority', dataType: 'string', required: false, unique: false, allowedValues: ['low', 'medium', 'high', 'critical'] }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'enum')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('unknown_priority')
  })

  // 20. Forbidden Values (Blacklist)
  it('Rule 20: validates forbidden values blacklist', () => {
    const headers = ['role']
    const rows = [['guest'], ['superuser'], ['editor']]
    const rules: ColumnRule[] = [
      { columnName: 'role', dataType: 'string', required: false, unique: false, forbiddenValues: ['superuser', 'root'] }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'forbidden')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('superuser')
  })

  // 21. Unique Constraint
  it('Rule 21: validates unique column constraint', () => {
    const headers = ['id']
    const rows = [['A1'], ['A2'], ['A1']]
    const rules: ColumnRule[] = [
      { columnName: 'id', dataType: 'string', required: false, unique: true }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'unique')
    expect(errs).toHaveLength(2)
  })

  // 22. URL Validation
  it('Rule 22: validates URL data type format', () => {
    const headers = ['site']
    const rows = [['https://toolbox4devs.com'], ['not-a-valid-url'], ['http://localhost:3000']]
    const rules: ColumnRule[] = [
      { columnName: 'site', dataType: 'url', required: false, unique: false }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'type')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('not-a-valid-url')
  })

  // 23. IPv4 Validation
  it('Rule 23: validates IPv4 data type format', () => {
    const headers = ['ip']
    const rows = [['127.0.0.1'], ['999.999.999.999'], ['10.0.0.255']]
    const rules: ColumnRule[] = [
      { columnName: 'ip', dataType: 'ipv4', required: false, unique: false }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'type')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('999.999.999.999')
  })

  // 24. SemVer Validation
  it('Rule 24: validates Semantic Versioning format', () => {
    const headers = ['version']
    const rows = [['1.0.0'], ['v2.1.0-alpha.1'], ['not_semver']]
    const rules: ColumnRule[] = [
      { columnName: 'version', dataType: 'semver', required: false, unique: false }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'type')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('not_semver')
  })

  // 25. Credit Card Luhn Algorithm Validation
  it('Rule 25: validates credit card Luhn checksum', () => {
    const headers = ['card']
    // 4532015112830366 is a valid test Visa card number; 4532015112830367 fails Luhn
    const rows = [['4532015112830366'], ['4532015112830367']]
    const rules: ColumnRule[] = [
      { columnName: 'card', dataType: 'credit_card', required: false, unique: false }
    ]
    const { errors } = validateDelimitedData(headers, rows, rules)
    const errs = errors.filter(e => e.ruleType === 'type')
    expect(errs).toHaveLength(1)
    expect(errs[0].cellValue).toBe('4532015112830367')
  })
})
