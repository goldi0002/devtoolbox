import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { RefreshCw } from 'lucide-react'
import ToolLayout from '../../ToolLayout'
import SectionPanel from '../../ui/SectionPanel'
import ToggleGroup from '../../ui/ToggleGroup'
import TextInputField from '../../ui/TextInputField'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import { decodeBase32Bytes } from '../../../utils/base32'
import {
  buildOtpAuthUri,
  generateHotpCode,
  generateRandomBase32Secret,
  generateTotp,
  parseOtpAuthUri,
  type OtpAlgorithm,
  type OtpMode,
  type TotpResult,
} from '../../../utils/totp'

const MODE_OPTIONS: ReadonlyArray<{ value: OtpMode; label: string }> = [
  { value: 'totp', label: 'TOTP (Time-Based)' },
  { value: 'hotp', label: 'HOTP (Counter-Based)' },
]

const ALG_OPTIONS: ReadonlyArray<{ value: OtpAlgorithm; label: string }> = [
  { value: 'SHA-1', label: 'SHA-1 (Standard)' },
  { value: 'SHA-256', label: 'SHA-256' },
  { value: 'SHA-512', label: 'SHA-512' },
]

export default function TotpAuthenticator() {
  const [mode, setMode] = useState<OtpMode>('totp')
  const [secret, setSecret] = useState<string>('JBSWY3DPEHPK3PXP')
  const [issuer, setIssuer] = useState<string>('ToolBox4Devs')
  const [account, setAccount] = useState<string>('dev@example.com')
  const [algorithm, setAlgorithm] = useState<OtpAlgorithm>('SHA-1')
  const [digits, setDigits] = useState<6 | 7 | 8>(6)
  const [period, setPeriod] = useState<number>(30)
  const [counter, setCounter] = useState<number>(0)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  const [totpResult, setTotpResult] = useState<TotpResult | null>(null)
  const [hotpCode, setHotpCode] = useState<string>('')
  const [otpError, setOtpError] = useState<string>('')

  const [uriInput, setUriInput] = useState<string>('')
  const [uriError, setUriError] = useState<string>('')
  const [qrSvg, setQrSvg] = useState<string>('')

  // Tick every 500ms in TOTP mode for crisp countdown accuracy
  useEffect(() => {
    if (mode !== 'totp') return
    const timer = window.setInterval(() => setNowMs(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [mode])

  // Compute current TOTP or HOTP code
  useEffect(() => {
    let cancelled = false
    async function compute() {
      setOtpError('')
      try {
        if (mode === 'totp') {
          const res = await generateTotp({
            secretBase32: secret,
            algorithm,
            digits,
            period,
            timestampMs: nowMs,
          })
          if (!cancelled) setTotpResult(res)
        } else {
          const bytes = decodeBase32Bytes(secret.trim())
          const code = await generateHotpCode(bytes, counter, algorithm, digits)
          if (!cancelled) setHotpCode(code)
        }
      } catch (err) {
        if (!cancelled) {
          setOtpError(err instanceof Error ? err.message : 'Failed to compute OTP code.')
          setTotpResult(null)
          setHotpCode('')
        }
      }
    }
    compute()
    return () => {
      cancelled = true
    }
  }, [mode, secret, algorithm, digits, period, counter, nowMs])

  const otpAuthUri = useMemo(() => {
    if (!secret.trim() || otpError) return ''
    return buildOtpAuthUri({
      mode,
      issuer,
      account,
      secret,
      algorithm,
      digits,
      period,
      counter,
    })
  }, [mode, issuer, account, secret, algorithm, digits, period, counter, otpError])

  // Render QR SVG locally
  useEffect(() => {
    let cancelled = false
    if (!otpAuthUri) {
      setQrSvg('')
      return
    }
    QRCode.toString(otpAuthUri, {
      type: 'svg',
      margin: 1,
      width: 176,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then(svg => {
        if (!cancelled) setQrSvg(svg)
      })
      .catch(() => {
        if (!cancelled) setQrSvg('')
      })
    return () => {
      cancelled = true
    }
  }, [otpAuthUri])

  const handleImportUri = () => {
    setUriError('')
    try {
      const parsed = parseOtpAuthUri(uriInput)
      setMode(parsed.mode)
      setSecret(parsed.secret)
      setIssuer(parsed.issuer)
      setAccount(parsed.account)
      setAlgorithm(parsed.algorithm)
      setDigits(parsed.digits)
      setPeriod(parsed.period)
      setCounter(parsed.counter)
    } catch (err) {
      setUriError(err instanceof Error ? err.message : 'Invalid otpauth:// URI.')
    }
  }

  const activeCode = mode === 'totp' ? (totpResult?.code ?? '------') : (hotpCode || '------')
  const formattedCode =
    activeCode.length === 6
      ? `${activeCode.slice(0, 3)} ${activeCode.slice(3)}`
      : activeCode.length === 8
        ? `${activeCode.slice(0, 4)} ${activeCode.slice(4)}`
        : activeCode

  const pctRemaining = totpResult ? Math.max(0, Math.min(100, (totpResult.secondsRemaining / totpResult.period) * 100)) : 0
  const ringCircumference = 2 * Math.PI * 18
  const ringOffset = ringCircumference * (1 - pctRemaining / 100)

  return (
    <ToolLayout
      title="TOTP / 2FA Authenticator & otpauth:// Builder"
      description="Generate RFC 6238 TOTP & RFC 4226 HOTP 2FA codes, test Base32 secrets, and build scannable otpauth:// QR URIs locally"
      tag="2fa"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="OTP mode" className="flex flex-wrap gap-2">
            <ToggleGroup options={MODE_OPTIONS} value={mode} onChange={setMode} />
          </div>
          <div role="group" aria-label="HMAC algorithm" className="flex flex-wrap gap-2">
            <ToggleGroup options={ALG_OPTIONS} value={algorithm} onChange={setAlgorithm} />
          </div>
        </div>

        {/* Live OTP Code Showcase */}
        <SectionPanel
          title={mode === 'totp' ? 'Live 2FA Verification Code (TOTP)' : 'Counter-Based Verification Code (HOTP)'}
          copyText={otpError ? '' : activeCode}
        >
          {otpError ? (
            <ErrorBanner message={otpError} />
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-4">
                {mode === 'totp' && totpResult && (
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-border" />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        className={totpResult.secondsRemaining <= 5 ? 'text-rose-400 transition-all' : 'text-accent transition-all'}
                      />
                    </svg>
                    <span className="absolute text-xs font-mono font-bold text-bright tabular-nums">
                      {totpResult.secondsRemaining}s
                    </span>
                  </div>
                )}

                <div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-bright tabular-nums">
                    {formattedCode}
                  </div>
                  <div className="text-xs font-mono text-subtle mt-1">
                    {issuer || 'Issuer'} ({account || 'account'}) · {algorithm} · {digits} digits
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono w-full sm:w-auto">
                {mode === 'totp' && totpResult ? (
                  <>
                    <StatCard label="Next Window" value={totpResult.nextCode} valueClassName="tabular-nums font-bold" />
                    <StatCard label="Time Step Counter" value={String(totpResult.counter)} valueClassName="tabular-nums" />
                  </>
                ) : (
                  <>
                    <StatCard label="Current Counter" value={String(counter)} valueClassName="tabular-nums font-bold" />
                    <button
                      type="button"
                      onClick={() => setCounter(c => c + 1)}
                      className="btn-primary text-xs self-center"
                    >
                      Increment Counter (+1)
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </SectionPanel>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Secret & Parameter Configuration */}
          <div className="lg:col-span-7 space-y-5">
            <SectionPanel
              title="Secret & Parameters"
              action={
                <button
                  type="button"
                  onClick={() => setSecret(generateRandomBase32Secret(20))}
                  className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>New 160-bit Secret</span>
                </button>
              }
            >
              <div className="space-y-4">
                <TextInputField
                  label="Base32 Secret Key (A–Z, 2–7)"
                  value={secret}
                  onChange={setSecret}
                  placeholder="JBSWY3DPEHPK3PXP"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInputField
                    label="Issuer (App / Service Name)"
                    value={issuer}
                    onChange={setIssuer}
                    placeholder="Acme Corp"
                  />
                  <TextInputField
                    label="Account Label (Email / Username)"
                    value={account}
                    onChange={setAccount}
                    placeholder="alice@acme.dev"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="otp-digits" className="block text-xs font-mono text-dim mb-1.5">
                      Code Digits
                    </label>
                    <select
                      id="otp-digits"
                      value={digits}
                      onChange={e => setDigits(Number(e.target.value) as 6 | 7 | 8)}
                      className="input-base font-mono text-xs"
                    >
                      <option value={6}>6 digits (Standard)</option>
                      <option value={7}>7 digits</option>
                      <option value={8}>8 digits</option>
                    </select>
                  </div>

                  {mode === 'totp' ? (
                    <div>
                      <label htmlFor="otp-period" className="block text-xs font-mono text-dim mb-1.5">
                        Period (seconds)
                      </label>
                      <input
                        id="otp-period"
                        type="number"
                        min={5}
                        max={300}
                        value={period}
                        onChange={e => setPeriod(Math.max(5, Math.min(300, Number(e.target.value) || 30)))}
                        className="input-base font-mono text-xs tabular-nums"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="otp-counter" className="block text-xs font-mono text-dim mb-1.5">
                        HOTP Counter
                      </label>
                      <input
                        id="otp-counter"
                        type="number"
                        min={0}
                        value={counter}
                        onChange={e => setCounter(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        className="input-base font-mono text-xs tabular-nums"
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionPanel>

            <SectionPanel title="Import Existing otpauth:// URI">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <TextInputField
                      label="Paste otpauth://totp/... or otpauth://hotp/... URI"
                      value={uriInput}
                      onChange={setUriInput}
                      placeholder="otpauth://totp/GitHub:dev@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImportUri}
                    disabled={!uriInput.trim()}
                    className="btn-primary whitespace-nowrap shrink-0"
                  >
                    Parse URI
                  </button>
                </div>
                {uriError && <ErrorBanner message={uriError} />}
              </div>
            </SectionPanel>
          </div>

          {/* QR Provisioning & URI Output */}
          <div className="lg:col-span-5">
            <SectionPanel title="Provisioning QR & URI" copyText={otpAuthUri}>
              <div className="space-y-4">
                <div className="flex justify-center p-4 rounded-lg bg-white border border-border">
                  {qrSvg ? (
                    <div
                      aria-label="Provisioning QR Code"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  ) : (
                    <span className="text-xs font-mono text-slate-500 py-12">
                      Enter a valid Base32 secret to render QR
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-dim">Generated otpauth:// URI</span>
                    {otpAuthUri && <CopyButton text={otpAuthUri} />}
                  </div>
                  <pre className="p-3 rounded border border-border bg-surface font-mono text-[11px] text-bright break-all whitespace-pre-wrap">
                    {otpAuthUri || 'Invalid secret'}
                  </pre>
                </div>

                {totpResult?.secretHex && (
                  <div className="text-[11px] font-mono text-subtle break-all">
                    Decoded Secret Hex ({totpResult.secretHex.length / 2} bytes): {totpResult.secretHex}
                  </div>
                )}
              </div>
            </SectionPanel>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
