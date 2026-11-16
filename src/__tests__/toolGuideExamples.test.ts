import { describe, it, expect } from 'vitest'
import { SQL_FORMATTER_META } from '../tools/meta/sql-formatter'
import { URL_PARSER_META } from '../tools/meta/url-parser'
import { HEX_CONVERTER_META } from '../tools/meta/hex-converter'
import { formatSql } from '../utils/sqlFormatter'

// The worked examples on tool pages must match what the tools really output.
describe('tool guide examples', () => {
  it('SQL Formatter example matches the formatter with default settings', () => {
    const example = SQL_FORMATTER_META.guide!.example!
    expect(formatSql(example.input, true, 2)).toBe(example.output)
  })

  it('Hex Converter example matches UTF-8 bytes as spaced lowercase hex', () => {
    const example = HEX_CONVERTER_META.guide!.example!
    const hex = Array.from(new TextEncoder().encode(example.input), (b) => b.toString(16).padStart(2, '0')).join(' ')
    expect(hex).toBe(example.output)
  })

  it('URL Parser example lists the components the URL API returns', () => {
    const example = URL_PARSER_META.guide!.example!
    const u = new URL(example.input)
    const query = [...u.searchParams].map(([k, v]) => `${k} = ${v}`).join(', ')
    expect(example.output).toBe(
      [
        `Protocol: ${u.protocol}`,
        `Hostname: ${u.hostname}`,
        `Port: ${u.port || '443'}`,
        `Pathname: ${u.pathname}`,
        `Search: ${u.search}`,
        `Hash: ${u.hash}`,
        `Query: ${query}`,
      ].join('\n'),
    )
  })
})
