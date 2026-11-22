export type WebhookProvider = 'stripe' | 'github' | 'slack' | 'shopify' | 'standard-webhooks'

export interface ProviderSpec {
  id: WebhookProvider
  label: string
  headerName: string
  usesTimestamp: boolean
  usesWebhookId: boolean
  secretPlaceholder: string
  signaturePlaceholder: string
  description: string
}

export const WEBHOOK_PROVIDERS: ReadonlyArray<ProviderSpec> = [
  {
    id: 'stripe',
    label: 'Stripe',
    headerName: 'Stripe-Signature',
    usesTimestamp: true,
    usesWebhookId: false,
    secretPlaceholder: 'whsec_...',
    signaturePlaceholder: 't=1700000000,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd',
    description: 'Signs `${t}.${rawBody}` with HMAC-SHA256 (lowercase hex) via the Stripe-Signature header.',
  },
  {
    id: 'github',
    label: 'GitHub',
    headerName: 'X-Hub-Signature-256',
    usesTimestamp: false,
    usesWebhookId: false,
    secretPlaceholder: 'your-github-webhook-secret',
    signaturePlaceholder: 'sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17',
    description: 'Signs `${rawBody}` with HMAC-SHA256 (sha256=hex) or legacy HMAC-SHA1 (sha1=hex).',
  },
  {
    id: 'slack',
    label: 'Slack',
    headerName: 'X-Slack-Signature',
    usesTimestamp: true,
    usesWebhookId: false,
    secretPlaceholder: '8f742231b10e8888abcd99yyyzzz85a5',
    signaturePlaceholder: 'v0=a2114d57b48eac39b9ad189dd6316235a7b4a8d41a1108c47843f47f4b9c1f09',
    description: 'Signs `v0:${timestamp}:${rawBody}` with HMAC-SHA256 (v0=hex) using X-Slack-Request-Timestamp.',
  },
  {
    id: 'shopify',
    label: 'Shopify',
    headerName: 'X-Shopify-Hmac-Sha256',
    usesTimestamp: false,
    usesWebhookId: false,
    secretPlaceholder: 'hush',
    signaturePlaceholder: 'base64-encoded-hmac-sha256',
    description: 'Signs `${rawBody}` with HMAC-SHA256 and encodes the digest as Base64.',
  },
  {
    id: 'standard-webhooks',
    label: 'Standard Webhooks / Svix',
    headerName: 'webhook-signature',
    usesTimestamp: true,
    usesWebhookId: true,
    secretPlaceholder: 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw',
    signaturePlaceholder: 'v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=',
    description: 'Signs `${webhook-id}.${webhook-timestamp}.${rawBody}` using a Base64 secret (whsec_...) and Base64 v1 signatures.',
  },
]

export interface VerifyWebhookParams {
  provider: WebhookProvider
  rawBody: string
  secret: string
  signatureHeader: string
  timestampHeader?: string
  webhookIdHeader?: string
  toleranceSeconds?: number
  nowSeconds?: number
}

export type VerifyStatus = 'verified' | 'mismatch' | 'expired' | 'invalid-input'

export interface VerifyWebhookResult {
  valid: boolean
  status: VerifyStatus
  reason: string
  headerName: string
  expectedSignature: string
  receivedSignatures: string[]
  signedPayload: string
  timestampSeconds?: number
  timestampAgeSeconds?: number
  algorithm: 'HMAC-SHA256' | 'HMAC-SHA1'
  keyEncodingNote: string
}

export interface SignWebhookParams {
  provider: WebhookProvider
  rawBody: string
  secret: string
  timestampSeconds?: number
  webhookId?: string
}

export interface SignWebhookResult {
  headers: Record<string, string>
  signedPayload: string
  signatureValue: string
  curlCommand: string
  timestampSeconds?: number
  webhookId?: string
}

export function constantTimeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0
    const cb = i < b.length ? b.charCodeAt(i) : 0
    diff |= ca ^ cb
  }
  return diff === 0
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToBytes(b64: string): Uint8Array {
  const cleaned = b64.trim()
  const binary = atob(cleaned)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function computeHmacBytes(
  keyBytes: Uint8Array,
  message: string,
  algo: 'SHA-256' | 'SHA-1' = 'SHA-256'
): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto API is not available in this environment')
  }
  const encoder = new TextEncoder()
  const keyCopy = new Uint8Array(keyBytes.length)
  keyCopy.set(keyBytes)
  const cryptoKey = await subtle.importKey(
    'raw',
    keyCopy.buffer,
    { name: 'HMAC', hash: { name: algo } },
    false,
    ['sign']
  )
  const msgBytes = encoder.encode(message)
  const sigBuffer = await subtle.sign('HMAC', cryptoKey, msgBytes)
  return new Uint8Array(sigBuffer)
}

export function parseStripeSignatureHeader(header: string): {
  timestamp: number | null
  signatures: string[]
  error?: string
} {
  const trimmed = header.trim()
  if (!trimmed) {
    return { timestamp: null, signatures: [], error: 'Stripe-Signature header is empty.' }
  }
  let timestamp: number | null = null
  const signatures: string[] = []
  for (const part of trimmed.split(',')) {
    const eqIndex = part.indexOf('=')
    if (eqIndex <= 0) continue
    const key = part.slice(0, eqIndex).trim()
    const val = part.slice(eqIndex + 1).trim()
    if (!val) continue
    if (key === 't') {
      const parsed = Number(val)
      if (!Number.isInteger(parsed) || parsed < 0) {
        return { timestamp: null, signatures: [], error: `Invalid Stripe timestamp "t=${val}".` }
      }
      timestamp = parsed
    } else if (key === 'v1') {
      signatures.push(val.toLowerCase())
    }
  }
  if (timestamp === null) {
    return { timestamp: null, signatures, error: 'Missing "t=" timestamp in Stripe-Signature header.' }
  }
  if (signatures.length === 0) {
    return { timestamp, signatures, error: 'Missing "v1=" signature in Stripe-Signature header.' }
  }
  return { timestamp, signatures }
}

export function parseStandardWebhookSignatures(header: string): string[] {
  const trimmed = header.trim()
  if (!trimmed) return []
  const results: string[] = []
  for (const token of trimmed.split(/\s+/)) {
    const commaIdx = token.indexOf(',')
    if (commaIdx <= 0) continue
    const version = token.slice(0, commaIdx)
    const sig = token.slice(commaIdx + 1)
    if (version === 'v1' && sig) {
      results.push(sig)
    }
  }
  return results
}

function resolveStandardWebhookSecret(secret: string): { keyBytes: Uint8Array; note: string } {
  const trimmed = secret.trim()
  if (trimmed.startsWith('whsec_')) {
    const b64Part = trimmed.slice('whsec_'.length)
    try {
      return {
        keyBytes: base64ToBytes(b64Part),
        note: 'Base64-decoded after stripping whsec_ prefix (Standard Webhooks spec)',
      }
    } catch {
      throw new Error('Secret starts with whsec_ but the remainder is not valid Base64.')
    }
  }
  try {
    // Standard Webhooks raw secrets without prefix can still be base64 if padded or valid base64,
    // otherwise fall back to UTF-8 bytes.
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0) {
      return {
        keyBytes: base64ToBytes(trimmed),
        note: 'Base64-decoded secret key',
      }
    }
  } catch {
    // fall through to UTF-8
  }
  return {
    keyBytes: new TextEncoder().encode(trimmed),
    note: 'UTF-8 secret key bytes',
  }
}

export async function verifyWebhookSignature(params: VerifyWebhookParams): Promise<VerifyWebhookResult> {
  const {
    provider,
    rawBody,
    secret,
    signatureHeader,
    timestampHeader = '',
    webhookIdHeader = '',
    toleranceSeconds = 300,
    nowSeconds = Math.floor(Date.now() / 1000),
  } = params

  const spec = WEBHOOK_PROVIDERS.find(p => p.id === provider)!
  const encoder = new TextEncoder()

  if (!secret) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: 'Enter a webhook signing secret to verify the signature.',
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: [],
      signedPayload: '',
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  if (!signatureHeader.trim()) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: `Enter the incoming ${spec.headerName} header value.`,
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: [],
      signedPayload: '',
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  if (provider === 'stripe') {
    const parsed = parseStripeSignatureHeader(signatureHeader)
    if (parsed.error || parsed.timestamp === null) {
      return {
        valid: false,
        status: 'invalid-input',
        reason: parsed.error || 'Malformed Stripe-Signature header.',
        headerName: spec.headerName,
        expectedSignature: '',
        receivedSignatures: parsed.signatures,
        signedPayload: '',
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    const signedPayload = `${parsed.timestamp}.${rawBody}`
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    const expected = bytesToHex(digest)
    const sigMatch = parsed.signatures.some(sig => constantTimeEqual(sig, expected))
    const age = nowSeconds - parsed.timestamp

    if (!sigMatch) {
      return {
        valid: false,
        status: 'mismatch',
        reason: 'HMAC-SHA256 signature mismatch. Check that the raw body (including whitespace/newlines) and signing secret match.',
        headerName: spec.headerName,
        expectedSignature: `v1=${expected}`,
        receivedSignatures: parsed.signatures.map(s => `v1=${s}`),
        signedPayload,
        timestampSeconds: parsed.timestamp,
        timestampAgeSeconds: age,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    if (toleranceSeconds > 0 && Math.abs(age) > toleranceSeconds) {
      return {
        valid: false,
        status: 'expired',
        reason: `Signature matches cryptographically, but timestamp is ${Math.abs(age)}s away from current time (tolerance: ${toleranceSeconds}s).`,
        headerName: spec.headerName,
        expectedSignature: `v1=${expected}`,
        receivedSignatures: parsed.signatures.map(s => `v1=${s}`),
        signedPayload,
        timestampSeconds: parsed.timestamp,
        timestampAgeSeconds: age,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    return {
      valid: true,
      status: 'verified',
      reason: 'Stripe-Signature v1 matches and timestamp is within tolerance.',
      headerName: spec.headerName,
      expectedSignature: `v1=${expected}`,
      receivedSignatures: parsed.signatures.map(s => `v1=${s}`),
      signedPayload,
      timestampSeconds: parsed.timestamp,
      timestampAgeSeconds: age,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  if (provider === 'github') {
    const trimmed = signatureHeader.trim()
    const isSha1 = trimmed.toLowerCase().startsWith('sha1=')
    const isSha256 = trimmed.toLowerCase().startsWith('sha256=')
    if (!isSha1 && !isSha256) {
      return {
        valid: false,
        status: 'invalid-input',
        reason: 'GitHub signature must start with "sha256=" or legacy "sha1=".',
        headerName: spec.headerName,
        expectedSignature: '',
        receivedSignatures: [trimmed],
        signedPayload: rawBody,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    const algo: 'SHA-256' | 'SHA-1' = isSha1 ? 'SHA-1' : 'SHA-256'
    const prefix = isSha1 ? 'sha1=' : 'sha256='
    const receivedHex = trimmed.slice(prefix.length).toLowerCase()
    const digest = await computeHmacBytes(encoder.encode(secret), rawBody, algo)
    const expectedHex = bytesToHex(digest)
    const sigMatch = constantTimeEqual(receivedHex, expectedHex)

    return {
      valid: sigMatch,
      status: sigMatch ? 'verified' : 'mismatch',
      reason: sigMatch
        ? `GitHub ${prefix.slice(0, -1).toUpperCase()} signature matches.`
        : 'GitHub HMAC signature mismatch. Ensure the raw JSON body has not been re-formatted or re-encoded.',
      headerName: isSha1 ? 'X-Hub-Signature' : spec.headerName,
      expectedSignature: `${prefix}${expectedHex}`,
      receivedSignatures: [trimmed.toLowerCase()],
      signedPayload: rawBody,
      algorithm: isSha1 ? 'HMAC-SHA1' : 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  if (provider === 'slack') {
    const tsStr = timestampHeader.trim()
    const timestamp = Number(tsStr)
    if (!tsStr || !Number.isInteger(timestamp) || timestamp < 0) {
      return {
        valid: false,
        status: 'invalid-input',
        reason: 'Enter a valid Unix seconds integer for X-Slack-Request-Timestamp.',
        headerName: spec.headerName,
        expectedSignature: '',
        receivedSignatures: [signatureHeader.trim()],
        signedPayload: '',
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    const trimmed = signatureHeader.trim().toLowerCase()
    if (!trimmed.startsWith('v0=')) {
      return {
        valid: false,
        status: 'invalid-input',
        reason: 'X-Slack-Signature must start with "v0=".',
        headerName: spec.headerName,
        expectedSignature: '',
        receivedSignatures: [trimmed],
        signedPayload: '',
        timestampSeconds: timestamp,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    const signedPayload = `v0:${tsStr}:${rawBody}`
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    const expected = `v0=${bytesToHex(digest)}`
    const sigMatch = constantTimeEqual(trimmed, expected)
    const age = nowSeconds - timestamp

    if (!sigMatch) {
      return {
        valid: false,
        status: 'mismatch',
        reason: 'Slack HMAC-SHA256 signature mismatch.',
        headerName: spec.headerName,
        expectedSignature: expected,
        receivedSignatures: [trimmed],
        signedPayload,
        timestampSeconds: timestamp,
        timestampAgeSeconds: age,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    if (toleranceSeconds > 0 && Math.abs(age) > toleranceSeconds) {
      return {
        valid: false,
        status: 'expired',
        reason: `Slack signature matches, but request timestamp is ${Math.abs(age)}s from current time (tolerance: ${toleranceSeconds}s).`,
        headerName: spec.headerName,
        expectedSignature: expected,
        receivedSignatures: [trimmed],
        signedPayload,
        timestampSeconds: timestamp,
        timestampAgeSeconds: age,
        algorithm: 'HMAC-SHA256',
        keyEncodingNote: 'UTF-8 secret bytes',
      }
    }

    return {
      valid: true,
      status: 'verified',
      reason: 'Slack v0 signature matches and timestamp is within tolerance.',
      headerName: spec.headerName,
      expectedSignature: expected,
      receivedSignatures: [trimmed],
      signedPayload,
      timestampSeconds: timestamp,
      timestampAgeSeconds: age,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  if (provider === 'shopify') {
    const trimmed = signatureHeader.trim()
    const digest = await computeHmacBytes(encoder.encode(secret), rawBody, 'SHA-256')
    const expected = bytesToBase64(digest)
    const sigMatch = constantTimeEqual(trimmed, expected)

    return {
      valid: sigMatch,
      status: sigMatch ? 'verified' : 'mismatch',
      reason: sigMatch
        ? 'Shopify Base64 HMAC-SHA256 signature matches.'
        : 'Shopify HMAC-SHA256 signature mismatch.',
      headerName: spec.headerName,
      expectedSignature: expected,
      receivedSignatures: [trimmed],
      signedPayload: rawBody,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'UTF-8 secret bytes',
    }
  }

  // standard-webhooks
  const webhookId = webhookIdHeader.trim()
  const tsStr = timestampHeader.trim()
  const timestamp = Number(tsStr)
  if (!webhookId) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: 'Enter the webhook-id header value.',
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: [],
      signedPayload: '',
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'Standard Webhooks key',
    }
  }
  if (!tsStr || !Number.isInteger(timestamp) || timestamp < 0) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: 'Enter a valid Unix seconds integer for webhook-timestamp.',
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: [],
      signedPayload: '',
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'Standard Webhooks key',
    }
  }

  const receivedSigs = parseStandardWebhookSignatures(signatureHeader)
  if (receivedSigs.length === 0) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: 'No "v1,<base64>" signatures found in webhook-signature header.',
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: [],
      signedPayload: '',
      timestampSeconds: timestamp,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'Standard Webhooks key',
    }
  }

  let resolvedKey: { keyBytes: Uint8Array; note: string }
  try {
    resolvedKey = resolveStandardWebhookSecret(secret)
  } catch (err) {
    return {
      valid: false,
      status: 'invalid-input',
      reason: err instanceof Error ? err.message : 'Invalid Standard Webhooks secret.',
      headerName: spec.headerName,
      expectedSignature: '',
      receivedSignatures: receivedSigs.map(s => `v1,${s}`),
      signedPayload: '',
      timestampSeconds: timestamp,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: 'Base64 secret key',
    }
  }

  const signedPayload = `${webhookId}.${tsStr}.${rawBody}`
  const digest = await computeHmacBytes(resolvedKey.keyBytes, signedPayload, 'SHA-256')
  const expectedB64 = bytesToBase64(digest)
  const sigMatch = receivedSigs.some(sig => constantTimeEqual(sig, expectedB64))
  const age = nowSeconds - timestamp

  if (!sigMatch) {
    return {
      valid: false,
      status: 'mismatch',
      reason: 'Standard Webhooks v1 signature mismatch.',
      headerName: spec.headerName,
      expectedSignature: `v1,${expectedB64}`,
      receivedSignatures: receivedSigs.map(s => `v1,${s}`),
      signedPayload,
      timestampSeconds: timestamp,
      timestampAgeSeconds: age,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: resolvedKey.note,
    }
  }

  if (toleranceSeconds > 0 && Math.abs(age) > toleranceSeconds) {
    return {
      valid: false,
      status: 'expired',
      reason: `Standard Webhooks signature matches, but timestamp is ${Math.abs(age)}s from current time (tolerance: ${toleranceSeconds}s).`,
      headerName: spec.headerName,
      expectedSignature: `v1,${expectedB64}`,
      receivedSignatures: receivedSigs.map(s => `v1,${s}`),
      signedPayload,
      timestampSeconds: timestamp,
      timestampAgeSeconds: age,
      algorithm: 'HMAC-SHA256',
      keyEncodingNote: resolvedKey.note,
    }
  }

  return {
    valid: true,
    status: 'verified',
    reason: 'Standard Webhooks v1 signature matches and timestamp is within tolerance.',
    headerName: spec.headerName,
    expectedSignature: `v1,${expectedB64}`,
    receivedSignatures: receivedSigs.map(s => `v1,${s}`),
    signedPayload,
    timestampSeconds: timestamp,
    timestampAgeSeconds: age,
    algorithm: 'HMAC-SHA256',
    keyEncodingNote: resolvedKey.note,
  }
}

function shellEscapeSingleQuotes(str: string): string {
  return str.replace(/'/g, `'\\''`)
}

export async function signWebhookPayload(params: SignWebhookParams): Promise<SignWebhookResult> {
  const {
    provider,
    rawBody,
    secret,
    timestampSeconds = Math.floor(Date.now() / 1000),
    webhookId = 'msg_2c9example001',
  } = params

  if (!secret) {
    throw new Error('Enter a signing secret to generate a webhook signature.')
  }

  const encoder = new TextEncoder()
  let headers: Record<string, string> = {}
  let signedPayload = rawBody
  let signatureValue = ''

  if (provider === 'stripe') {
    signedPayload = `${timestampSeconds}.${rawBody}`
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    signatureValue = `t=${timestampSeconds},v1=${bytesToHex(digest)}`
    headers = { 'Stripe-Signature': signatureValue }
  } else if (provider === 'github') {
    signedPayload = rawBody
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    signatureValue = `sha256=${bytesToHex(digest)}`
    headers = { 'X-Hub-Signature-256': signatureValue }
  } else if (provider === 'slack') {
    signedPayload = `v0:${timestampSeconds}:${rawBody}`
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    signatureValue = `v0=${bytesToHex(digest)}`
    headers = {
      'X-Slack-Request-Timestamp': String(timestampSeconds),
      'X-Slack-Signature': signatureValue,
    }
  } else if (provider === 'shopify') {
    signedPayload = rawBody
    const digest = await computeHmacBytes(encoder.encode(secret), signedPayload, 'SHA-256')
    signatureValue = bytesToBase64(digest)
    headers = { 'X-Shopify-Hmac-Sha256': signatureValue }
  } else {
    const resolved = resolveStandardWebhookSecret(secret)
    signedPayload = `${webhookId}.${timestampSeconds}.${rawBody}`
    const digest = await computeHmacBytes(resolved.keyBytes, signedPayload, 'SHA-256')
    signatureValue = `v1,${bytesToBase64(digest)}`
    headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': String(timestampSeconds),
      'webhook-signature': signatureValue,
    }
  }

  const headerFlags = Object.entries(headers)
    .map(([k, v]) => `  -H '${k}: ${shellEscapeSingleQuotes(v)}'`)
    .join(' \\\n')

  const curlCommand = [
    `curl -X POST http://localhost:3000/webhook \\`,
    `  -H 'Content-Type: application/json' \\`,
    `${headerFlags} \\`,
    `  --data-raw '${shellEscapeSingleQuotes(rawBody)}'`,
  ].join('\n')

  return {
    headers,
    signedPayload,
    signatureValue,
    curlCommand,
    timestampSeconds: provider === 'github' || provider === 'shopify' ? undefined : timestampSeconds,
    webhookId: provider === 'standard-webhooks' ? webhookId : undefined,
  }
}
