/** RFC 4648 Base32 alphabet. */
export const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/** Encodes bytes as RFC 4648 Base32, optionally padding the result with "=" to a multiple of 8. */
export function encodeBase32Bytes(bytes: Uint8Array, pad = true): string {
  let out = ''
  let buffer = 0
  let bits = 0
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(buffer >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(buffer << (5 - bits)) & 31]
  if (pad) while (out.length % 8) out += '='
  return out
}

/** Encodes text as UTF-8, then as Base32. */
export function encodeBase32(text: string, pad = true): string {
  return encodeBase32Bytes(new TextEncoder().encode(text), pad)
}

// Lengths of a final 8-character block that can hold whole bytes (1 to 4 bytes, or a full block).
const VALID_TAIL_LENGTHS = new Set([0, 2, 4, 5, 7])

/**
 * Decodes RFC 4648 Base32 to bytes. Accepts lower case, whitespace and missing
 * padding; throws an Error with a readable message on invalid input.
 */
export function decodeBase32Bytes(input: string): Uint8Array {
  const compact = input.replace(/\s+/g, '').toUpperCase()
  const padStart = compact.indexOf('=')
  const data = padStart === -1 ? compact : compact.slice(0, padStart)
  if (padStart !== -1) {
    if (!/^=+$/.test(compact.slice(padStart))) throw new Error('Padding "=" may only appear at the end')
    if (compact.length % 8 !== 0) throw new Error('Padded Base32 must be a multiple of 8 characters long')
  }

  for (let i = 0; i < data.length; i++) {
    if (!BASE32_ALPHABET.includes(data[i])) {
      throw new Error(`Invalid Base32 character "${data[i]}" at position ${i + 1}; use A–Z and 2–7`)
    }
  }
  if (!VALID_TAIL_LENGTHS.has(data.length % 8)) {
    throw new Error(`Invalid Base32 length: ${data.length} characters cannot encode whole bytes`)
  }

  const bytes = new Uint8Array(Math.floor((data.length * 5) / 8))
  let buffer = 0
  let bits = 0
  let index = 0
  for (const char of data) {
    buffer = ((buffer << 5) | BASE32_ALPHABET.indexOf(char)) & 0xfff
    bits += 5
    if (bits >= 8) {
      bytes[index++] = (buffer >>> (bits - 8)) & 0xff
      bits -= 8
    }
  }
  return bytes
}

/** Decodes Base32 to bytes and then to UTF-8 text; throws if the bytes are not valid UTF-8. */
export function decodeBase32(input: string): string {
  const bytes = decodeBase32Bytes(input)
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('Decoded bytes are not valid UTF-8 text')
  }
}
