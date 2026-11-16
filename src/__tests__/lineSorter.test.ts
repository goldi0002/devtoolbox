import { describe, it, expect } from 'vitest'
import { processLines, sortLines, type LineSortOptions } from '../utils/lineSorter'
import { LINE_SORTER_META } from '../tools/meta/line-sorter'

const defaults: LineSortOptions = { mode: 'asc', removeDuplicates: true, trimLines: true, removeEmpty: true, caseInsensitive: true }
const run = (input: string, options: Partial<LineSortOptions> = {}) => processLines(input, { ...defaults, ...options })

describe('processLines', () => {
  it('trims before sorting, so leading spaces do not push a line to the top', () => {
    expect(run('  zebra\napple\n\tmango')).toBe('apple\nmango\nzebra')
  })

  it('sorts By Length on the trimmed text', () => {
    expect(run('      ab\nabcd\nabc', { mode: 'length' })).toBe('ab\nabc\nabcd')
  })

  it('keeps leading spaces and sorts on them when trimming is off', () => {
    expect(run('b\n  a', { trimLines: false })).toBe('  a\nb')
  })

  it('removes empty and whitespace-only lines when trimming and removing empties', () => {
    expect(run('a\n\n   \nb')).toBe('a\nb')
    expect(run('a\n\nb', { removeEmpty: false })).toBe('\na\nb')
  })

  it('dedupes case-insensitively by default and case-sensitively when asked', () => {
    expect(run('Apple\napple\nAPPLE')).toBe('Apple')
    expect(run('Apple\napple', { caseInsensitive: false }).split('\n').sort()).toEqual(['Apple', 'apple'])
  })

  it('keeps duplicates when removal is off', () => {
    expect(run('b\na\nb', { removeDuplicates: false })).toBe('a\nb\nb')
  })

  it('orders numbers naturally in Natural mode only', () => {
    expect(run('file10\nfile2\nfile1', { mode: 'natural' })).toBe('file1\nfile2\nfile10')
    expect(run('file10\nfile2\nfile1')).toBe('file1\nfile10\nfile2')
  })

  it('sorts Z to A', () => {
    expect(run('a\nc\nb', { mode: 'desc' })).toBe('c\nb\na')
  })

  it('matches the worked example on the tool page', () => {
    const { input, output } = LINE_SORTER_META.guide!.example!
    expect(run(input)).toBe(output)
  })
})

describe('sortLines', () => {
  it('does not mutate its input', () => {
    const lines = ['b', 'a']
    sortLines(lines, 'asc', true)
    expect(lines).toEqual(['b', 'a'])
  })
})
