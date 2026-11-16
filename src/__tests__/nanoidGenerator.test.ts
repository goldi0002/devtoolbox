import { describe, it, expect } from 'vitest'
import {
  ALPHABET_PRESETS,
  NANOID_DEFAULT_LENGTH,
  clampCount,
  clampLength,
  entropyBits,
  generateNanoId,
  generateNanoIds,
  validateAlphabet,
} from '../utils/nanoIdGenerator'

const onlyFrom = (alphabet: string) => new RegExp(`^[${alphabet.replace(/[\\\]^-]/g, '\\$&')}]+$`)

describe('generateNanoId', () => {
  it.each(ALPHABET_PRESETS)('$label: IDs use only the alphabet and have the requested length', ({ alphabet }) => {
    for (const length of [4, 21, 64]) {
      const id = generateNanoId(alphabet, length)
      expect(id).toHaveLength(length)
      expect(id).toMatch(onlyFrom(alphabet))
    }
  })

  it('uses the NanoID default alphabet of 64 unique URL-safe characters', () => {
    const nanoid = ALPHABET_PRESETS.find((p) => p.id === 'nanoid')!.alphabet
    expect(new Set(nanoid).size).toBe(64)
    expect(nanoid).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('clamps length to 4–64', () => {
    expect(generateNanoId('ab', 1)).toHaveLength(4)
    expect(generateNanoId('ab', 500)).toHaveLength(64)
  })

  it('supports a custom alphabet with multi-byte characters', () => {
    const id = generateNanoId('🍎🍐', 10)
    expect(Array.from(id)).toHaveLength(10)
    expect(Array.from(id).every((c) => c === '🍎' || c === '🍐')).toBe(true)
  })

  it('discards masked bytes outside the alphabet instead of wrapping (no modulo bias)', () => {
    // Alphabet of 3 → mask 3; byte values 3, 7, 255 map to index 3 and must be skipped.
    const feed = [3, 7, 255, 0, 1, 2, 4, 5, 6, 8]
    const randomBytes = (size: number) => new Uint8Array(Array.from({ length: size }, (_, i) => feed[i % feed.length]))
    expect(generateNanoId('abc', 4, randomBytes)).toBe('abca')
  })

  it('rejects an invalid alphabet', () => {
    expect(() => generateNanoId('a', 10)).toThrow('at least 2')
  })

  it('produces different IDs on each call', () => {
    const ids = new Set(generateNanoIds(ALPHABET_PRESETS[0].alphabet, NANOID_DEFAULT_LENGTH, 100))
    expect(ids.size).toBe(100)
  })
})

describe('generateNanoIds', () => {
  it('clamps the count to 1–100', () => {
    expect(generateNanoIds('ab', 8, 0)).toHaveLength(1)
    expect(generateNanoIds('ab', 8, 1000)).toHaveLength(100)
  })
})

describe('validateAlphabet', () => {
  it('accepts 2 to 256 unique characters', () => {
    expect(validateAlphabet('01')).toBe('')
    expect(validateAlphabet(Array.from({ length: 256 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join(''))).toBe('')
  })

  it('rejects short, oversized and repeated alphabets', () => {
    expect(validateAlphabet('')).toContain('at least 2')
    expect(validateAlphabet(Array.from({ length: 257 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join(''))).toContain('at most 256')
    expect(validateAlphabet('abca')).toContain('repeated')
  })
})

describe('helpers', () => {
  it('clamps length and count, falling back for non-numbers', () => {
    expect(clampLength(Number.NaN)).toBe(21)
    expect(clampLength(10.6)).toBe(11)
    expect(clampCount(Number.NaN)).toBe(1)
    expect(clampCount(50)).toBe(50)
  })

  it('computes bits of randomness', () => {
    expect(entropyBits(64, 21)).toBe(126)
    expect(entropyBits(16, 32)).toBe(128)
    expect(entropyBits(1, 21)).toBe(0)
  })
})
