export const NANOID_MIN_LENGTH = 4
export const NANOID_MAX_LENGTH = 64
export const NANOID_DEFAULT_LENGTH = 21
export const NANOID_MAX_COUNT = 100

export const ALPHABET_PRESETS = [
  { id: 'nanoid', label: 'NanoID default (A–Z a–z 0–9 _ -)', alphabet: 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict' },
  { id: 'alphanumeric', label: 'Alphanumeric (A–Z a–z 0–9)', alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' },
  { id: 'lowercase', label: 'Lowercase + digits', alphabet: '0123456789abcdefghijklmnopqrstuvwxyz' },
  { id: 'nolookalikes', label: 'No look-alikes (no 0 O 1 l I)', alphabet: '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz' },
  { id: 'hex', label: 'Hex (0–9 a–f)', alphabet: '0123456789abcdef' },
  { id: 'numbers', label: 'Numbers only', alphabet: '0123456789' },
] as const

export type RandomBytes = (size: number) => Uint8Array

const cryptoRandomBytes: RandomBytes = (size) => crypto.getRandomValues(new Uint8Array(size))

/** Returns an error message for an unusable alphabet, or an empty string if it is valid. */
export function validateAlphabet(alphabet: string): string {
  const chars = Array.from(alphabet)
  if (chars.length < 2) return 'The alphabet needs at least 2 characters'
  if (chars.length > 256) return 'The alphabet can have at most 256 characters'
  if (new Set(chars).size !== chars.length) return 'The alphabet has repeated characters, which would make some more likely'
  return ''
}

export function clampLength(length: number): number {
  if (!Number.isFinite(length)) return NANOID_DEFAULT_LENGTH
  return Math.min(NANOID_MAX_LENGTH, Math.max(NANOID_MIN_LENGTH, Math.round(length)))
}

export function clampCount(count: number): number {
  if (!Number.isFinite(count)) return 1
  return Math.min(NANOID_MAX_COUNT, Math.max(1, Math.round(count)))
}

/**
 * Generates one ID of `length` characters from `alphabet` using cryptographically
 * secure random bytes. Bytes are masked to the next power of two and values outside
 * the alphabet are discarded, so every character is equally likely (no modulo bias).
 */
export function generateNanoId(alphabet: string, length: number, randomBytes: RandomBytes = cryptoRandomBytes): string {
  const error = validateAlphabet(alphabet)
  if (error) throw new Error(error)
  const chars = Array.from(alphabet)
  const size = clampLength(length)
  const mask = (2 << (31 - Math.clz32((chars.length - 1) | 1))) - 1
  const step = Math.ceil((1.6 * mask * size) / chars.length)
  let id = ''
  let produced = 0
  while (produced < size) {
    const bytes = randomBytes(step)
    for (let i = 0; i < step && produced < size; i++) {
      const index = bytes[i] & mask
      if (index < chars.length) {
        id += chars[index]
        produced++
      }
    }
  }
  return id
}

export function generateNanoIds(alphabet: string, length: number, count: number, randomBytes?: RandomBytes): string[] {
  return Array.from({ length: clampCount(count) }, () => generateNanoId(alphabet, length, randomBytes))
}

/** Bits of randomness in one ID: length × log2(alphabet size). */
export function entropyBits(alphabetSize: number, length: number): number {
  return alphabetSize < 2 ? 0 : clampLength(length) * Math.log2(alphabetSize)
}
