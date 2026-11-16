/** Escapes a cell for a GitHub-flavored Markdown table: pipes, backslashes and line breaks. */
function markdownCell(value: string): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r\n|\r|\n/g, '<br>')
    .trim()
}

/**
 * Renders headers and rows as a GitHub-flavored Markdown table. Rows shorter than the
 * header are padded with empty cells and longer rows are cut to the header width.
 * Returns an empty string when there are no headers.
 */
export function tableToMarkdown(headers: string[], rows: string[][]): string {
  if (!headers.length) return ''
  const width = headers.length
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`
  const fit = (row: string[]) => Array.from({ length: width }, (_, i) => markdownCell(row[i] ?? ''))
  return [
    line(headers.map(markdownCell)),
    line(headers.map(() => '---')),
    ...rows.map((row) => line(fit(row))),
  ].join('\n')
}

export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Renders headers and rows as an HTML <table> with <thead> and <tbody>, escaping
 * every cell. Rows are fitted to the header width. Returns an empty string when
 * there are no headers.
 */
export function tableToHtml(headers: string[], rows: string[][]): string {
  if (!headers.length) return ''
  const width = headers.length
  const cells = (row: string[], tag: 'th' | 'td') =>
    Array.from({ length: width }, (_, i) => `<${tag}>${escapeHtml(row[i] ?? '')}</${tag}>`).join('')
  const body = rows.map((row) => `    <tr>${cells(row, 'td')}</tr>`)
  return [
    '<table>',
    '  <thead>',
    `    <tr>${cells(headers, 'th')}</tr>`,
    '  </thead>',
    '  <tbody>',
    ...body,
    '  </tbody>',
    '</table>',
  ].join('\n')
}
