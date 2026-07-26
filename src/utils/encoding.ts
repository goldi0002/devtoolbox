export function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
}

export function decodeBase64(value: string): string {
  return decodeURIComponent(escape(atob(value)))
}

export function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return atob(padded)
}

export type UrlEncodeType = 'full' | 'component'

export function encodeUrl(value: string, type: UrlEncodeType): string {
  return type === 'component' ? encodeURIComponent(value) : encodeURI(value)
}

export function decodeUrl(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return decodeURI(value)
  }
}

export function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}
