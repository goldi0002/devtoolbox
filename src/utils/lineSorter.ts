export type SortMode = 'asc' | 'desc' | 'length' | 'natural'

export interface LineSortOptions {
  mode: SortMode
  removeDuplicates: boolean
  trimLines: boolean
  removeEmpty: boolean
  caseInsensitive: boolean
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function sortLines(lines: string[], mode: SortMode, caseInsensitive: boolean): string[] {
  const sorted = [...lines]
  const collator = caseInsensitive
    ? (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())
    : (a: string, b: string) => a.localeCompare(b)

  switch (mode) {
    case 'asc':
      sorted.sort(collator)
      break
    case 'desc':
      sorted.sort((a, b) => collator(b, a))
      break
    case 'length':
      sorted.sort((a, b) => a.length - b.length || collator(a, b))
      break
    case 'natural':
      sorted.sort(naturalCompare)
      break
  }
  return sorted
}

/**
 * Cleans and sorts text one line at a time. Trimming and empty-line removal run
 * before sorting, so leading whitespace cannot push a line out of order and
 * "By Length" compares the trimmed text. Duplicates are removed after sorting,
 * keeping the first occurrence in sorted order.
 */
export function processLines(input: string, options: LineSortOptions): string {
  let lines = input.split('\n')
  if (options.trimLines) lines = lines.map((l) => l.trim())
  if (options.removeEmpty) lines = lines.filter((l) => l !== '')

  lines = sortLines(lines, options.mode, options.caseInsensitive)

  if (options.removeDuplicates) {
    const seen = new Set<string>()
    lines = lines.filter((l) => {
      const key = options.caseInsensitive ? l.toLowerCase() : l
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  return lines.join('\n')
}
