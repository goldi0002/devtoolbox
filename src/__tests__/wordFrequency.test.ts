import { describe, expect, it } from 'vitest'
import {
  STOP_WORDS,
  analyzeFrequency,
  describeCharacter,
  extractWords,
  formatPercent,
  isStopWord,
  limitRows,
  sortRows,
  toCsv,
  toPlainText,
  type FrequencyRow,
} from '../utils/wordFrequency'

const PLAIN = { ignoreCase: false, ignoreStopWords: false }
const FOLDED = { ignoreCase: true, ignoreStopWords: false }
const NO_STOP = { ignoreCase: true, ignoreStopWords: true }

describe('extractWords', () => {
  it('splits on whitespace and punctuation', () => {
    expect(extractWords('Hello, world! It\'s-fine.')).toEqual(['Hello', 'world', "It's", 'fine'])
  })

  it('keeps apostrophes that sit inside a word', () => {
    expect(extractWords("don't can't rock'n'roll")).toEqual(["don't", "can't", "rock'n'roll"])
  })

  it('drops leading and trailing apostrophes', () => {
    expect(extractWords("'quoted' 'tis")).toEqual(['quoted', 'tis'])
  })

  it('normalises curly apostrophes to straight ones so they group together', () => {
    expect(extractWords('don’t don\'t')).toEqual(["don't", "don't"])
  })

  it('treats accented Latin letters as word characters', () => {
    expect(extractWords('café naïve Ñandú')).toEqual(['café', 'naïve', 'Ñandú'])
  })

  it('handles non-Latin scripts', () => {
    expect(extractWords('привет мир 你好 世界 مرحبا')).toEqual(['привет', 'мир', '你好', '世界', 'مرحبا'])
  })

  it('counts numbers as words', () => {
    expect(extractWords('v2 released in 2026, 3.5 stars')).toEqual(['v2', 'released', 'in', '2026', '3', '5', 'stars'])
  })

  it('returns an empty list for empty or symbol-only input', () => {
    expect(extractWords('')).toEqual([])
    expect(extractWords('--- ... !!!')).toEqual([])
  })
})

describe('STOP_WORDS', () => {
  it('contains common English function words', () => {
    for (const word of ['the', 'a', 'an', 'is', 'and', 'of', 'to', 'in', 'it']) {
      expect(STOP_WORDS.has(word)).toBe(true)
    }
  })

  it('does not contain content words', () => {
    for (const word of ['code', 'tool', 'browser', 'frequency', 'json']) {
      expect(STOP_WORDS.has(word)).toBe(false)
    }
  })

  it('is lowercase only', () => {
    for (const word of STOP_WORDS) expect(word).toBe(word.toLowerCase())
  })

  it('matches regardless of case', () => {
    expect(isStopWord('The')).toBe(true)
    expect(isStopWord('IS')).toBe(true)
    expect(isStopWord('developer')).toBe(false)
  })
})

describe('analyzeFrequency: words', () => {
  it('counts words and sorts by count descending', () => {
    const { words } = analyzeFrequency('apple banana apple cherry apple banana', PLAIN)
    expect(words.rows.map(r => [r.label, r.count])).toEqual([
      ['apple', 3],
      ['banana', 2],
      ['cherry', 1],
    ])
    expect(words.total).toBe(6)
    expect(words.unique).toBe(3)
  })

  it('breaks count ties alphabetically', () => {
    const { words } = analyzeFrequency('pear apple mango', PLAIN)
    expect(words.rows.map(r => r.label)).toEqual(['apple', 'mango', 'pear'])
  })

  it('computes percentages of the word total', () => {
    const { words } = analyzeFrequency('a-b-c-d', { ignoreCase: false, ignoreStopWords: false })
    expect(words.rows.map(r => r.percent)).toEqual([25, 25, 25, 25])
    const skewed = analyzeFrequency('x x x y', PLAIN).words
    expect(skewed.rows[0].percent).toBeCloseTo(75)
    expect(skewed.rows[1].percent).toBeCloseTo(25)
  })

  it('treats Hello and hello as different words when case is kept', () => {
    const { words } = analyzeFrequency('Hello hello HELLO', PLAIN)
    expect(words.rows.map(r => [r.label, r.count])).toEqual([
      ['HELLO', 1],
      ['Hello', 1],
      ['hello', 1],
    ])
  })

  it('merges case variants when ignore case is on', () => {
    const { words } = analyzeFrequency('Hello hello HELLO', FOLDED)
    expect(words.rows).toEqual([{ key: 'hello', label: 'hello', count: 3, percent: 100 }])
  })

  it('removes stop words only when the option is on', () => {
    const text = 'The cat is on the mat'
    const kept = analyzeFrequency(text, FOLDED)
    expect(kept.words.total).toBe(6)
    expect(kept.stopWordsRemoved).toBe(0)

    const removed = analyzeFrequency(text, NO_STOP)
    expect(removed.words.rows.map(r => r.label).sort()).toEqual(['cat', 'mat'])
    expect(removed.words.total).toBe(2)
    expect(removed.stopWordsRemoved).toBe(4)
    expect(removed.words.rows[0].percent).toBeCloseTo(50)
  })

  it('still removes a stop word written in capitals when case is kept', () => {
    const { words, stopWordsRemoved } = analyzeFrequency('The Dog', { ignoreCase: false, ignoreStopWords: true })
    expect(words.rows.map(r => r.label)).toEqual(['Dog'])
    expect(stopWordsRemoved).toBe(1)
  })

  it('returns empty tables for empty input', () => {
    const result = analyzeFrequency('', NO_STOP)
    expect(result.words).toEqual({ rows: [], total: 0, unique: 0 })
    expect(result.characters).toEqual({ rows: [], total: 0, unique: 0 })
    expect(result.stopWordsRemoved).toBe(0)
  })

  it('returns empty word rows when everything is a stop word', () => {
    const result = analyzeFrequency('the a an of', NO_STOP)
    expect(result.words.rows).toEqual([])
    expect(result.words.total).toBe(0)
    expect(result.stopWordsRemoved).toBe(4)
  })

  it('counts non-Latin words as separate items', () => {
    const { words } = analyzeFrequency('мир мир 世界 мир', FOLDED)
    expect(words.rows.map(r => [r.label, r.count])).toEqual([
      ['мир', 3],
      ['世界', 1],
    ])
  })

  it('handles tens of thousands of words quickly', () => {
    const vocabulary = Array.from({ length: 500 }, (_, i) => `word${i}`)
    const text = Array.from({ length: 60000 }, (_, i) => vocabulary[(i * 7) % vocabulary.length]).join(' ')
    const started = Date.now()
    const { words } = analyzeFrequency(text, NO_STOP)
    expect(Date.now() - started).toBeLessThan(2000)
    expect(words.total).toBe(60000)
    expect(words.unique).toBe(500)
    expect(words.rows[0].count).toBe(120)
  })
})

describe('analyzeFrequency: characters', () => {
  it('includes spaces, newlines and punctuation', () => {
    const { characters } = analyzeFrequency('a b\n!', PLAIN)
    const labels = characters.rows.map(r => r.label)
    expect(labels).toContain('Space')
    expect(labels).toContain('Newline')
    expect(labels).toContain('!')
    expect(characters.total).toBe(5)
    expect(characters.unique).toBe(5)
  })

  it('counts code points, so an emoji counts once', () => {
    const { characters } = analyzeFrequency('😀😀a', PLAIN)
    expect(characters.total).toBe(3)
    expect(characters.rows[0]).toMatchObject({ label: '😀', count: 2 })
  })

  it('lowercases characters when ignore case is on', () => {
    const { characters } = analyzeFrequency('AaA', FOLDED)
    expect(characters.rows).toEqual([{ key: 'a', label: 'a', count: 3, percent: 100 }])
  })

  it('is unaffected by the stop word option', () => {
    const a = analyzeFrequency('the the the', FOLDED).characters
    const b = analyzeFrequency('the the the', NO_STOP).characters
    expect(a).toEqual(b)
    expect(a.total).toBe(11)
  })

  it('returns an empty table for empty input', () => {
    expect(analyzeFrequency('', PLAIN).characters.rows).toEqual([])
  })

  it('handles a very long input without losing counts', () => {
    const text = 'lorem ipsum dolor sit amet. '.repeat(4000)
    const started = Date.now()
    const { characters } = analyzeFrequency(text, FOLDED)
    expect(Date.now() - started).toBeLessThan(2000)
    expect(characters.total).toBe(text.length)
    expect(characters.rows.reduce((sum, r) => sum + r.count, 0)).toBe(text.length)
  })
})

describe('describeCharacter', () => {
  it('names whitespace characters', () => {
    expect(describeCharacter(' ')).toBe('Space')
    expect(describeCharacter('\n')).toBe('Newline')
    expect(describeCharacter('\t')).toBe('Tab')
    expect(describeCharacter('\r')).toBe('Carriage return')
    expect(describeCharacter(' ')).toBe('No-break space')
  })

  it('shows other control and format characters as code points', () => {
    expect(describeCharacter('\u0000')).toBe('U+0000')
    expect(describeCharacter('‍')).toBe('U+200D')
    expect(describeCharacter('　')).toBe('U+3000')
  })

  it('returns printing characters unchanged', () => {
    expect(describeCharacter('a')).toBe('a')
    expect(describeCharacter('€')).toBe('€')
    expect(describeCharacter('é')).toBe('é')
  })
})

describe('sortRows', () => {
  const rows: FrequencyRow[] = [
    { key: 'b', label: 'b', count: 2, percent: 20 },
    { key: 'a', label: 'a', count: 5, percent: 50 },
    { key: 'c', label: 'c', count: 3, percent: 30 },
  ]

  it('sorts by count in both directions', () => {
    expect(sortRows(rows, 'count', 'desc').map(r => r.label)).toEqual(['a', 'c', 'b'])
    expect(sortRows(rows, 'count', 'asc').map(r => r.label)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by label alphabetically', () => {
    expect(sortRows(rows, 'label', 'asc').map(r => r.label)).toEqual(['a', 'b', 'c'])
    expect(sortRows(rows, 'label', 'desc').map(r => r.label)).toEqual(['c', 'b', 'a'])
  })

  it('sorts by percent', () => {
    expect(sortRows(rows, 'percent', 'asc').map(r => r.label)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate its input', () => {
    const copy = [...rows]
    sortRows(rows, 'label', 'desc')
    expect(rows).toEqual(copy)
  })
})

describe('limitRows', () => {
  const rows: FrequencyRow[] = Array.from({ length: 30 }, (_, i) => ({
    key: `k${i}`,
    label: `k${i}`,
    count: 1,
    percent: 1,
  }))

  it('keeps the first N rows', () => {
    expect(limitRows(rows, 10)).toHaveLength(10)
    expect(limitRows(rows, 25)).toHaveLength(25)
  })

  it('returns every row for "all"', () => {
    expect(limitRows(rows, 'all')).toHaveLength(30)
  })

  it('returns all rows when there are fewer than N', () => {
    expect(limitRows(rows.slice(0, 3), 10)).toHaveLength(3)
  })
})

describe('formatPercent', () => {
  it('formats to two decimals with a percent sign', () => {
    expect(formatPercent(12.5)).toBe('12.50%')
    expect(formatPercent(0)).toBe('0.00%')
  })
})

describe('export', () => {
  const { words } = analyzeFrequency('one, two, "three" one', PLAIN)

  it('writes CSV with a header and one line per row', () => {
    expect(toCsv(words.rows, 'Word')).toBe(
      ['Word,Count,Percent', 'one,2,50.00', 'three,1,25.00', 'two,1,25.00'].join('\n'),
    )
  })

  it('quotes CSV fields that contain commas, quotes or line breaks', () => {
    const rows: FrequencyRow[] = [
      { key: ',', label: ',', count: 1, percent: 50 },
      { key: 'say "hi"', label: 'say "hi"', count: 1, percent: 50 },
      { key: '\n', label: 'Newline', count: 1, percent: 50 },
    ]
    expect(toCsv(rows, 'Character')).toBe(
      [
        'Character,Count,Percent',
        '",",1,50.00',
        '"say ""hi""",1,50.00',
        'Newline,1,50.00',
      ].join('\n'),
    )
  })

  it('writes plain text as item: count (percent)', () => {
    expect(toPlainText(words.rows)).toBe('one: 2 (50.00%)\nthree: 1 (25.00%)\ntwo: 1 (25.00%)')
  })

  it('writes nothing for an empty table', () => {
    expect(toPlainText([])).toBe('')
    expect(toCsv([], 'Word')).toBe('Word,Count,Percent')
  })
})
