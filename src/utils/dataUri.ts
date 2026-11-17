/** Files above this size get a warning: Base64 adds about a third, and large Data URIs slow pages and editors. */
export const LARGE_FILE_THRESHOLD_BYTES = 256 * 1024

export const DEFAULT_MIME = 'application/octet-stream'

const MIME_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/

export type DataUriParse =
  | { ok: true; mime: string; base64: string; dataUri: string }
  | { ok: false; error: string }

/** Length of the Base64 text that encodes `byteLength` bytes, padding included. */
export function base64Length(byteLength: number): number {
  if (!Number.isFinite(byteLength) || byteLength <= 0) return 0
  return 4 * Math.ceil(byteLength / 3)
}

export function isLargeFile(byteLength: number): boolean {
  return byteLength > LARGE_FILE_THRESHOLD_BYTES
}

/** Lower-cases a MIME type; falls back to application/octet-stream when it is empty or malformed. */
export function normalizeMime(mime: string): string {
  const value = mime.trim().toLowerCase()
  return MIME_PATTERN.test(value) ? value : DEFAULT_MIME
}

export function buildDataUri(mime: string, base64: string): string {
  return `data:${normalizeMime(mime)};base64,${base64}`
}

/** Returns the part after the first comma of a `data:` URL, as produced by FileReader.readAsDataURL. */
export function base64FromDataUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma < 0 ? '' : dataUrl.slice(comma + 1)
}

/**
 * Parses a base64 Data URI such as `data:image/png;base64,iVBOR...`.
 * Whitespace inside the payload is ignored. Percent-encoded (non-base64) URIs are rejected.
 */
export function parseDataUri(input: string): DataUriParse {
  const text = input.trim()
  if (!text) return { ok: false, error: 'Paste a Data URI, for example data:image/png;base64,…' }
  if (!/^data:/i.test(text)) return { ok: false, error: 'A Data URI starts with "data:".' }

  const comma = text.indexOf(',')
  if (comma < 0) return { ok: false, error: 'The Data URI has no comma separating its header from its data.' }

  const parts = text.slice(5, comma).split(';').map(part => part.trim())
  const isBase64 = parts.length > 1 && parts[parts.length - 1].toLowerCase() === 'base64'
  if (!isBase64) {
    return { ok: false, error: 'Only base64 Data URIs can be decoded. This one is not marked ";base64".' }
  }

  const rawMime = parts[0] || 'text/plain'
  if (!MIME_PATTERN.test(rawMime)) return { ok: false, error: `The MIME type "${rawMime}" is not valid.` }
  const mime = normalizeMime(rawMime)

  const base64 = text.slice(comma + 1).replace(/\s+/g, '')
  if (!base64) return { ok: false, error: 'The Data URI has no data after the comma.' }
  if (!BASE64_PATTERN.test(base64)) {
    return { ok: false, error: 'The data contains characters that are not Base64 (A–Z, a–z, 0–9, +, /, =).' }
  }
  if (base64.length % 4 === 1) return { ok: false, error: 'The Base64 data has an invalid length.' }

  return { ok: true, mime, base64, dataUri: buildDataUri(mime, base64) }
}

/** Number of bytes a Base64 string decodes to. */
export function decodedLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

/** Decodes Base64 to bytes, or returns null when the text is not valid Base64. */
export function decodeBase64ToBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

export function isImageMime(mime: string): boolean {
  return /^image\/[a-z0-9][a-z0-9.+-]*$/i.test(mime.trim())
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'application/pdf': 'pdf',
  'application/json': 'json',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/csv': 'csv',
}

/** File extension for a MIME type, or `bin` when it is unknown. */
export function extensionForMime(mime: string): string {
  return EXTENSIONS[normalizeMime(mime)] ?? 'bin'
}

export function cssBackgroundImage(dataUri: string): string {
  return `background-image: url("${dataUri}");`
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function htmlImgTag(dataUri: string, alt = ''): string {
  return `<img src="${escapeAttribute(dataUri)}" alt="${escapeAttribute(alt)}">`
}
