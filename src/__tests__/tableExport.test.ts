import { describe, it, expect } from 'vitest'
import { escapeHtml, tableToHtml, tableToMarkdown } from '../utils/tableExport'

describe('tableToMarkdown', () => {
  it('renders a GitHub-flavored Markdown table in header and row order', () => {
    expect(tableToMarkdown(['id', 'name'], [['2', 'Bob'], ['1', 'Ann']])).toBe(
      ['| id | name |', '| --- | --- |', '| 2 | Bob |', '| 1 | Ann |'].join('\n'),
    )
  })

  it('escapes pipes and backslashes and turns line breaks into <br>', () => {
    expect(tableToMarkdown(['a'], [['x | y'], ['C:\\path'], ['line1\nline2']]).split('\n').slice(2)).toEqual([
      '| x \\| y |',
      '| C:\\\\path |',
      '| line1<br>line2 |',
    ])
  })

  it('pads short rows and trims long rows to the header width', () => {
    expect(tableToMarkdown(['a', 'b'], [['1'], ['1', '2', '3']]).split('\n').slice(2)).toEqual(['| 1 |  |', '| 1 | 2 |'])
  })

  it('returns only the header rows when there are no data rows', () => {
    expect(tableToMarkdown(['a'], [])).toBe('| a |\n| --- |')
  })

  it('returns an empty string without headers', () => {
    expect(tableToMarkdown([], [['1']])).toBe('')
  })
})

describe('tableToHtml', () => {
  it('renders thead and tbody in order', () => {
    expect(tableToHtml(['id', 'name'], [['1', 'Ann']])).toBe(
      [
        '<table>',
        '  <thead>',
        '    <tr><th>id</th><th>name</th></tr>',
        '  </thead>',
        '  <tbody>',
        '    <tr><td>1</td><td>Ann</td></tr>',
        '  </tbody>',
        '</table>',
      ].join('\n'),
    )
  })

  it('escapes HTML in headers and cells', () => {
    const html = tableToHtml(['<b>'], [['<script>alert("x")</script>'], ["Tom & Jerry's"]])
    expect(html).toContain('<th>&lt;b&gt;</th>')
    expect(html).toContain('<td>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</td>')
    expect(html).toContain('<td>Tom &amp; Jerry&#39;s</td>')
    expect(html).not.toContain('<script>')
  })

  it('fits rows to the header width and handles no rows', () => {
    expect(tableToHtml(['a', 'b'], [['1']])).toContain('<tr><td>1</td><td></td></tr>')
    expect(tableToHtml(['a'], [])).toContain('<tbody>\n  </tbody>')
    expect(tableToHtml([], [])).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;')
  })
})
