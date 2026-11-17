import { describe, expect, it } from 'vitest'
import { byteLength, describeSyntaxError, savingsPercent, toSyntaxErrorInfo } from '../utils/minifyStats'

describe('byteLength', () => {
  it('counts UTF-8 bytes, not characters', () => {
    expect(byteLength('abc')).toBe(3)
    expect(byteLength('é')).toBe(2)
    expect(byteLength('')).toBe(0)
  })
})

describe('savingsPercent', () => {
  it('returns the share removed, to one decimal place', () => {
    expect(savingsPercent(100, 25)).toBe(75)
    expect(savingsPercent(3, 1)).toBe(66.7)
  })
  it('is negative when the output grew', () => {
    expect(savingsPercent(10, 12)).toBe(-20)
  })
  it('is zero for empty input instead of dividing by zero', () => {
    expect(savingsPercent(0, 0)).toBe(0)
  })
})

describe('toSyntaxErrorInfo', () => {
  it('turns the 0-based col from Terser into a 1-based column', () => {
    expect(toSyntaxErrorInfo({ message: 'Unexpected token', line: 2, col: 4 })).toEqual({
      message: 'Unexpected token',
      line: 2,
      column: 5,
    })
  })
  it('keeps the message of an Error and drops positions it does not have', () => {
    const err = new Error('boom')
    expect(toSyntaxErrorInfo(err)).toEqual({ message: 'boom' })
  })
  it('handles values that are not errors', () => {
    expect(toSyntaxErrorInfo('plain text')).toEqual({ message: 'plain text' })
  })
})

describe('describeSyntaxError', () => {
  it('includes the position when it is known', () => {
    expect(describeSyntaxError({ message: 'Unexpected token', line: 2, column: 5 })).toBe(
      'Syntax error at line 2, column 5: Unexpected token',
    )
    expect(describeSyntaxError({ message: 'Unexpected token', line: 3 })).toBe(
      'Syntax error at line 3: Unexpected token',
    )
  })
  it('falls back to a plain message when there is no position', () => {
    expect(describeSyntaxError({ message: 'something broke' })).toBe('Could not minify: something broke')
  })
})
