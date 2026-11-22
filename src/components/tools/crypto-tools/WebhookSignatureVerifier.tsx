import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound, ShieldAlert, XCircle } from 'lucide-react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import TextInputField from '../../ui/TextInputField'
import ToggleGroup from '../../ui/ToggleGroup'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import {
  WEBHOOK_PROVIDERS,
  signWebhookPayload,
  verifyWebhookSignature,
  type SignWebhookResult,
  type VerifyWebhookResult,
  type WebhookProvider,
} from '../../../utils/webhookSignature'

type Mode = 'verify' | 'sign'

const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'verify', label: 'Verify Incoming' },
  { value: 'sign', label: 'Sign Test Request' },
]

const SAMPLE_BODIES: Record<WebhookProvider, string> = {
  stripe: '{"id":"evt_1Nexample","type":"payment_intent.succeeded","data":{"object":{"id":"pi_3Nexample","amount":4900,"currency":"usd"}}}',
  github: '{"action":"opened","number":42,"repository":{"full_name":"acme/toolbox"}}',
  slack: '{"token":"example","team_id":"T0001","type":"event_callback","event":{"type":"app_mention","text":"hello"}}',
  shopify: '{"id":820982911946154500,"email":"customer@example.com","total_price":"49.00"}',
  'standard-webhooks': '{"type":"invoice.paid","data":{"invoice_id":"inv_12345","amount_cents":2500}}',
}

const SAMPLE_SECRETS: Record<WebhookProvider, string> = {
  stripe: 'whsec_test_stripe_secret_9a8b7c',
  github: 'github_webhook_secret_key',
  slack: '8f742231b10e8888abcd99yyyzzz85a5',
  shopify: 'shopify_shared_secret_key',
  'standard-webhooks': 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw',
}

export default function WebhookSignatureVerifier() {
  const [provider, setProvider] = useState<WebhookProvider>('stripe')
  const [mode, setMode] = useState<Mode>('verify')
  const [rawBody, setRawBody] = useState<string>(SAMPLE_BODIES.stripe)
  const [secret, setSecret] = useState<string>(SAMPLE_SECRETS.stripe)
  const [signatureHeader, setSignatureHeader] = useState<string>('')
  const [timestampHeader, setTimestampHeader] = useState<string>('')
  const [webhookIdHeader, setWebhookIdHeader] = useState<string>('msg_2c9example001')
  const [toleranceSeconds, setToleranceSeconds] = useState<string>('300')
  const [ignoreTolerance, setIgnoreTolerance] = useState<boolean>(false)

  const [verifyResult, setVerifyResult] = useState<VerifyWebhookResult | null>(null)
  const [signResult, setSignResult] = useState<SignWebhookResult | null>(null)
  const [signError, setSignError] = useState<string>('')

  const activeSpec = WEBHOOK_PROVIDERS.find(p => p.id === provider)!

  const loadSample = useCallback(async (targetProvider: WebhookProvider) => {
    const body = SAMPLE_BODIES[targetProvider]
    const sec = SAMPLE_SECRETS[targetProvider]
    const nowTs = Math.floor(Date.now() / 1000)
    const msgId = 'msg_2c9example001'
    setProvider(targetProvider)
    setRawBody(body)
    setSecret(sec)
    setWebhookIdHeader(msgId)
    setTimestampHeader(String(nowTs))
    try {
      const signed = await signWebhookPayload({
        provider: targetProvider,
        rawBody: body,
        secret: sec,
        timestampSeconds: nowTs,
        webhookId: msgId,
      })
      const spec = WEBHOOK_PROVIDERS.find(p => p.id === targetProvider)!
      setSignatureHeader(signed.headers[spec.headerName] ?? signed.signatureValue)
    } catch {
      setSignatureHeader('')
    }
  }, [])

  useEffect(() => {
    void loadSample('stripe')
  }, [loadSample])

  useEffect(() => {
    if (mode !== 'verify') return
    let active = true
    const parsedTolerance = ignoreTolerance ? 0 : Math.max(0, Number(toleranceSeconds) || 0)
    verifyWebhookSignature({
      provider,
      rawBody,
      secret,
      signatureHeader,
      timestampHeader,
      webhookIdHeader,
      toleranceSeconds: parsedTolerance,
    })
      .then(res => {
        if (active) setVerifyResult(res)
      })
      .catch(err => {
        if (active) {
          setVerifyResult({
            valid: false,
            status: 'invalid-input',
            reason: err instanceof Error ? err.message : 'Verification failed.',
            headerName: activeSpec.headerName,
            expectedSignature: '',
            receivedSignatures: [],
            signedPayload: '',
            algorithm: 'HMAC-SHA256',
            keyEncodingNote: 'UTF-8 secret bytes',
          })
        }
      })
    return () => {
      active = false
    }
  }, [
    mode,
    provider,
    rawBody,
    secret,
    signatureHeader,
    timestampHeader,
    webhookIdHeader,
    toleranceSeconds,
    ignoreTolerance,
    activeSpec.headerName,
  ])

  const generateTestSignature = useCallback(async () => {
    setSignError('')
    try {
      const ts = timestampHeader.trim() ? Number(timestampHeader.trim()) : Math.floor(Date.now() / 1000)
      if (activeSpec.usesTimestamp && (!Number.isInteger(ts) || ts < 0)) {
        throw new Error('Timestamp must be a non-negative Unix seconds integer.')
      }
      const res = await signWebhookPayload({
        provider,
        rawBody,
        secret,
        timestampSeconds: ts,
        webhookId: webhookIdHeader.trim() || 'msg_2c9example001',
      })
      setSignResult(res)
    } catch (err) {
      setSignError(err instanceof Error ? err.message : 'Failed to generate signature.')
      setSignResult(null)
    }
  }, [provider, rawBody, secret, timestampHeader, webhookIdHeader, activeSpec.usesTimestamp])

  useEffect(() => {
    if (mode === 'sign') {
      void generateTestSignature()
    }
  }, [mode, generateTestSignature])

  const providerOptions = WEBHOOK_PROVIDERS.map(p => ({ value: p.id, label: p.label }))

  return (
    <ToolLayout
      title="Webhook Signature Verifier & Signer"
      description="Verify or generate Stripe, GitHub, Slack, Shopify, and Standard Webhooks signatures locally via Web Crypto"
      tag="webhook"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Webhook provider" className="flex flex-wrap gap-2">
            <ToggleGroup options={providerOptions} value={provider} onChange={p => void loadSample(p)} />
          </div>
          <div role="group" aria-label="Mode" className="flex flex-wrap gap-2">
            <ToggleGroup options={MODE_OPTIONS} value={mode} onChange={setMode} />
          </div>
        </div>

        <p className="text-xs font-mono text-dim">{activeSpec.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <SectionPanel
              title="Payload & Secret"
              action={
                <button type="button" onClick={() => void loadSample(provider)} className="btn-ghost text-xs py-1 px-2.5">
                  Reset sample
                </button>
              }
            >
              <div className="space-y-4">
                <TextInputField
                  label="Signing Secret"
                  value={secret}
                  onChange={setSecret}
                  placeholder={activeSpec.secretPlaceholder}
                />

                {activeSpec.usesWebhookId && (
                  <TextInputField
                    label="webhook-id Header"
                    value={webhookIdHeader}
                    onChange={setWebhookIdHeader}
                    placeholder="msg_2c9example001"
                  />
                )}

                {(provider === 'slack' || provider === 'standard-webhooks' || mode === 'sign') && activeSpec.usesTimestamp && (
                  <div className="flex items-end gap-2">
                    <TextInputField
                      label={provider === 'slack' ? 'X-Slack-Request-Timestamp (Unix seconds)' : 'Timestamp (Unix seconds)'}
                      value={timestampHeader}
                      onChange={setTimestampHeader}
                      placeholder={String(Math.floor(Date.now() / 1000))}
                      containerClassName="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setTimestampHeader(String(Math.floor(Date.now() / 1000)))}
                      className="btn-ghost shrink-0 whitespace-nowrap"
                    >
                      Now
                    </button>
                  </div>
                )}

                {mode === 'verify' && (
                  <TextInputField
                    label={`${activeSpec.headerName} Header`}
                    value={signatureHeader}
                    onChange={setSignatureHeader}
                    placeholder={activeSpec.signaturePlaceholder}
                  />
                )}

                <TextAreaField
                  label="Raw Request Body (exact bytes matter)"
                  value={rawBody}
                  onChange={setRawBody}
                  rows={6}
                  placeholder='{"event":"example"}'
                />

                {mode === 'verify' && activeSpec.usesTimestamp && (
                  <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
                    <TextInputField
                      label="Replay Tolerance (seconds)"
                      value={toleranceSeconds}
                      onChange={setToleranceSeconds}
                      type="number"
                      min={0}
                      disabled={ignoreTolerance}
                      containerClassName="w-48"
                      showClearButton={false}
                    />
                    <label className="flex items-center gap-2 text-xs font-mono text-dim cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={ignoreTolerance}
                        onChange={e => setIgnoreTolerance(e.target.checked)}
                      />
                      Ignore timestamp age (debug old captures)
                    </label>
                  </div>
                )}
              </div>
            </SectionPanel>
          </div>

          <div className="space-y-4">
            {mode === 'verify' ? (
              <SectionPanel title="Verification Result">
                {verifyResult ? (
                  <div className="space-y-4">
                    <div
                      role="status"
                      className={`rounded-md border p-3.5 flex items-start gap-3 ${
                        verifyResult.status === 'verified'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : verifyResult.status === 'expired'
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                            : verifyResult.status === 'mismatch'
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                              : 'border-border bg-surface text-dim'
                      }`}
                    >
                      {verifyResult.status === 'verified' && <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
                      {verifyResult.status === 'expired' && <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
                      {verifyResult.status === 'mismatch' && <XCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
                      {verifyResult.status === 'invalid-input' && <ShieldAlert size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold font-sans text-bright">
                          {verifyResult.status === 'verified' && 'Signature Verified'}
                          {verifyResult.status === 'expired' && 'Timestamp Outside Tolerance'}
                          {verifyResult.status === 'mismatch' && 'Signature Mismatch'}
                          {verifyResult.status === 'invalid-input' && 'Waiting for Complete Input'}
                        </div>
                        <p className="text-xs font-sans text-dim mt-0.5">{verifyResult.reason}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <StatCard label="Algorithm" value={verifyResult.algorithm} icon={KeyRound} />
                      <StatCard
                        label="Timestamp Age"
                        value={
                          verifyResult.timestampAgeSeconds !== undefined
                            ? `${verifyResult.timestampAgeSeconds >= 0 ? '+' : ''}${verifyResult.timestampAgeSeconds}s`
                            : 'N/A'
                        }
                        valueClassName="tabular-nums"
                      />
                    </div>

                    {verifyResult.expectedSignature && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-dim">Expected Signature</span>
                          <CopyButton text={verifyResult.expectedSignature} />
                        </div>
                        <pre className="p-2.5 rounded border border-border bg-surface text-xs font-mono text-bright break-all whitespace-pre-wrap">
                          {verifyResult.expectedSignature}
                        </pre>
                      </div>
                    )}

                    {verifyResult.receivedSignatures.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono text-dim">Received Signature(s)</span>
                        <pre className="p-2.5 rounded border border-border bg-surface text-xs font-mono text-dim break-all whitespace-pre-wrap">
                          {verifyResult.receivedSignatures.join('\n')}
                        </pre>
                      </div>
                    )}

                    {verifyResult.signedPayload && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-dim">
                            Exact Signed String ({verifyResult.keyEncodingNote})
                          </span>
                          <CopyButton text={verifyResult.signedPayload} />
                        </div>
                        <pre className="max-h-40 overflow-auto p-2.5 rounded border border-border bg-surface text-xs font-mono text-dim break-all whitespace-pre-wrap">
                          {verifyResult.signedPayload}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : null}
              </SectionPanel>
            ) : (
              <SectionPanel title="Generated Headers & Test Command">
                {signError && <ErrorBanner message={signError} />}
                {signResult && !signError && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {Object.entries(signResult.headers).map(([header, val]) => (
                        <div key={header} className="p-2.5 rounded border border-border bg-surface space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-semibold text-bright">{header}</span>
                            <CopyButton text={val} />
                          </div>
                          <div className="text-xs font-mono text-dim break-all">{val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-dim">Signed Payload String</span>
                        <CopyButton text={signResult.signedPayload} />
                      </div>
                      <pre className="max-h-32 overflow-auto p-2.5 rounded border border-border bg-surface text-xs font-mono text-dim break-all whitespace-pre-wrap">
                        {signResult.signedPayload}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-dim">Local Test cURL</span>
                        <CopyButton text={signResult.curlCommand} label="Copy cURL" />
                      </div>
                      <pre className="max-h-48 overflow-auto p-2.5 rounded border border-border bg-surface text-xs font-mono text-bright break-all whitespace-pre-wrap">
                        {signResult.curlCommand}
                      </pre>
                    </div>
                  </div>
                )}
              </SectionPanel>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
