import { describe, it, expect } from 'vitest'
import { decodeBase32, decodeBase32Bytes, encodeBase32, encodeBase32Bytes } from '../utils/base32'

// RFC 4648 section 10 test vectors.
const VECTORS: [string, string][] = [
  ['', ''],
  ['f', 'MY======'],
  ['fo', 'MZXQ===='],
  ['foo', 'MZXW6==='],
  ['foob', 'MZXW6YQ='],
  ['fooba', 'MZXW6YTB'],
  ['foobar', 'MZXW6YTBOI======'],
]

describe('encodeBase32', () => {
  it.each(VECTORS)('encodes %j as %j', (plain, encoded) => {
    expect(encodeBase32(plain)).toBe(encoded)
  })

  it('omits padding when asked', () => {
    expect(encodeBase32('foobar', false)).toBe('MZXW6YTBOI')
  })

  it('encodes UTF-8 multi-byte text', () => {
    expect(encodeBase32('✓')).toBe('4KOJG===')
  })

  it('encodes arbitrary bytes', () => {
    expect(encodeBase32Bytes(new Uint8Array([0, 255]))).toBe('AD7Q====')
  })
})

describe('decodeBase32', () => {
  it.each(VECTORS)('decodes %j from %j', (plain, encoded) => {
    expect(decodeBase32(encoded)).toBe(plain)
  })

  it('accepts lower case, whitespace and missing padding', () => {
    expect(decodeBase32('mzxw 6ytb\noi')).toBe('foobar')
  })

  it('round-trips UTF-8 text', () => {
    const text = 'héllo ✓ 日本語'
    expect(decodeBase32(encodeBase32(text))).toBe(text)
    expect(decodeBase32(encodeBase32(text, false))).toBe(text)
  })

  it('rejects characters outside the alphabet', () => {
    expect(() => decodeBase32('MZXW1===')).toThrow('Invalid Base32 character "1" at position 5')
  })

  it('rejects padding in the middle', () => {
    expect(() => decodeBase32('MY==MY==')).toThrow('may only appear at the end')
  })

  it('rejects padded input that is not a multiple of 8', () => {
    expect(() => decodeBase32('MY===')).toThrow('multiple of 8')
  })

  it('rejects lengths that cannot encode whole bytes', () => {
    expect(() => decodeBase32('MZX')).toThrow('Invalid Base32 length: 3')
  })

  it('reports bytes that are not UTF-8 text', () => {
    expect(Array.from(decodeBase32Bytes('AD7Q===='))).toEqual([0, 255])
    expect(() => decodeBase32('AD7Q====')).toThrow('not valid UTF-8')
  })
})
