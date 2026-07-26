import LZString from 'lz-string'
import { reportError } from '../utils/errors'

// Maximum 250KB compressed hash string length to prevent memory exhaustion / DoS attacks
const MAX_SHARE_HASH_LENGTH = 250000

export function compress(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  return LZString.compressToEncodedURIComponent(str)
}

export function decompress<T = unknown>(compressed: string): T | null {
  if (!compressed || compressed.length > MAX_SHARE_HASH_LENGTH) {
    if (compressed && compressed.length > MAX_SHARE_HASH_LENGTH) {
      reportError('Share payload exceeds safety length limit', new Error(`Payload length ${compressed.length} exceeds max limit of ${MAX_SHARE_HASH_LENGTH}`))
    }
    return null
  }
  let str: string | null
  try {
    str = LZString.decompressFromEncodedURIComponent(compressed)
  } catch (error) {
    reportError('Failed to decompress shared payload', error)
    return null
  }
  if (!str) return null
  try {
    return JSON.parse(str) as T
  } catch {
    // Plain-string payloads are shared as-is and are not valid JSON.
    return str as unknown as T
  }
}

export function buildShareUrl(data: unknown): string {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  url.hash = compress(data)
  return url.toString()
}

export function readHashData<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  const data = decompress<T>(hash)
  if (data === null) {
    reportError('Ignoring unreadable share link', new Error('Share hash could not be decoded'))
  }
  return data
}
