import { useState, useEffect, useCallback } from 'react'
import ToolLayout from '../../ToolLayout'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import CopyButton from '../../CopyButton'

type Algo = 'SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512'
type KeyEncoding = 'utf8' | 'hex' | 'base64'
type OutputEncoding = 'hex-lower' | 'hex-upper' | 'base64' | 'base64url'

export default function HmacGenerator() {
  const [message, setMessage] = useState<string>('{"event":"payment_intent.succeeded","amount":4900,"currency":"usd"}')
  const [secretKey, setSecretKey] = useState<string>('whsec_3F28A1C9E48201B79D')
  const [algo, setAlgo] = useState<Algo>('SHA-256')
  const [keyEncoding, setKeyEncoding] = useState<KeyEncoding>('utf8')
  const [outputEncoding, setOutputEncoding] = useState<OutputEncoding>('hex-lower')

  const [hmacResult, setHmacResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const computeHmac = useCallback(async () => {
    if (!message || !secretKey) {
      setHmacResult('')
      setError(null)
      return
    }

    try {
      const encoder = new TextEncoder()
      let keyData: Uint8Array

      if (keyEncoding === 'utf8') {
        keyData = encoder.encode(secretKey)
      } else if (keyEncoding === 'hex') {
        const cleanHex = secretKey.replace(/[^0-9a-fA-F]/g, '')
        if (cleanHex.length % 2 !== 0) {
          throw new Error('Hex secret key must have an even number of characters')
        }
        keyData = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
      } else {
        // Base64
        const binaryStr = atob(secretKey.trim())
        keyData = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          keyData[i] = binaryStr.charCodeAt(i)
        }
      }

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: algo } },
        false,
        ['sign']
      )

      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(message)
      )

      const signatureArray = new Uint8Array(signatureBuffer)

      if (outputEncoding === 'hex-lower') {
        const hex = Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('')
        setHmacResult(hex)
      } else if (outputEncoding === 'hex-upper') {
        const hex = Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
        setHmacResult(hex)
      } else if (outputEncoding === 'base64') {
        const binary = String.fromCharCode(...signatureArray)
        setHmacResult(btoa(binary))
      } else if (outputEncoding === 'base64url') {
        const binary = String.fromCharCode(...signatureArray)
        const base64 = btoa(binary)
        const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        setHmacResult(base64url)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to compute HMAC signature')
      setHmacResult('')
    }
  }, [message, secretKey, algo, keyEncoding, outputEncoding])

  useEffect(() => {
    computeHmac()
  }, [computeHmac])

  // Sample Webhook snippet
  const nodeSnippet = `const crypto = require('crypto');
const signature = crypto
  .createHmac('${algo.toLowerCase().replace('-', '')}', '${secretKey}')
  .update(payload)
  .digest('${outputEncoding.includes('hex') ? 'hex' : 'base64'}');`

  return (
    <ToolLayout
      title="HMAC Generator & Signature Calculator"
      description="Calculate HMAC-SHA256, HMAC-SHA512, and HMAC-SHA1 signature hashes for webhook verification and API authentication."
      tag="crypto"
    >
      <div className="space-y-6">
        {/* Preset Providers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-subtle">Popular Webhook Configurations:</span>
          <button
            type="button"
            onClick={() => {
              setAlgo('SHA-256')
              setKeyEncoding('utf8')
              setOutputEncoding('hex-lower')
            }}
            className="px-2.5 py-1 text-xs font-mono rounded bg-surface border border-border hover:border-indigo-500/50 text-dim hover:text-bright"
          >
            GitHub (sha256 hex)
          </button>
          <button
            type="button"
            onClick={() => {
              setAlgo('SHA-256')
              setKeyEncoding('utf8')
              setOutputEncoding('base64')
            }}
            className="px-2.5 py-1 text-xs font-mono rounded bg-surface border border-border hover:border-indigo-500/50 text-dim hover:text-bright"
          >
            Shopify / Twilio (sha256 base64)
          </button>
          <button
            type="button"
            onClick={() => {
              setAlgo('SHA-256')
              setKeyEncoding('utf8')
              setOutputEncoding('hex-lower')
            }}
            className="px-2.5 py-1 text-xs font-mono rounded bg-surface border border-border hover:border-indigo-500/50 text-dim hover:text-bright"
          >
            Stripe (sha256 hex)
          </button>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-xs font-mono text-subtle mb-1.5">Raw Payload / Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Paste raw request body or payload string..."
            className="w-full bg-[#1e1e1e] border border-border rounded-xl p-3 text-xs font-mono text-bright outline-none focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Secret Key Input & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-subtle mb-1.5">Secret Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Enter secret key..."
              className="w-full bg-[#1e1e1e] border border-border rounded-xl px-3 py-2 text-xs font-mono text-bright outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-subtle mb-1.5">Key Encoding</label>
            <select
              value={keyEncoding}
              onChange={e => setKeyEncoding(e.target.value as KeyEncoding)}
              className="w-full bg-[#1e1e1e] border border-border rounded-xl px-3 py-2 text-xs font-mono text-bright outline-none focus:border-indigo-500"
            >
              <option value="utf8">UTF-8 / Plain Text</option>
              <option value="hex">Hex String</option>
              <option value="base64">Base64 Encoded</option>
            </select>
          </div>
        </div>

        {/* Algorithm & Output Encoding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-subtle mb-1.5">Hash Algorithm</label>
            <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
              {(['SHA-256', 'SHA-512', 'SHA-1', 'SHA-384'] as Algo[]).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    algo === a ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'text-dim hover:text-bright'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-subtle mb-1.5">Output Format</label>
            <select
              value={outputEncoding}
              onChange={e => setOutputEncoding(e.target.value as OutputEncoding)}
              className="w-full bg-[#1e1e1e] border border-border rounded-xl px-3 py-2 text-xs font-mono text-bright outline-none focus:border-indigo-500"
            >
              <option value="hex-lower">Hex (lowercase)</option>
              <option value="hex-upper">Hex (UPPERCASE)</option>
              <option value="base64">Base64</option>
              <option value="base64url">Base64URL (Safe for URIs)</option>
            </select>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Generated Signature Result */}
        <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400 font-medium">Computed HMAC Signature</span>
            <CopyButton text={hmacResult} />
          </div>
          <div className="font-mono text-sm font-semibold text-bright break-all bg-[#1e1e1e] p-3 rounded-lg border border-border/80 min-h-[48px] flex items-center">
            {hmacResult || <span className="text-subtle font-normal text-xs">// HMAC result will appear here</span>}
          </div>
        </div>

        {/* Code Snippet for Node.js Verification */}
        <div className="p-4 bg-surface/50 border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-subtle">Node.js Verification Snippet</span>
            <CopyButton text={nodeSnippet} />
          </div>
          <pre className="font-mono text-xs text-dim bg-[#1e1e1e] p-3 rounded-lg border border-border/80 overflow-x-auto">
            {nodeSnippet}
          </pre>
        </div>

        {/* Quick Answer Specs */}
        <QuickAnswerCard
          title="Cryptographic Parameters"
          items={[
            { label: 'Selected Algorithm', value: `HMAC-${algo}` },
            { label: 'Key Encoding', value: keyEncoding.toUpperCase() },
            { label: 'Output Format', value: outputEncoding },
            { label: 'Message Length', value: `${message.length} characters` },
          ]}
        />
      </div>
    </ToolLayout>
  )
}
