import { describe, expect, it } from 'vitest'
import { escapeString, unescapeString, type EscapeFormat } from '../utils/stringEscape'
import { STRING_ESCAPER_META } from '../tools/meta/string-escaper'

const formats: EscapeFormat[] = [
  'json',
  'javascript',
  'python',
  'java',
  'csharp',
  'sql',
  'html',
  'csv',
  'shell',
  'unicode',
]

describe('string escaping', () => {
  const stringFormats = ['json', 'javascript', 'python', 'java', 'csharp'] as const

  it.each(stringFormats)('escapes and unescapes newlines and tabs for %s', (format) => {
    const input = 'First line\nSecond\tend'
    const escaped = escapeString(input, format)

    expect(escaped).toContain('\\n')
    expect(escaped).toContain('\\t')
    expect(unescapeString(escaped, format)).toBe(input)
  })

  it.each(stringFormats)('escapes and unescapes backslashes for %s', (format) => {
    const input = 'path\\folder'
    const escaped = escapeString(input, format)

    expect(escaped).toContain('\\\\')
    expect(unescapeString(escaped, format)).toBe(input)
  })

  it.each(stringFormats)('escapes and unescapes quotes for %s', (format) => {
    const input = '"quoted text"'
    const escaped = escapeString(input, format)

    expect(escaped).toContain('\\"')
    expect(unescapeString(escaped, format)).toBe(input)
  })

  it.each(stringFormats)('preserves Unicode characters for %s', (format) => {
    const input = 'café 中文'
    const escaped = escapeString(input, format)

    expect(escaped).toContain(input)
    expect(unescapeString(escaped, format)).toBe(input)
  })

  it('encodes and decodes Unicode code points', () => {
    const input = 'café 中文'
    const escaped = escapeString(input, 'unicode')

    expect(escaped).toBe('\\u0063\\u0061\\u0066\\u00e9\\u0020\\u4e2d\\u6587')
    expect(unescapeString(escaped, 'unicode')).toBe(input)
  })

  it.each(formats)('handles an empty string with %s', (format) => {
    expect(escapeString('', format)).toBe('')
    expect(unescapeString('', format)).toBe('')
  })

  it.each(formats)('preserves ordinary text through %s escaping and unescaping', (format) => {
    const input = 'Plain text 123'

    expect(unescapeString(escapeString(input, format), format)).toBe(input)
  })
})

describe('unicode escaping outside the Basic Multilingual Plane', () => {
  const text = 'hi 😀 é 𝄞'

  it.each(['javascript', 'java', 'csharp'] as const)('%s keeps both halves of a surrogate pair', (format) => {
    const escaped = escapeString(text, format, { escapeUnicode: true })
    expect(escaped).toBe('hi \\ud83d\\ude00 \\u00e9 \\ud834\\udd1e')
    expect(unescapeString(escaped, format)).toBe(text)
  })

  it('Unicode Escape format writes every code unit and round-trips emoji', () => {
    const escaped = escapeString('a😀', 'unicode')
    expect(escaped).toBe('\\u0061\\ud83d\\ude00')
    expect(unescapeString(escaped, 'unicode')).toBe('a😀')
  })

  it('escaped emoji parse back with JSON.parse', () => {
    const escaped = escapeString('😀', 'javascript', { escapeUnicode: true })
    expect(JSON.parse(`"${escaped}"`)).toBe('😀')
  })
})

describe('String Escaper guide', () => {
  it('worked example matches JavaScript escaping with Escape Non-ASCII on', () => {
    const { input, output } = STRING_ESCAPER_META.guide!.example!
    expect(escapeString(input, 'javascript', { escapeUnicode: true })).toBe(output)
  })

  it('FAQ examples match the escaper', () => {
    expect(escapeString("O'Brien", 'sql')).toBe("O''Brien")
    expect(escapeString("it's", 'shell')).toBe("'it'\\''s'")
  })
})

