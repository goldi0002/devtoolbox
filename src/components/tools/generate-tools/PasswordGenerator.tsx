import { useState, useCallback, useEffect } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'

const CHARSETS = {
  uppercase:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase:   'abcdefghijklmnopqrstuvwxyz',
  numbers:     '0123456789',
  symbols:     '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous:   'Il1O0',
}

interface Options {
  length:       number
  uppercase:    boolean
  lowercase:    boolean
  numbers:      boolean
  symbols:      boolean
  excludeAmbiguous: boolean
}

function generatePassword(opts: Options): string {
  let charset = ''
  if (opts.uppercase) charset += CHARSETS.uppercase
  if (opts.lowercase) charset += CHARSETS.lowercase
  if (opts.numbers)   charset += CHARSETS.numbers
  if (opts.symbols)   charset += CHARSETS.symbols

  if (opts.excludeAmbiguous) {
    charset = charset.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('')
  }

  if (!charset) return ''

  const array = new Uint32Array(opts.length)
  crypto.getRandomValues(array)
  return Array.from(array).map(n => charset[n % charset.length]).join('')
}

function getStrength(password: string): { label: string; score: number; color: string } {
  if (!password) return { label: '', score: 0, color: 'bg-border' }

  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Weak',   score: 1, color: 'bg-subtle' }
  if (score <= 4) return { label: 'Fair',   score: 2, color: 'bg-dim' }
  if (score <= 5) return { label: 'Good',   score: 3, color: 'bg-light' }
  return            { label: 'Strong', score: 4, color: 'bg-bright' }
}

const DEFAULT_OPTS: Options = {
  length:           16,
  uppercase:        true,
  lowercase:        true,
  numbers:          true,
  symbols:          false,
  excludeAmbiguous: false,
}

export default function PasswordGenerator() {
  const [opts, setOpts]         = useState<Options>(DEFAULT_OPTS)
  const [password, setPassword] = useState('')
  const [batch, setBatch]       = useState<string[]>([])
  const [batchCount, setBatchCount] = useState(10)

  const generate = useCallback(() => {
    setPassword(generatePassword(opts))
    setBatch([])
  }, [opts])

  const generateBatch = () => {
    const list = Array.from({ length: Math.min(batchCount, 50) }, () => generatePassword(opts))
    setBatch(list)
    setPassword('')
  }

  // Regenerate on option change
  useEffect(() => {
    setPassword(generatePassword(opts))
    setBatch([])
  }, [opts])

  const toggle = (key: keyof Options) => {
    setOpts(prev => {
      const next = { ...prev, [key]: !prev[key] }
      // Ensure at least one charset is selected
      const hasCharset = next.uppercase || next.lowercase || next.numbers || next.symbols
      if (!hasCharset) return prev
      return next
    })
  }

  const strength = getStrength(password)

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords using the Web Crypto API"
      tag="generate"
    >
      <div className="space-y-5">

        {/* Password display */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <span className="text-xs font-mono text-subtle tracking-widest uppercase">Generated Password</span>
            <div className="flex items-center gap-2">
              {password && <CopyButton text={password} size="md" />}
              <button
                onClick={generate}
                className="text-xs font-mono text-subtle hover:text-dim transition-colors border border-border rounded px-2 py-0.5 hover:border-subtle"
                title="Regenerate"
              >
                ↻ refresh
              </button>
            </div>
          </div>
          <div className="px-4 py-4 min-h-[64px] flex items-center">
            {password ? (
              <span className="font-mono text-base sm:text-lg text-bright break-all leading-relaxed tracking-wide">
                {password}
              </span>
            ) : (
              <span className="font-mono text-sm text-subtle">
                Select at least one character type
              </span>
            )}
          </div>

          {/* Strength bar */}
          {password && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300
                        ${i <= strength.score ? strength.color : 'bg-border'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-subtle min-w-[40px]">
                  {strength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-dim">Length</label>
            <span className="text-sm font-mono text-bright font-medium">{opts.length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={opts.length}
            onChange={e => setOpts(p => ({ ...p, length: Number(e.target.value) }))}
            className="w-full h-1 bg-border rounded appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-bright
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-bg"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-mono text-muted">4</span>
            <span className="text-[10px] font-mono text-muted">64</span>
          </div>
        </div>

        {/* Character options */}
        <div>
          <label className="block text-xs font-mono text-dim mb-2">Character Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              { key: 'uppercase',    label: 'Uppercase',  sample: 'A–Z'      },
              { key: 'lowercase',    label: 'Lowercase',  sample: 'a–z'      },
              { key: 'numbers',      label: 'Numbers',    sample: '0–9'      },
              { key: 'symbols',      label: 'Symbols',    sample: '!@#$%'    },
            ] as const).map(({ key, label, sample }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center justify-between px-3 py-2.5 rounded border
                            text-left transition-all duration-150
                            ${opts[key]
                              ? 'border-bright bg-bright/5 text-bright'
                              : 'border-border text-dim hover:border-subtle'
                            }`}
              >
                <div>
                  <div className="text-xs font-sans font-medium">{label}</div>
                  <div className="text-[10px] font-mono text-subtle mt-0.5">{sample}</div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                                 transition-all duration-150
                                 ${opts[key] ? 'bg-bright border-bright' : 'border-muted'}`}>
                  {opts[key] && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Extra options */}
        <div>
          <label className="block text-xs font-mono text-dim mb-2">Options</label>
          <button
            onClick={() => toggle('excludeAmbiguous')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded border w-full text-left
                        transition-all duration-150
                        ${opts.excludeAmbiguous
                          ? 'border-bright bg-bright/5 text-bright'
                          : 'border-border text-dim hover:border-subtle'
                        }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                             transition-all duration-150
                             ${opts.excludeAmbiguous ? 'bg-bright border-bright' : 'border-muted'}`}>
              {opts.excludeAmbiguous && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <div className="text-xs font-sans font-medium">Exclude ambiguous characters</div>
              <div className="text-[10px] font-mono text-subtle mt-0.5">Removes I, l, 1, O, 0 — hard to distinguish visually</div>
            </div>
          </button>
        </div>

        {/* Batch generator */}
        <div className="border-t border-border pt-5">
          <label className="block text-xs font-mono text-dim mb-2">Batch Generator</label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min={1}
              max={50}
              value={batchCount}
              onChange={e => setBatchCount(Number(e.target.value))}
              className="input-base w-24"
            />
            <button onClick={generateBatch} className="btn-primary">
              Generate {batchCount}
            </button>
            {batch.length > 0 && (
              <button onClick={() => setBatch([])} className="btn-ghost">Clear</button>
            )}
          </div>

          {batch.length > 0 && (
            <div className="border border-border rounded overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-border">
                <span className="text-xs font-mono text-subtle">{batch.length} passwords</span>
                <CopyButton text={batch.join('\n')} />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {batch.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0 hover:bg-surface group"
                  >
                    <span className="font-mono text-xs text-light tracking-wide">{p}</span>
                    <CopyButton text={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  )
}