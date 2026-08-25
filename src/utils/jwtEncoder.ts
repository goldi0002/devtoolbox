// ── JWT Encoder Utility ────────────────────────────────────────────────────
// 100% client-side JWT creation using Web Crypto API
// Supports HS256, HS384, HS512 HMAC signing algorithms

export interface JwtHeader {
  alg: string
  typ: string
  [key: string]: unknown
}

export interface JwtPayload {
  [key: string]: unknown
}

export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512'

function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return base64UrlEncode(binary)
}

async function hmacSign(
  algorithm: JwtAlgorithm,
  secret: string,
  data: string
): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const dataBuffer = encoder.encode(data)

  const hashAlg = algorithm === 'HS512' ? 'SHA-512' : algorithm === 'HS384' ? 'SHA-384' : 'SHA-256'

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: hashAlg },
    false,
    ['sign']
  )

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
  return base64UrlEncodeBytes(new Uint8Array(signature))
}

export async function encodeJwt(
  header: JwtHeader,
  payload: JwtPayload,
  secret: string,
  algorithm: JwtAlgorithm = 'HS256'
): Promise<string> {
  if (!secret) throw new Error('Secret key is required for HMAC signing')

  const headerJson = JSON.stringify(header)
  const payloadJson = JSON.stringify(payload)

  const encodedHeader = base64UrlEncode(headerJson)
  const encodedPayload = base64UrlEncode(payloadJson)

  const signature = await hmacSign(algorithm, secret, `${encodedHeader}.${encodedPayload}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function createDefaultHeader(algorithm: JwtAlgorithm = 'HS256'): JwtHeader {
  return { alg: algorithm, typ: 'JWT' }
}

export function createDefaultPayload(options?: {
  subject?: string
  issuer?: string
  expiresInMinutes?: number
}): JwtPayload {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    iat: now,
  }
  if (options?.subject) payload.sub = options.subject
  if (options?.issuer) payload.iss = options.issuer
  if (options?.expiresInMinutes) {
    payload.exp = now + options.expiresInMinutes * 60
  }
  return payload
}

export const SAMPLE_SECRET = 'your-256-bit-secret'

export const SAMPLE_HEADER: JwtHeader = {
  alg: 'HS256',
  typ: 'JWT',
}

export const SAMPLE_PAYLOAD: JwtPayload = {
  sub: 'user_123',
  name: 'Alice Smith',
  email: 'alice@example.com',
  role: 'admin',
  iat: 1700000000,
  exp: 9999999999,
}
