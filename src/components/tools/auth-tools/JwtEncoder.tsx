import { useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import SectionPanel from '../../ui/SectionPanel'
import {
  encodeJwt,
  createDefaultHeader,
  createDefaultPayload,
  SAMPLE_SECRET,
  SAMPLE_HEADER,
  SAMPLE_PAYLOAD,
  type JwtAlgorithm,
  type JwtHeader,
  type JwtPayload,
} from '../../../utils/jwtEncoder'
import { getErrorMessage } from '../../../utils/errors'

const ALGORITHMS: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512']

export default function JwtEncoder() {
  const [headerText, setHeaderText] = useState(JSON.stringify(createDefaultHeader(), null, 2))
  const [payloadText, setPayloadText] = useState(JSON.stringify(createDefaultPayload({ subject: 'user_123', expiresInMinutes: 60 }), null, 2))
  const [secret, setSecret] = useState(SAMPLE_SECRET)
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>('HS256')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const handleEncode = async () => {
    setError('')
    setToken('')
    try {
      const header: JwtHeader = JSON.parse(headerText)
      const payload: JwtPayload = JSON.parse(payloadText)

      // Override algorithm in header to match selection
      header.alg = algorithm

      const encoded = await encodeJwt(header, payload, secret, algorithm)
      setToken(encoded)
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to encode JWT'))
    }
  }

  const loadSample = () => {
    setHeaderText(JSON.stringify(SAMPLE_HEADER, null, 2))
    setPayloadText(JSON.stringify(SAMPLE_PAYLOAD, null, 2))
    setSecret(SAMPLE_SECRET)
    setAlgorithm('HS256')
    setError('')
    setToken('')
  }

  const parts = token.split('.')

  return (
    <ToolLayout
      title="JWT Encoder & Token Generator"
      description="Create and sign JSON Web Tokens with HMAC algorithms (HS256/HS384/HS512) entirely in your browser"
      tag="auth"
    >
      <div className="space-y-5">
        {/* Algorithm selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-dim font-mono">Algorithm:</label>
          <div className="flex gap-1.5">
            {ALGORITHMS.map(alg => (
              <button
                key={alg}
                type="button"
                onClick={() => setAlgorithm(alg)}
                className={`chip text-[11px] ${algorithm === alg ? 'chip-active' : ''}`}
              >
                {alg}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={loadSample}
            className="text-xs text-subtle hover:text-dim transition-colors font-mono ml-auto"
          >
            ← load sample
          </button>
        </div>

        {/* Header */}
        <SectionPanel label="Header (JSON)">
          <textarea
            value={headerText}
            onChange={e => setHeaderText(e.target.value)}
            className="textarea-base h-24 font-mono text-xs"
            placeholder='{"alg": "HS256", "typ": "JWT"}'
            spellCheck={false}
          />
        </SectionPanel>

        {/* Payload */}
        <SectionPanel label="Payload (JSON Claims)">
          <textarea
            value={payloadText}
            onChange={e => setPayloadText(e.target.value)}
            className="textarea-base h-36 font-mono text-xs"
            placeholder='{"sub": "user_123", "name": "Alice"}'
            spellCheck={false}
          />
        </SectionPanel>

        {/* Secret */}
        <div>
          <label className="block text-xs text-dim font-mono mb-1.5">Signing Secret Key</label>
          <input
            type="text"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Enter your secret key"
            className="input-base"
          />
          <p className="text-[10px] font-mono text-muted mt-1">
            Secret is used only for HMAC signing and never leaves your browser.
          </p>
        </div>

        {/* Generate button */}
        <div className="flex gap-2">
          <button type="button" onClick={handleEncode} className="btn-primary flex-1">
            Generate JWT Token
          </button>
        </div>

        <ErrorBanner message={error} />

        {/* Output */}
        {token && (
          <SectionPanel label="Generated JWT Token">
            {/* Coloured token display */}
            <div className="mb-3 font-mono text-[11px] break-all leading-relaxed px-3 py-2 bg-surface border border-border rounded">
              <span className="text-[#e06c75]">{parts[0]}</span>
              <span className="text-subtle">.</span>
              <span className="text-[#61afef]">{parts[1]}</span>
              <span className="text-subtle">.</span>
              <span className="text-[#98c379]">{parts[2]}</span>
            </div>

            {/* Token parts breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                <span className="text-[10px] font-mono min-w-[56px] flex-shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#e06c75] mr-1.5 align-middle" />
                  Header
                </span>
                <span className="font-mono text-[10px] text-subtle break-all">{parts[0]}</span>
              </div>
              <div className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                <span className="text-[10px] font-mono min-w-[56px] flex-shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#61afef] mr-1.5 align-middle" />
                  Payload
                </span>
                <span className="font-mono text-[10px] text-subtle break-all">{parts[1]}</span>
              </div>
              <div className="flex items-start gap-3 py-1.5">
                <span className="text-[10px] font-mono min-w-[56px] flex-shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#98c379] mr-1.5 align-middle" />
                  Signature
                </span>
                <span className="font-mono text-[10px] text-subtle break-all">{parts[2]}</span>
              </div>
            </div>

            <CopyButton text={token} size="md" />

            <p className="text-[10px] font-mono text-muted mt-3">
              All signing is performed using the Web Crypto API ({`window.crypto.subtle`}) — your secret key never leaves this browser.
            </p>
          </SectionPanel>
        )}
      </div>
    </ToolLayout>
  )
}
