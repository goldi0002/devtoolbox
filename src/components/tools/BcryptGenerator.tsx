import { useState, useMemo } from 'react'
import { hashPassword, verifyPassword, parseBcryptHash, generateBcryptSalt } from '../../utils/bcryptUtils'
import CopyButton from '../CopyButton'
import { Shield, KeyRound, CheckCircle2, XCircle, RefreshCw, Cpu, Clock, Layers } from 'lucide-react'

export default function BcryptGenerator() {
  // Hash Generation State
  const [password, setPassword] = useState('SecretPassword123!')
  const [rounds, setRounds] = useState(10)
  const [generatedHash, setGeneratedHash] = useState('')
  const [hashTime, setHashTime] = useState<number | null>(null)
  const [isHashing, setIsHashing] = useState(false)

  // Verification State
  const [verifyPlain, setVerifyPlain] = useState('SecretPassword123!')
  const [verifyHashInput, setVerifyHashInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<{ match: boolean; timeMs: number } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Salt Generator State
  const [saltRounds, setSaltRounds] = useState(10)
  const [generatedSalt, setGeneratedSalt] = useState('')

  const handleGenerateHash = async () => {
    if (!password) return
    setIsHashing(true)
    try {
      const res = await hashPassword(password, rounds)
      setGeneratedHash(res.hash)
      setHashTime(res.timeMs)
      if (!verifyHashInput) {
        setVerifyHashInput(res.hash)
      }
    } finally {
      setIsHashing(false)
    }
  }

  const handleVerify = async () => {
    if (!verifyPlain || !verifyHashInput) return
    setIsVerifying(true)
    try {
      const res = await verifyPassword(verifyPlain, verifyHashInput)
      setVerifyResult(res)
    } catch {
      setVerifyResult({ match: false, timeMs: 0 })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleGenSalt = async () => {
    const s = await generateBcryptSalt(saltRounds)
    setGeneratedSalt(s)
  }

  // Parse current hash for structural analysis
  const inspectedHash = useMemo(() => {
    const target = verifyHashInput || generatedHash
    return target ? parseBcryptHash(target) : null
  }, [verifyHashInput, generatedHash])

  return (
    <div className="space-y-6">
      {/* ── Section 1: Hash Generator ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-sm font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <KeyRound size={15} className="text-indigo-400" />
            Bcrypt Password Hasher
          </h2>
          <span className="text-[11px] font-mono text-muted">100% In-Browser Pure JS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="bcrypt-pwd" className="block text-xs font-mono text-subtle mb-2 font-medium">
              Plaintext Password / String
            </label>
            <input
              id="bcrypt-pwd"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="cost-rounds" className="text-xs font-mono text-subtle font-medium">
                Cost Factor (Rounds): {rounds}
              </label>
              <span className="text-[10px] font-mono text-muted">{Math.pow(2, rounds).toLocaleString()} iterations</span>
            </div>
            <input
              id="cost-rounds"
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            {rounds >= 13 && (
              <span className="text-[10px] text-amber-400 block mt-1">
                ⚠ Higher rounds (&gt;12) take 1-3+ seconds on typical CPUs.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGenerateHash}
            disabled={isHashing || !password}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isHashing && <RefreshCw size={14} className="animate-spin" />}
            {isHashing ? 'Hashing in Web Worker...' : 'Generate Bcrypt Hash'}
          </button>
          {hashTime !== null && (
            <span className="text-xs font-mono text-dim flex items-center gap-1">
              <Clock size={13} className="text-subtle" />
              Calculated in <strong className="text-bright">{hashTime}ms</strong>
            </span>
          )}
        </div>

        {/* Output Hash */}
        {generatedHash && (
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-subtle uppercase tracking-wider">Generated Bcrypt Hash (60 chars)</span>
              <CopyButton text={generatedHash} />
            </div>
            <div className="p-3 bg-muted/40 rounded-lg border border-border/80 font-mono text-xs text-indigo-300 break-all select-all font-semibold">
              {generatedHash}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Hash Inspector & Structure Analyzer ── */}
      {inspectedHash && inspectedHash.valid && (
        <div className="card p-5 bg-surface border border-border rounded-xl space-y-3">
          <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <Cpu size={14} className="text-indigo-400" />
            Bcrypt Hash Structure Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-subtle text-[10px] block mb-1">Prefix / Version</span>
              <span className="text-emerald-400 font-bold">{inspectedHash.version}</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-subtle text-[10px] block mb-1">Cost Factor (Rounds)</span>
              <span className="text-indigo-400 font-bold">{inspectedHash.cost} (2^{inspectedHash.cost})</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border/40 sm:col-span-2">
              <span className="text-subtle text-[10px] block mb-1">Extracted Salt (22 chars)</span>
              <span className="text-amber-300 font-mono truncate block select-all">{inspectedHash.salt}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Hash Verifier ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <Shield size={15} className="text-indigo-400" />
            Bcrypt Hash Verifier & Validator
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="verify-pwd" className="block text-xs font-mono text-subtle mb-1">
              Plaintext to Compare
            </label>
            <input
              id="verify-pwd"
              type="text"
              value={verifyPlain}
              onChange={(e) => setVerifyPlain(e.target.value)}
              placeholder="Candidate password..."
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="verify-hash" className="block text-xs font-mono text-subtle mb-1">
              Bcrypt Hash to Test Against ($2a$, $2b$, or $2y$)
            </label>
            <input
              id="verify-hash"
              type="text"
              value={verifyHashInput}
              onChange={(e) => setVerifyHashInput(e.target.value)}
              placeholder="e.g. $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
              className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !verifyPlain || !verifyHashInput}
              className="px-5 py-2 bg-muted/50 hover:bg-muted border border-border text-bright font-mono text-xs font-medium rounded-lg disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {isVerifying && <RefreshCw size={13} className="animate-spin" />}
              {isVerifying ? 'Verifying...' : 'Verify Match'}
            </button>

            {verifyResult !== null && (
              <div className="flex items-center gap-2">
                {verifyResult.match ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg font-semibold">
                    <CheckCircle2 size={15} />
                    Valid Match (Verified in {verifyResult.timeMs}ms)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg font-semibold">
                    <XCircle size={15} />
                    Mismatch / Invalid Password
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
