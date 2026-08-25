import React, { useState } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import OutputPanel from '../../ui/OutputPanel'
import ErrorBanner from '../../ui/ErrorBanner'

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

const formatPEM = (base64: string, type: 'PUBLIC' | 'PRIVATE') => {
  const lines = base64.match(/.{1,64}/g) || []
  return [
    `-----BEGIN ${type} KEY-----`,
    ...lines,
    `-----END ${type} KEY-----`
  ].join('\n')
}

export default function RsaKeyGenerator() {
  const [keysize, setKeysize] = useState(2048)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const generateKeys = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keysize,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      )

      const exportedPublicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
      const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

      setPublicKey(formatPEM(arrayBufferToBase64(exportedPublicKey), 'PUBLIC'))
      setPrivateKey(formatPEM(arrayBufferToBase64(exportedPrivateKey), 'PRIVATE'))
    } catch (err: any) {
      setError(err.message || 'Failed to generate keys')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionPanel title="Configuration">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 w-full max-w-[200px]">
            <label className="block text-xs font-medium text-subtle">Key Size (bits)</label>
            <select
              value={keysize}
              onChange={(e) => setKeysize(Number(e.target.value))}
              className="input-base w-full"
            >
              <option value={1024}>1024</option>
              <option value={2048}>2048</option>
              <option value={4096}>4096</option>
            </select>
          </div>
          <button
            onClick={generateKeys}
            disabled={isGenerating}
            className="btn-primary flex-shrink-0"
          >
            {isGenerating ? 'Generating...' : 'Generate Key Pair'}
          </button>
        </div>
        <p className="text-xs text-subtle mt-4">
          Keys are generated securely within your browser using the Web Crypto API. They are not sent to any server.
        </p>
      </SectionPanel>

      <ErrorBanner message={error} />

      {publicKey && privateKey && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OutputPanel
            content={publicKey}
            language="text"
            label="Public Key (SPKI)"
          />
          <OutputPanel
            content={privateKey}
            language="text"
            label="Private Key (PKCS#8)"
          />
        </div>
      )}
    </div>
  )
}
