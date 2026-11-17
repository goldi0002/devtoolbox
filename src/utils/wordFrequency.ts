// Pure word and character frequency analysis. Everything here runs in the browser.

export interface FrequencyOptions {
  /** Count "The" and "the" as the same item (lowercases words and characters). */
  ignoreCase: boolean
  /** Leave common English stop words out of the word table and its totals. */
  ignoreStopWords: boolean
}

export interface FrequencyRow {
  /** Normalised key used for counting (e.g. the lowercased word, or the raw character). */
  key: string
  /** Text shown in the table. Differs from `key` only for non-printing characters. */
  label: string
  count: number
  /** Share of the table total, 0–100, unrounded. */
  percent: number
}

export interface FrequencyTable {
  /** Rows sorted by count (descending), then alphabetically by label. */
  rows: FrequencyRow[]
  /** Sum of all counts in the table. */
  total: number
  /** Number of distinct items in the table. */
  unique: number
}

export interface FrequencyAnalysis {
  words: FrequencyTable
  characters: FrequencyTable
  /** Words dropped because they are stop words (0 when the option is off). */
  stopWordsRemoved: number
}

export const STOP_WORDS: ReadonlySet<string> = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves',
])

/**
 * A word is a run of Unicode letters or numbers. An apostrophe (straight or curly) is kept
 * when it sits between two such runs, so "don't" stays one word.
 */
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu

const NAMED_CHARACTERS: ReadonlyMap<string, string> = new Map([
  [' ', 'Space'],
  ['\n', 'Newline'],
  ['\t', 'Tab'],
  ['\r', 'Carriage return'],
  [' ', 'No-break space'],
])

/** Split text into words. Curly apostrophes are normalised to straight ones so they group together. */
export function extractWords(text: string): string[] {
  const matches = text.match(WORD_PATTERN) ?? []
  return matches.map(word => word.replace(/’/g, "'"))
}

export function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase())
}

/** Human-readable name for one character. Printing characters are returned unchanged. */
export function describeCharacter(ch: string): string {
  const named = NAMED_CHARACTERS.get(ch)
  if (named) return named
  if (/[\p{C}\s]/u.test(ch)) {
    const hex = (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')
    return `U+${hex}`
  }
  return ch
}

function compareText(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function buildTable(counts: Map<string, number>, labelFor: (key: string) => string): FrequencyTable {
  let total = 0
  for (const count of counts.values()) total += count
  const rows: FrequencyRow[] = Array.from(counts, ([key, count]) => ({
    key,
    label: labelFor(key),
    count,
    percent: total === 0 ? 0 : (count / total) * 100,
  }))
  return { rows: sortRows(rows, 'count', 'desc'), total, unique: counts.size }
}

export function analyzeFrequency(text: string, options: FrequencyOptions): FrequencyAnalysis {
  const wordCounts = new Map<string, number>()
  let stopWordsRemoved = 0
  for (const raw of extractWords(text)) {
    if (options.ignoreStopWords && isStopWord(raw)) {
      stopWordsRemoved += 1
      continue
    }
    const key = options.ignoreCase ? raw.toLowerCase() : raw
    wordCounts.set(key, (wordCounts.get(key) ?? 0) + 1)
  }

  const charCounts = new Map<string, number>()
  // Array.from walks code points, so an emoji or accented letter written as one character counts once.
  for (const raw of Array.from(text)) {
    const key = options.ignoreCase ? raw.toLowerCase() : raw
    charCounts.set(key, (charCounts.get(key) ?? 0) + 1)
  }

  return {
    words: buildTable(wordCounts, key => key),
    characters: buildTable(charCounts, describeCharacter),
    stopWordsRemoved,
  }
}

export type SortKey = 'label' | 'count' | 'percent'
export type SortDirection = 'asc' | 'desc'

/**
 * Sort rows by a column. Equal values fall back to alphabetical order by label, so the result is deterministic.
 * Returns a new array.
 */
export function sortRows(rows: readonly FrequencyRow[], key: SortKey, direction: SortDirection): FrequencyRow[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const primary = key === 'label' ? compareText(a.label, b.label) : a[key] - b[key]
    if (primary !== 0) return sign * primary
    return compareText(a.label, b.label)
  })
}

export const TOP_N_OPTIONS = [10, 25, 50, 100, 'all'] as const
export type TopN = (typeof TOP_N_OPTIONS)[number]

export function limitRows(rows: readonly FrequencyRow[], limit: TopN): FrequencyRow[] {
  return limit === 'all' ? [...rows] : rows.slice(0, limit)
}

export function formatPercent(percent: number): string {
  return `${percent.toFixed(2)}%`
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** CSV with a header row. Columns: the item, its count and its percentage (no % sign). */
export function toCsv(rows: readonly FrequencyRow[], itemHeader: string): string {
  const lines = [[itemHeader, 'Count', 'Percent'].join(',')]
  for (const row of rows) {
    lines.push([escapeCsv(row.label), String(row.count), row.percent.toFixed(2)].join(','))
  }
  return lines.join('\n')
}

/** Plain text, one item per line: `item: count (percent%)`. */
export function toPlainText(rows: readonly FrequencyRow[]): string {
  return rows.map(row => `${row.label}: ${row.count} (${formatPercent(row.percent)})`).join('\n')
}
