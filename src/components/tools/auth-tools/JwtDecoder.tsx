import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import ErrorBanner from '../../ui/ErrorBanner'
import SectionPanel from '../../ui/SectionPanel'
import { decodeBase64Url } from '../../../utils/encoding'

interface DecodedJWT {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbGljZSBTbWl0aCIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts separated by dots')

  let header: Record<string, unknown>
  let payload: Record<string, unknown>

  try {
    header = JSON.parse(decodeBase64Url(parts[0]))
  } catch {
    throw new Error('Failed to decode header — invalid Base64URL or JSON')
  }

  try {
    payload = JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    throw new Error('Failed to decode payload — invalid Base64URL or JSON')
  }

  return { header, payload, signature: parts[2] }
}

function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== 'number') return null
  return new Date(ts * 1000).toUTCString()
}

function getExpiryStatus(exp: unknown): { label: string; expired: boolean } | null {
  if (typeof exp !== 'number') return null
  const now = Math.floor(Date.now() / 1000)
  const diff = exp - now
  if (diff < 0) {
    const ago = Math.abs(diff)
    const h = Math.floor(ago / 3600)
    const m = Math.floor((ago % 3600) / 60)
    return { label: `Expired ${h > 0 ? h + 'h ' : ''}${m}m ago`, expired: true }
  }
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return { label: `Expires in ${h > 0 ? h + 'h ' : ''}${m}m`, expired: false }
}

function JsonViewer({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data)
  const timeKeys = new Set(['iat', 'exp', 'nbf'])

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => {
        const isTime = timeKeys.has(key) && typeof value === 'number'
        const humanTime = isTime ? formatTimestamp(value) : null

        return (
          <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1.5 border-b border-border last:border-0">
            <span className="font-mono text-xs text-subtle min-w-[100px] flex-shrink-0">{key}</span>
            <div className="flex-1">
              <span className="font-mono text-xs text-bright break-all">
                {typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}
              </span>
              {humanTime && (
                <span className="block text-[10px] font-mono text-subtle mt-0.5">{humanTime}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [error, setError] = useState('')

  const decode = (value: string) => {
    setInput(value)
    setError('')
    setDecoded(null)
    if (!value.trim()) return
    try {
      setDecoded(decodeJWT(value.trim()))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const expiry = decoded ? getExpiryStatus(decoded.payload.exp) : null
  const parts = input.trim().split('.')

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JSON Web Tokens"
      tag="auth"
    >
      <div className="space-y-5">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-dim font-mono">Paste JWT Token</label>
            <button
              onClick={() => decode(SAMPLE_JWT)}
              className="text-xs text-subtle hover:text-dim transition-colors font-mono"
            >
              ← load example
            </button>
          </div>

          {/* Coloured token display */}
          {input && parts.length === 3 && (
            <div className="mb-2 font-mono text-[11px] break-all leading-relaxed px-3 py-2 bg-surface border border-border rounded">
              <span className="text-[#e06c75]">{parts[0]}</span>
              <span className="text-subtle">.</span>
              <span className="text-[#61afef]">{parts[1]}</span>
              <span className="text-subtle">.</span>
              <span className="text-[#98c379]">{parts[2]}</span>
            </div>
          )}

          <textarea
            value={input}
            onChange={e => decode(e.target.value)}
            className="textarea-base h-24"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            spellCheck={false}
          />
        </div>

        <ErrorBanner message={error} />

        {decoded && (
          <>
            {/* Status bar */}
            <div className="flex flex-wrap gap-3 items-center py-2.5 px-3 bg-surface border border-border rounded text-xs font-mono">
              <span className="text-dim">
                alg: <span className="text-bright">{String(decoded.header.alg ?? '—')}</span>
              </span>
              <span className="text-dim">
                typ: <span className="text-bright">{String(decoded.header.typ ?? '—')}</span>
              </span>
              {expiry && (
                <span className={`ml-auto ${expiry.expired ? 'text-subtle line-through' : 'text-bright'}`}>
                  {expiry.expired ? '✗' : '✓'} {expiry.label}
                </span>
              )}
            </div>

            {/* Three sections */}
            <div className="space-y-3">
              <SectionPanel
                label="Header"
                dot="bg-[#e06c75]"
                copyText={JSON.stringify(decoded.header, null, 2)}
              >
                <JsonViewer data={decoded.header} />
              </SectionPanel>

              <SectionPanel
                label="Payload"
                dot="bg-[#61afef]"
                copyText={JSON.stringify(decoded.payload, null, 2)}
              >
                <JsonViewer data={decoded.payload} />
              </SectionPanel>

              <SectionPanel
                label="Signature"
                dot="bg-[#98c379]"
                copyText={decoded.signature}
              >
                <p className="font-mono text-xs text-subtle break-all">{decoded.signature}</p>
                <p className="text-[10px] font-sans text-muted mt-2">
                  Signature verification requires the secret key and cannot be done client-side.
                </p>
              </SectionPanel>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}