import { decodeBase32Bytes, encodeBase32Bytes } from './base32'

export type OtpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'
export type OtpMode = 'totp' | 'hotp'

export interface OtpGenerationOptions {
  secretBase32: string
  algorithm?: OtpAlgorithm
  digits?: 6 | 7 | 8
  period?: number
  counter?: number
  timestampMs?: number
}

export interface TotpResult {
  code: string
  nextCode: string
  counter: number
  secondsRemaining: number
  period: number
  secretHex: string
}

export interface ParsedOtpAuthUri {
  mode: OtpMode
  label: string
  issuer: string
  account: string
  secret: string
  algorithm: OtpAlgorithm
  digits: 6 | 7 | 8
  period: number
  counter: number
}

export function generateRandomBase32Secret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return encodeBase32Bytes(bytes, false)
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  const high = Math.floor(counter / 0x100000000)
  const low = counter >>> 0
  view.setUint32(0, high, false)
  view.setUint32(4, low, false)
  return new Uint8Array(buf)
}

export async function generateHotpCode(
  secretBytes: Uint8Array,
  counter: number,
  algorithm: OtpAlgorithm = 'SHA-1',
  digits: 6 | 7 | 8 = 6
): Promise<string> {
  if (!Number.isInteger(counter) || counter < 0) {
    throw new Error('Counter must be a non-negative integer.')
  }
  if (secretBytes.length === 0) {
    throw new Error('Secret cannot be empty.')
  }

  const keyData = Uint8Array.from(secretBytes)
  const msgData = Uint8Array.from(counterToBytes(counter))

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  )

  const hmacBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const hmac = new Uint8Array(hmacBuffer)

  // RFC 4226 dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  const mod = 10 ** digits
  const otp = binary % mod
  return String(otp).padStart(digits, '0')
}

export async function generateTotp(options: OtpGenerationOptions): Promise<TotpResult> {
  const secretClean = options.secretBase32.trim()
  if (!secretClean) {
    throw new Error('Enter a Base32 secret key (e.g. JBSWY3DPEHPK3PXP).')
  }

  const secretBytes = decodeBase32Bytes(secretClean)
  if (secretBytes.length === 0) {
    throw new Error('Base32 secret decoded to 0 bytes.')
  }

  const algorithm = options.algorithm ?? 'SHA-1'
  const digits = options.digits ?? 6
  const period = Math.max(5, Math.min(300, Math.floor(options.period ?? 30)))
  const nowSec = Math.floor((options.timestampMs ?? Date.now()) / 1000)
  const counter = Math.floor(nowSec / period)
  const secondsRemaining = period - (nowSec % period)

  const [code, nextCode] = await Promise.all([
    generateHotpCode(secretBytes, counter, algorithm, digits),
    generateHotpCode(secretBytes, counter + 1, algorithm, digits),
  ])

  const secretHex = Array.from(secretBytes, b => b.toString(16).padStart(2, '0')).join('')

  return {
    code,
    nextCode,
    counter,
    secondsRemaining,
    period,
    secretHex,
  }
}

export function buildOtpAuthUri(params: {
  mode: OtpMode
  issuer: string
  account: string
  secret: string
  algorithm: OtpAlgorithm
  digits: 6 | 7 | 8
  period?: number
  counter?: number
}): string {
  const cleanSecret = params.secret.replace(/\s+/g, '').replace(/=+$/, '').toUpperCase()
  const issuerClean = params.issuer.trim()
  const accountClean = params.account.trim() || 'user@example.com'
  const label = issuerClean
    ? `${encodeURIComponent(issuerClean)}:${encodeURIComponent(accountClean)}`
    : encodeURIComponent(accountClean)

  const query = new URLSearchParams()
  query.set('secret', cleanSecret)
  if (issuerClean) query.set('issuer', issuerClean)
  query.set('algorithm', params.algorithm.replace('-', ''))
  query.set('digits', String(params.digits))

  if (params.mode === 'totp') {
    query.set('period', String(params.period ?? 30))
  } else {
    query.set('counter', String(params.counter ?? 0))
  }

  return `otpauth://${params.mode}/${label}?${query.toString()}`
}

export function parseOtpAuthUri(uri: string): ParsedOtpAuthUri {
  const trimmed = uri.trim()
  if (!trimmed.toLowerCase().startsWith('otpauth://')) {
    throw new Error('URI must start with otpauth://totp/ or otpauth://hotp/')
  }

  const parsed = new URL(trimmed)
  const modeRaw = parsed.hostname.toLowerCase()
  if (modeRaw !== 'totp' && modeRaw !== 'hotp') {
    throw new Error(`Unsupported OTP type "${modeRaw}". Expected "totp" or "hotp".`)
  }

  const secret = parsed.searchParams.get('secret')?.trim() ?? ''
  if (!secret) {
    throw new Error('Missing required "secret" query parameter in otpauth URI.')
  }
  // Validate Base32
  decodeBase32Bytes(secret)

  const rawLabel = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  let issuerFromLabel = ''
  let account = rawLabel
  if (rawLabel.includes(':')) {
    const idx = rawLabel.indexOf(':')
    issuerFromLabel = rawLabel.slice(0, idx).trim()
    account = rawLabel.slice(idx + 1).trim()
  }

  const issuer = parsed.searchParams.get('issuer')?.trim() || issuerFromLabel
  const algRaw = (parsed.searchParams.get('algorithm') || 'SHA1').toUpperCase().replace(/[^A-Z0-9]/g, '')
  const algorithm: OtpAlgorithm =
    algRaw === 'SHA256' ? 'SHA-256' : algRaw === 'SHA512' ? 'SHA-512' : 'SHA-1'

  const digitsNum = Number(parsed.searchParams.get('digits') || 6)
  const digits: 6 | 7 | 8 = digitsNum === 8 ? 8 : digitsNum === 7 ? 7 : 6

  const periodNum = Number(parsed.searchParams.get('period') || 30)
  const period = Number.isFinite(periodNum) && periodNum >= 5 ? Math.floor(periodNum) : 30

  const counterNum = Number(parsed.searchParams.get('counter') || 0)
  const counter = Number.isInteger(counterNum) && counterNum >= 0 ? counterNum : 0

  return {
    mode: modeRaw,
    label: rawLabel,
    issuer,
    account,
    secret: secret.toUpperCase(),
    algorithm,
    digits,
    period,
    counter,
  }
}
