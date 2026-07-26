import { describe, it, expect, beforeEach } from 'vitest'
import { compress, decompress, buildShareUrl, readHashData } from './share'

describe('compress / decompress', () => {
  it('round-trips a plain object', () => {
    const data = { a: 1, b: 'two', c: [true, null] }
    const restored = decompress(compress(data))
    expect(restored).toEqual(data)
  })

  it('round-trips a JSON-serializable string as parsed JSON', () => {
    // A numeric string is valid JSON, so it is parsed back into a number.
    expect(decompress(compress('42'))).toBe(42)
  })

  it('returns a raw string when the payload is not valid JSON', () => {
    expect(decompress(compress('hello world'))).toBe('hello world')
  })

  it('produces a URL-safe encoded string', () => {
    const encoded = compress({ hello: 'world' })
    expect(encoded).toMatch(/^[A-Za-z0-9+\-$]*$/)
  })

  it('returns null for empty or invalid compressed input', () => {
    expect(decompress('')).toBeNull()
  })
})

describe('buildShareUrl / readHashData', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', 'https://example.com/tool')
  })

  it('encodes data into the URL hash', () => {
    const url = buildShareUrl({ foo: 'bar' })
    expect(url.startsWith('https://example.com/tool#')).toBe(true)
    const hash = new URL(url).hash.slice(1)
    expect(decompress(hash)).toEqual({ foo: 'bar' })
  })

  it('reads and decodes data from the current location hash', () => {
    window.location.hash = compress({ foo: 'bar' })
    expect(readHashData()).toEqual({ foo: 'bar' })
  })

  it('returns null when there is no hash', () => {
    window.history.replaceState(null, '', 'https://example.com/tool')
    expect(readHashData()).toBeNull()
  })
})
