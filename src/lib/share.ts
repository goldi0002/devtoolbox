import LZString from 'lz-string'

export function compress(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  return LZString.compressToEncodedURIComponent(str)
}

export function decompress<T = unknown>(compressed: string): T | null {
  const str = LZString.decompressFromEncodedURIComponent(compressed)
  if (!str) return null
  try {
    return JSON.parse(str) as T
  } catch {
    return str as unknown as T
  }
}

export function buildShareUrl(data: unknown): string {
  const url = new URL(window.location.href)
  url.hash = compress(data)
  return url.toString()
}

export function readHashData<T = unknown>(): T | null {
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  return decompress<T>(hash)
}