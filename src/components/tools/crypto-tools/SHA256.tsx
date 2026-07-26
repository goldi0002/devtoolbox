// tools/sha256-hasher/Sha256Hasher.tsx
import { useState, useCallback, useRef } from 'react'
import CopyButton from '../../CopyButton'
import { getErrorMessage } from '../../../utils/errors'

// ── Web Crypto SHA-256 ────────────────────────────────────────────
function requireSubtleCrypto(): SubtleCrypto {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto is unavailable — SHA-256 requires a secure (HTTPS) context')
  }
  return crypto.subtle
}

async function sha256hex(input: string): Promise<string> {
  const buf = await requireSubtleCrypto().digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256file(file: File): Promise<string> {
  const subtle = requireSubtleCrypto()
  const buf = await file.arrayBuffer()
  const hash = await subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Hash chunked display ──────────────────────────────────────────
function HashChunks({ hash }: { hash: string }) {
  const chunks = hash.match(/.{1,8}/g) ?? []
  return (
    <div className="font-mono text-xs break-all leading-relaxed">
      {chunks.map((chunk, i) => (
        <span key={i} className={i % 2 === 0 ? 'text-bright' : 'text-subtle'}>
          {chunk}
          {i < chunks.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  )
}

// ── Reusable section wrapper (mirrors JWT Decoder's Section) ──────
function Section({
  label,
  dot,
  children,
  copyText,
  extra,
}: {
  label: string
  dot?: string
  children: React.ReactNode
  copyText?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
          <span className="text-xs font-mono text-dim tracking-widest uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {copyText !== undefined && <CopyButton text={copyText} disabled={!copyText} />}
        </div>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

export default function Sha256Hasher() {
  const [input,    setInput]    = useState('')
  const [hash,     setHash]     = useState('')
  const [compare,  setCompare]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout>>()

  const computeText = useCallback(async (val: string) => {
    if (!val) { setHash(''); return }
    setLoading(true)
    setError('')
    try {
      setHash(await sha256hex(val))
    } catch (e) {
      setHash('')
      setError(getErrorMessage(e, 'Failed to hash input'))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (val: string) => {
    setInput(val)
    setFileInfo(null)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => { void computeText(val) }, 120)
  }

  const handleFile = async (file: File) => {
    setLoading(true)
    setError('')
    setInput('')
    setFileInfo({
      name: file.name,
      size: file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`,
    })
    try {
      setHash(await sha256file(file))
    } catch (e) {
      setHash('')
      setError(getErrorMessage(e, `Failed to hash ${file.name}`))
    } finally {
      setLoading(false)
    }
  }

  const matchStatus = compare.trim()
    ? compare.trim().toLowerCase() === hash ? 'match' : 'mismatch'
    : null

  const byteCount = input ? new TextEncoder().encode(input).length : 0

  return (
    <div className="border border-border rounded-lg overflow-hidden animate-fade-in">

      {/* ── Card header — mirrors JwtDecoder ── */}
      <div className="border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="tag">crypto</span>
          </div>
          <h2 className="text-bright font-sans font-medium text-base">SHA-256 Hasher</h2>
        </div>
        <p className="hidden sm:block text-dim text-xs font-sans max-w-xs text-right leading-relaxed">
          Hash text or files using SHA-256.<br />Runs entirely in your browser.
        </p>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Input section ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-dim font-mono">Input</label>
            <div className="flex items-center gap-3">
              {input && (
                <span className="text-[10px] font-mono text-subtle">
                  {input.length} chars · {byteCount} bytes
                </span>
              )}
              <label className="text-xs text-subtle hover:text-dim transition-colors font-mono cursor-pointer">
                ↑ upload file
                <input
                  type="file"
                  className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) void handleFile(file) }}
                />
              </label>
              {(input || fileInfo) && (
                <button
                  onClick={() => { setInput(''); setHash(''); setFileInfo(null); setError('') }}
                  className="text-xs text-subtle hover:text-dim transition-colors font-mono"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          {fileInfo ? (
            <div
              className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg cursor-pointer hover:border-dim transition-colors"
              onClick={() => { setInput(''); setHash(''); setFileInfo(null); setError('') }}
            >
              <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-sm flex-shrink-0">
                📄
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs text-bright truncate">{fileInfo.name}</div>
                <div className="font-mono text-[10px] text-subtle">{fileInfo.size} · click to clear</div>
              </div>
            </div>
          ) : (
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) void handleFile(e.dataTransfer.files[0]) }}
              onDragOver={e => e.preventDefault()}
              className="textarea-base h-24"
              placeholder="Type, paste text, or drag & drop a file…"
              spellCheck={false}
            />
          )}
        </div>

        {error && (
          <div className="border border-red-400/40 rounded-lg px-4 py-3 bg-surface">
            <p className="font-mono text-xs text-red-400 break-words">{error}</p>
          </div>
        )}

        {/* ── Hash output section ── */}
        <Section
          label="SHA-256"
          dot="bg-[#e5a44f]"
          copyText={hash}
          extra={
            loading
              ? <span className="w-1.5 h-1.5 rounded-full bg-dim animate-pulse inline-block" />
              : <span className="text-[10px] font-mono text-subtle">256 bit · 64 chars</span>
          }
        >
          {hash
            ? <HashChunks hash={hash} />
            : <p className="font-mono text-xs text-subtle">
                {loading ? 'Computing…' : 'Hash will appear here'}
              </p>
          }
        </Section>

        {/* ── Verify section ── */}
        <Section
          label="Verify hash"
          dot={
            matchStatus === 'match'    ? 'bg-green-400' :
            matchStatus === 'mismatch' ? 'bg-red-400'   :
            'bg-dim'
          }
          extra={
            matchStatus ? (
              <span className={`text-xs font-mono ${
                matchStatus === 'match' ? 'text-bright' : 'text-dim line-through'
              }`}>
                {matchStatus === 'match' ? '✓ Match' : '✗ Mismatch'}
              </span>
            ) : undefined
          }
        >
          <input
            type="text"
            value={compare}
            onChange={e => setCompare(e.target.value)}
            placeholder="Paste a hash here to compare…"
            className="w-full bg-transparent outline-none font-mono text-xs text-bright placeholder:text-subtle"
            spellCheck={false}
          />
        </Section>

        {/* ── Info strip ── */}
        <div className="flex flex-wrap gap-3 pt-1">
          {[
            ['Algorithm', 'SHA-256'],
            ['Output',    '256 bits'],
            ['Encoding',  'Hex lowercase'],
            ['Runs in',   'Browser only'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 py-1.5 px-3 bg-surface border border-border rounded text-xs font-mono">
              <span className="text-subtle">{k}:</span>
              <span className="text-bright">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}