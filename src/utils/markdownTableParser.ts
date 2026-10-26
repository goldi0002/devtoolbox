type MarkdownTableValue = string | number | boolean | null
export type MarkdownTableRow = Record<string, MarkdownTableValue>

function splitRow(row: string): string[] {
  const cells: string[] = []
  let cell = ''
  let escaped = false

  for (const character of row.trim()) {
    if (escaped) {
      cell += character
      escaped = false
    } else if (character === '\\') {
      escaped = true
    } else if (character === '|') {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += character
    }
  }

  if (escaped) cell += '\\'
  cells.push(cell.trim())

  if (row.trimStart().startsWith('|')) cells.shift()
  if (row.trimEnd().endsWith('|') && !row.trimEnd().endsWith('\\|')) cells.pop()

  return cells
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function toValue(value: string): MarkdownTableValue {
  const normalized = value.trim()
  if (/^true$/i.test(normalized)) return true
  if (/^false$/i.test(normalized)) return false
  if (/^null$/i.test(normalized)) return null

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(normalized)) {
    const number = Number(normalized)
    if (Number.isFinite(number)) return number
  }

  return value
}

export function parseMarkdownTable(markdown: string): MarkdownTableRow[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')

  for (let index = 0; index < lines.length - 1; index += 1) {
    const headers = splitRow(lines[index])
    const separators = splitRow(lines[index + 1])
    if (!isSeparatorRow(separators) || headers.length !== separators.length) continue

    const rows: MarkdownTableRow[] = []
    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const line = lines[rowIndex].trim()
      if (!line) break

      const cells = splitRow(line)
      if (cells.length === 1 && !line.includes('|')) break

      const row: MarkdownTableRow = {}
      headers.forEach((header, columnIndex) => {
        row[header] = toValue(cells[columnIndex] ?? '')
      })
      rows.push(row)
    }

    return rows
  }

  throw new Error('No valid Markdown table with a header and separator row was found.')
}