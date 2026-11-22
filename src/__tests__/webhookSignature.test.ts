import { describe, it, expect } from 'vitest'
import {
  constantTimeEqual,
  parseStandardWebhookSignatures,
  parseStripeSignatureHeader,
  signWebhookPayload,
  verifyWebhookSignature,
} from '../utils/webhookSignature'

describe('webhookSignature utilities', () => {
  it('compares strings in constant time', () => {
    expect(constantTimeEqual('abc123', 'abc123')).toBe(true)
    expect(constantTimeEqual('abc123', 'abc124')).toBe(false)
    expect(constantTimeEqual('abc', 'abcd')).toBe(false)
  })

  it('signs and verifies Stripe webhooks including rotation and replay tolerance', async () => {
    const rawBody = '{"id":"evt_1","type":"charge.succeeded"}'
    const secret = 'whsec_test_stripe_key'
    const now = 1_700_000_500

    const signed = await signWebhookPayload({
      provider: 'stripe',
      rawBody,
      secret,
      timestampSeconds: now - 30,
    })

    const verified = await verifyWebhookSignature({
      provider: 'stripe',
      rawBody,
      secret,
      signatureHeader: signed.headers['Stripe-Signature'],
      toleranceSeconds: 300,
      nowSeconds: now,
    })

    expect(verified.valid).toBe(true)
    expect(verified.status).toBe('verified')
    expect(verified.signedPayload).toBe(`${now - 30}.${rawBody}`)

    // Multi-v1 rotation header: first v1 is old/invalid, second is valid
    const rotatedHeader = `t=${now - 30},v1=deadbeef,${signed.headers['Stripe-Signature'].split(',')[1]}`
    const rotatedResult = await verifyWebhookSignature({
      provider: 'stripe',
      rawBody,
      secret,
      signatureHeader: rotatedHeader,
      toleranceSeconds: 300,
      nowSeconds: now,
    })
    expect(rotatedResult.valid).toBe(true)

    // Expired timestamp
    const expired = await verifyWebhookSignature({
      provider: 'stripe',
      rawBody,
      secret,
      signatureHeader: signed.headers['Stripe-Signature'],
      toleranceSeconds: 10,
      nowSeconds: now,
    })
    expect(expired.valid).toBe(false)
    expect(expired.status).toBe('expired')
  })

  it('signs and verifies GitHub sha256 webhooks and detects tampered bodies', async () => {
    const rawBody = '{"action":"opened","number":42}'
    const secret = 'github_secret_123'
    const signed = await signWebhookPayload({ provider: 'github', rawBody, secret })

    expect(signed.headers['X-Hub-Signature-256']).toMatch(/^sha256=[0-9a-f]{64}$/)

    const ok = await verifyWebhookSignature({
      provider: 'github',
      rawBody,
      secret,
      signatureHeader: signed.headers['X-Hub-Signature-256'],
    })
    expect(ok.valid).toBe(true)

    const tampered = await verifyWebhookSignature({
      provider: 'github',
      rawBody: '{"action": "opened", "number": 42}', // changed spacing
      secret,
      signatureHeader: signed.headers['X-Hub-Signature-256'],
    })
    expect(tampered.valid).toBe(false)
    expect(tampered.status).toBe('mismatch')
  })

  it('signs and verifies Slack v0 webhooks', async () => {
    const rawBody = 'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J'
    const secret = '8f742231b10e8888abcd99yyyzzz85a5'
    const ts = 1531420618

    const signed = await signWebhookPayload({
      provider: 'slack',
      rawBody,
      secret,
      timestampSeconds: ts,
    })

    expect(signed.signedPayload).toBe(`v0:${ts}:${rawBody}`)

    const verified = await verifyWebhookSignature({
      provider: 'slack',
      rawBody,
      secret,
      signatureHeader: signed.headers['X-Slack-Signature'],
      timestampHeader: String(ts),
      toleranceSeconds: 300,
      nowSeconds: ts + 60,
    })
    expect(verified.valid).toBe(true)
  })

  it('signs and verifies Shopify base64 HMAC webhooks', async () => {
    const rawBody = '{"id":12345,"total_price":"19.99"}'
    const secret = 'shopify_secret'
    const signed = await signWebhookPayload({ provider: 'shopify', rawBody, secret })

    const verified = await verifyWebhookSignature({
      provider: 'shopify',
      rawBody,
      secret,
      signatureHeader: signed.headers['X-Shopify-Hmac-Sha256'],
    })
    expect(verified.valid).toBe(true)
  })

  it('signs and verifies Standard Webhooks / Svix with whsec_ Base64 keys', async () => {
    const rawBody = '{"type":"invoice.paid"}'
    const secret = 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw'
    const ts = 1_700_000_000
    const msgId = 'msg_abc123'

    const signed = await signWebhookPayload({
      provider: 'standard-webhooks',
      rawBody,
      secret,
      timestampSeconds: ts,
      webhookId: msgId,
    })

    expect(signed.headers['webhook-signature']).toMatch(/^v1,/)

    const verified = await verifyWebhookSignature({
      provider: 'standard-webhooks',
      rawBody,
      secret,
      signatureHeader: `v1,invalidSig== ${signed.headers['webhook-signature']}`,
      timestampHeader: String(ts),
      webhookIdHeader: msgId,
      toleranceSeconds: 300,
      nowSeconds: ts + 10,
    })
    expect(verified.valid).toBe(true)
    expect(verified.signedPayload).toBe(`${msgId}.${ts}.${rawBody}`)
  })

  it('parses Stripe and Standard Webhook signature headers cleanly', () => {
    expect(parseStripeSignatureHeader('t=1700,v1=abc,v1=def')).toEqual({
      timestamp: 1700,
      signatures: ['abc', 'def'],
    })
    expect(parseStripeSignatureHeader('v1=abc').error).toMatch(/Missing "t="/)
    expect(parseStandardWebhookSignatures('v1,aaa= v2,bbb= v1,ccc=')).toEqual(['aaa=', 'ccc='])
  })
})
