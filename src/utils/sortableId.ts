export type SortableIdKind = 'ulid' | 'uuidv7'

export type RandomBytesFn = (size: number) => Uint8Array

const defaultRandomBytes: RandomBytesFn = (size) => crypto.getRandomValues(new Uint8Array(size))

const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const CROCKFORD_DECODE_MAP: Record<string, number> = (() => {
  const map: Record<string, number> = {}
  for (let i = 0; i < CROCKFORD_ALPHABET.length; i++) {
    const ch = CROCKFORD_ALPHABET[i]
    map[ch] = i
    map[ch.toLowerCase()] = i
  }
  return map
})()

export const MAX_SORTABLE_ID_COUNT = 100
export const MAX_ULID_TIMESTAMP = 281474976710655 // 2^48 - 1

export function clampSortableCount(count: number): number {
  if (!Number.isFinite(count)) return 1
  return Math.min(MAX_SORTABLE_ID_COUNT, Math.max(1, Math.round(count)))
}

function encodeUlidTimestamp(ms: number): string {
  if (!Number.isInteger(ms) || ms < 0 || ms > MAX_ULID_TIMESTAMP) {
    throw new Error(`Timestamp must be an integer between 0 and ${MAX_ULID_TIMESTAMP}.`)
  }
  let value = ms
  const chars = new Array<string>(10)
  for (let i = 9; i >= 0; i--) {
    chars[i] = CROCKFORD_ALPHABET[value % 32]
    value = Math.floor(value / 32)
  }
  return chars.join('')
}

function encodeUlidRandom(bytes: Uint8Array): string {
  if (bytes.length !== 10) {
    throw new Error('ULID randomness requires exactly 10 bytes (80 bits).')
  }
  // Convert 10 bytes (80 bits) into 16 5-bit Crockford characters
  const chars = new Array<string>(16)
  let buffer = 0
  let bitsLeft = 0
  let outIdx = 0
  for (let i = 0; i < 10; i++) {
    buffer = (buffer << 8) | bytes[i]
    bitsLeft += 8
    while (bitsLeft >= 5) {
      bitsLeft -= 5
      chars[outIdx++] = CROCKFORD_ALPHABET[(buffer >> bitsLeft) & 0x1f]
    }
  }
  return chars.join('')
}

function incrementBytesBigEndian(bytes: Uint8Array): boolean {
  for (let i = bytes.length - 1; i >= 0; i--) {
    if (bytes[i] < 0xff) {
      bytes[i] += 1
      return true
    }
    bytes[i] = 0
  }
  return false
}

export interface GenerateOptions {
  timestampMs?: number
  monotonic?: boolean
  lowercase?: boolean
  uppercase?: boolean
  noHyphens?: boolean
  randomBytes?: RandomBytesFn
}

export function generateUlid(timestampMs: number = Date.now(), randomBytes: RandomBytesFn = defaultRandomBytes): string {
  const ts = Math.floor(timestampMs)
  const rand = randomBytes(10)
  return encodeUlidTimestamp(ts) + encodeUlidRandom(rand)
}

export function generateUlids(count: number, options: GenerateOptions = {}): string[] {
  const safeCount = clampSortableCount(count)
  const baseTs = Math.floor(options.timestampMs ?? Date.now())
  const monotonic = options.monotonic ?? true
  const lowercase = options.lowercase ?? false
  const randomBytes = options.randomBytes ?? defaultRandomBytes

  const results: string[] = []
  let prevRand: Uint8Array | null = null

  for (let i = 0; i < safeCount; i++) {
    let rand: Uint8Array
    if (monotonic && prevRand !== null) {
      rand = new Uint8Array(prevRand)
      const ok = incrementBytesBigEndian(rand)
      if (!ok) {
        throw new Error('80-bit ULID random component overflowed in monotonic mode.')
      }
    } else {
      rand = new Uint8Array(randomBytes(10))
    }
    prevRand = rand
    const ulid = encodeUlidTimestamp(baseTs) + encodeUlidRandom(rand)
    results.push(lowercase ? ulid.toLowerCase() : ulid)
  }

  return results
}

function formatUuidBytes(bytes: Uint8Array, uppercase = false, noHyphens = false): string {
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  const formatted = noHyphens
    ? hex
    : `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
  return uppercase ? formatted.toUpperCase() : formatted
}

function buildUuidV7Bytes(timestampMs: number, randBytes10: Uint8Array): Uint8Array {
  if (!Number.isInteger(timestampMs) || timestampMs < 0 || timestampMs > MAX_ULID_TIMESTAMP) {
    throw new Error(`Timestamp must be an integer between 0 and ${MAX_ULID_TIMESTAMP}.`)
  }
  const bytes = new Uint8Array(16)
  // 48-bit big-endian Unix ms timestamp
  let ts = timestampMs
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts & 0xff
    ts = Math.floor(ts / 256)
  }
  // rand_a (12 bits): bytes 6..7 with version 7 (0111) in top 4 bits of byte 6
  bytes[6] = 0x70 | (randBytes10[0] & 0x0f)
  bytes[7] = randBytes10[1]
  // rand_b (62 bits): bytes 8..15 with variant 10xx in top 2 bits of byte 8
  bytes[8] = 0x80 | (randBytes10[2] & 0x3f)
  for (let i = 0; i < 7; i++) {
    bytes[9 + i] = randBytes10[3 + i]
  }
  return bytes
}

function incrementUuidV7RandomBytes(bytes: Uint8Array): boolean {
  // Increment bytes 6..15 while preserving version (byte 6 top nibble 0x70) and variant (byte 8 top 2 bits 0x80)
  for (let i = 15; i >= 9; i--) {
    if (bytes[i] < 0xff) {
      bytes[i] += 1
      return true
    }
    bytes[i] = 0
  }
  // Byte 8 has 6 random bits (0..63)
  if ((bytes[8] & 0x3f) < 0x3f) {
    bytes[8] = 0x80 | ((bytes[8] & 0x3f) + 1)
    return true
  }
  bytes[8] = 0x80
  if (bytes[7] < 0xff) {
    bytes[7] += 1
    return true
  }
  bytes[7] = 0
  if ((bytes[6] & 0x0f) < 0x0f) {
    bytes[6] = 0x70 | ((bytes[6] & 0x0f) + 1)
    return true
  }
  return false
}

export function generateUuidV7(
  timestampMs: number = Date.now(),
  randomBytes: RandomBytesFn = defaultRandomBytes
): string {
  const bytes = buildUuidV7Bytes(Math.floor(timestampMs), randomBytes(10))
  return formatUuidBytes(bytes)
}

export function generateUuidV7s(count: number, options: GenerateOptions = {}): string[] {
  const safeCount = clampSortableCount(count)
  const baseTs = Math.floor(options.timestampMs ?? Date.now())
  const monotonic = options.monotonic ?? true
  const uppercase = options.uppercase ?? false
  const randomBytes = options.randomBytes ?? defaultRandomBytes

  const results: string[] = []
  let prevBytes: Uint8Array | null = null

  for (let i = 0; i < safeCount; i++) {
    let bytes: Uint8Array
    if (monotonic && prevBytes !== null) {
      bytes = new Uint8Array(prevBytes)
      const ok = incrementUuidV7RandomBytes(bytes)
      if (!ok) {
        throw new Error('UUID v7 random component overflowed in monotonic mode.')
      }
    } else {
      bytes = buildUuidV7Bytes(baseTs, randomBytes(10))
    }
    prevBytes = bytes
    results.push(formatUuidBytes(bytes, uppercase, options.noHyphens ?? false))
  }

  return results
}

export function decodeUlidBytes(ulid: string): Uint8Array {
  const trimmed = ulid.trim()
  if (trimmed.length !== 26) {
    throw new Error(`ULID must be exactly 26 characters (got ${trimmed.length}).`)
  }
  const values = new Array<number>(26)
  for (let i = 0; i < 26; i++) {
    const ch = trimmed[i]
    const v = CROCKFORD_DECODE_MAP[ch]
    if (v === undefined) {
      throw new Error(`Invalid Crockford Base32 character "${ch}" at position ${i + 1}.`)
    }
    values[i] = v
  }
  if (values[0] > 7) {
    throw new Error('ULID overflows 128-bit range (first character must be 0–7).')
  }

  // Decode 26 * 5 = 130 bits (2 leading zero bits + 128 data bits) into 16 bytes
  const bytes = new Uint8Array(16)
  // First 10 chars -> 50 bits -> 2 zero bits + 48 timestamp bits (bytes 0..5)
  let ts = 0
  for (let i = 0; i < 10; i++) {
    ts = ts * 32 + values[i]
  }
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts & 0xff
    ts = Math.floor(ts / 256)
  }

  // Remaining 16 chars -> 80 bits -> bytes 6..15
  let buffer = 0
  let bits = 0
  let byteIdx = 6
  for (let i = 10; i < 26; i++) {
    buffer = (buffer << 5) | values[i]
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes[byteIdx++] = (buffer >> bits) & 0xff
      buffer &= (1 << bits) - 1
    }
  }
  return bytes
}

export function encodeBytesToUlid(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new Error('Expected 16 bytes for ULID encoding.')
  }
  let ts = 0
  for (let i = 0; i < 6; i++) {
    ts = ts * 256 + bytes[i]
  }
  return encodeUlidTimestamp(ts) + encodeUlidRandom(bytes.slice(6, 16))
}

export interface InspectedId {
  valid: boolean
  kind: 'ulid' | 'uuid' | 'unknown'
  versionLabel: string
  variantLabel: string
  canonical: string
  alternateForm: string
  hex: string
  timestampMs: number | null
  isoDate: string | null
  randomHex: string
  error?: string
}

export function inspectId(raw: string): InspectedId {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      valid: false,
      kind: 'unknown',
      versionLabel: '—',
      variantLabel: '—',
      canonical: '',
      alternateForm: '',
      hex: '',
      timestampMs: null,
      isoDate: null,
      randomHex: '',
      error: 'Enter a ULID (26 chars) or UUID (32/36 hex chars) to inspect.',
    }
  }

  // Try ULID first (26 chars, no hyphens)
  if (!trimmed.includes('-') && trimmed.length === 26) {
    try {
      const bytes = decodeUlidBytes(trimmed)
      let ts = 0
      for (let i = 0; i < 6; i++) {
        ts = ts * 256 + bytes[i]
      }
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
      const uuidLike = formatUuidBytes(bytes)
      const randomHex = Array.from(bytes.slice(6), b => b.toString(16).padStart(2, '0')).join('')
      return {
        valid: true,
        kind: 'ulid',
        versionLabel: 'ULID (48-bit timestamp + 80-bit random)',
        variantLabel: 'Crockford Base32',
        canonical: trimmed.toUpperCase(),
        alternateForm: uuidLike,
        hex,
        timestampMs: ts,
        isoDate: new Date(ts).toISOString(),
        randomHex,
      }
    } catch (err) {
      return {
        valid: false,
        kind: 'ulid',
        versionLabel: 'Invalid ULID',
        variantLabel: '—',
        canonical: trimmed,
        alternateForm: '',
        hex: '',
        timestampMs: null,
        isoDate: null,
        randomHex: '',
        error: err instanceof Error ? err.message : 'Invalid ULID',
      }
    }
  }

  // Try UUID (hyphenated or 32-char hex)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const hex32Regex = /^[0-9a-f]{32}$/i
  if (uuidRegex.test(trimmed) || hex32Regex.test(trimmed)) {
    const hex = trimmed.replace(/-/g, '').toLowerCase()
    const bytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    const version = (bytes[6] >> 4) & 0x0f
    const variantByte = bytes[8]
    let variantLabel = 'Unknown'
    if ((variantByte & 0x80) === 0) variantLabel = 'NCS (0xxx)'
    else if ((variantByte & 0xc0) === 0x80) variantLabel = 'RFC 4122 / 9562 (10xx)'
    else if ((variantByte & 0xe0) === 0xc0) variantLabel = 'Microsoft (110x)'
    else variantLabel = 'Reserved (111x)'

    let timestampMs: number | null = null
    let isoDate: string | null = null
    let randomHex = ''

    if (version === 7) {
      let ts = 0
      for (let i = 0; i < 6; i++) {
        ts = ts * 256 + bytes[i]
      }
      timestampMs = ts
      isoDate = new Date(ts).toISOString()
      randomHex = Array.from(bytes.slice(6), b => b.toString(16).padStart(2, '0')).join('')
    } else if (version === 4) {
      randomHex = hex
    }

    const versionLabel =
      version === 7
        ? 'UUID v7 (RFC 9562 Unix Epoch Time-Ordered)'
        : version === 4
          ? 'UUID v4 (Random)'
          : version === 1
            ? 'UUID v1 (Gregorian Timestamp)'
            : `UUID v${version}`

    return {
      valid: true,
      kind: 'uuid',
      versionLabel,
      variantLabel,
      canonical: formatUuidBytes(bytes),
      alternateForm: encodeBytesToUlid(bytes),
      hex,
      timestampMs,
      isoDate,
      randomHex,
    }
  }

  return {
    valid: false,
    kind: 'unknown',
    versionLabel: 'Unrecognized format',
    variantLabel: '—',
    canonical: trimmed,
    alternateForm: '',
    hex: '',
    timestampMs: null,
    isoDate: null,
    randomHex: '',
    error: 'Input is neither a valid 26-character ULID nor a 32/36-character UUID.',
  }
}
