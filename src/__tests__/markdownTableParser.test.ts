import { describe, expect, it } from 'vitest'
import { parseMarkdownTable } from '../utils/markdownTableParser'

describe('parseMarkdownTable', () => {
  it('parses tables with loose spacing and optional outer pipes', () => {
    const input = `Name | Age | Active
 :--- | ---: | :---:
 Ada | 36 | true
 Linus | 0012 | false `

    expect(parseMarkdownTable(input)).toEqual([
      { Name: 'Ada', Age: 36, Active: true },
      { Name: 'Linus', Age: '0012', Active: false },
    ])
  })

  it('keeps escaped pipes inside cells and unescapes Markdown punctuation', () => {
    const input = String.raw`| Label | Notes |
| --- | --- |
| A\|B | Use \* literally |`

    expect(parseMarkdownTable(input)).toEqual([{ Label: 'A|B', Notes: 'Use * literally' }])
  })

  it('detects numeric and null values while preserving non-numeric strings', () => {
    const input = `| Value | Other |
| --- | --- |
| -2.5e2 | null |
| NaN | 001 |`

    expect(parseMarkdownTable(input)).toEqual([
      { Value: -250, Other: null },
      { Value: 'NaN', Other: '001' },
    ])
  })

  it('pads missing cells and ignores cells beyond the header count', () => {
    const input = `| Name | Count |
| --- | --- |
| Ada |
| Linus | 2 | ignored |`

    expect(parseMarkdownTable(input)).toEqual([
      { Name: 'Ada', Count: '' },
      { Name: 'Linus', Count: 2 },
    ])
  })

  it('throws when no valid table is present', () => {
    expect(() => parseMarkdownTable('just some text')).toThrow(/No valid Markdown table/)
  })
})