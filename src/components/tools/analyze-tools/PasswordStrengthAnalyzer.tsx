import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextInputField from '../../ui/TextInputField'
import TipsCard from '../../ui/TipsCard'
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Eye, EyeOff } from 'lucide-react'

type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong'

interface StrengthResult {
  level: StrengthLevel
  score: number
  entropy: number
  crackTimeOnline: string
  crackTimeOffline: string
  crackTimeOfflineFast: string
  feedback: string[]
  charSet: string
  poolSize: number
  hasLowercase: boolean
  hasUppercase: boolean
  hasDigits: boolean
  hasSpecial: boolean
  hasSpaces: boolean
  length: number
}

const COMMON_PATTERNS = [
  /^password/i, /^123456/, /^qwerty/i, /^admin/i, /^letmein/i,
  /^welcome/i, /^monkey$/i, /^dragon/i, /^master/i, /^login$/i,
  /^abc123/i, /^111111/, /^000000/, /^iloveyou/i, /^trustno1/i,
  /^(.)\1+$/, /^[a-z]+$/i, /^[0-9]+$/, /^[a-z]{4,}$/i,
]

const SEQUENTIAL = [
  'abcdefghijklmnopqrstuvwxyz',
  'zyxwvutsrqponmlkjihgfedcba',
  '01234567890',
  '09876543210',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
]

function calculatePoolSize(password: string): { poolSize: number; charSet: string } {
  let poolSize = 0
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpace = /\s/.test(password)
  const hasSpecial = /[^a-zA-Z0-9\s]/.test(password)

  if (hasLower) poolSize += 26
  if (hasUpper) poolSize += 26
  if (hasDigit) poolSize += 10
  if (hasSpace) poolSize += 1
  if (hasSpecial) poolSize += 33

  const charSet = [
    hasLower && 'a-z',
    hasUpper && 'A-Z',
    hasDigit && '0-9',
    hasSpace && 'space',
    hasSpecial && 'special',
  ].filter(Boolean).join(' + ')

  return { poolSize: poolSize || 1, charSet: charSet || 'none' }
}

function calculateEntropy(password: string): number {
  if (!password) return 0
  const { poolSize } = calculatePoolSize(password)
  return password.length * Math.log2(poolSize)
}

function checkPatterns(password: string): string[] {
  const feedback: string[] = []

  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      feedback.push('Contains a commonly used password pattern')
      break
    }
  }

  for (const seq of SEQUENTIAL) {
    const lowerPass = password.toLowerCase()
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lowerPass.includes(seq.substring(i, i + 3))) {
        feedback.push('Contains sequential characters (e.g., "abc", "123")')
        break
      }
    }
  }

  if (password.length < 8) {
    feedback.push('Use at least 8 characters (12+ recommended)')
  }
  if (password.length >= 8 && password.length < 12) {
    feedback.push('Consider using 12+ characters for better security')
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters')
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters')
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers')
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&*)')
  }
  if (/^[A-Z][a-z]+[0-9]$/.test(password)) {
    feedback.push('Avoid capitalizing only the first letter')
  }
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating the same character 3+ times')
  }

  return feedback
}

function estimateCrackTime(entropy: number): { online: string; offline: string; offlineFast: string } {
  // Online attack: ~100 attempts/sec
  const onlineGuessesPerSec = 100
  // Offline slow (bcrypt/scrypt): ~100,000 guesses/sec
  const offlineSlowGuessesPerSec = 100_000
  // Offline fast (GPU): ~10,000,000,000 guesses/sec (10B)
  const offlineFastGuessesPerSec = 10_000_000_000

  const totalCombinations = Math.pow(2, entropy)

  const formatTime = (seconds: number): string => {
    if (seconds < 1) return 'Instantly'
    if (seconds < 60) return `${Math.round(seconds)} seconds`
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`
    if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`
    if (seconds < 86400 * 365 * 1_000_000) return `${Math.round(seconds / (86400 * 365 * 1000))}K years`
    if (seconds < 86400 * 365 * 1_000_000_000) return `${Math.round(seconds / (86400 * 365 * 1_000_000))}M years`
    return `${(seconds / (86400 * 365 * 1_000_000_000)).toExponential(1)} billion years`
  }

  const avgCombinations = totalCombinations / 2

  return {
    online: formatTime(avgCombinations / onlineGuessesPerSec),
    offline: formatTime(avgCombinations / offlineSlowGuessesPerSec),
    offlineFast: formatTime(avgCombinations / offlineFastGuessesPerSec),
  }
}

function getStrengthLevel(entropy: number): StrengthLevel {
  if (entropy < 28) return 'very-weak'
  if (entropy < 36) return 'weak'
  if (entropy < 60) return 'fair'
  if (entropy < 80) return 'strong'
  return 'very-strong'
}

const STYLES: Record<StrengthLevel, { color: string; bg: string; border: string; label: string; icon: typeof Shield }> = {
  'very-weak': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Very Weak', icon: ShieldX },
  'weak': { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Weak', icon: ShieldAlert },
  'fair': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Fair', icon: Shield },
  'strong': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Strong', icon: ShieldCheck },
  'very-strong': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Very Strong', icon: ShieldCheck },
}

export default function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const result = useMemo<StrengthResult>(() => {
    const { poolSize, charSet } = calculatePoolSize(password)
    const entropy = calculateEntropy(password)
    const level = getStrengthLevel(entropy)
    const feedback = checkPatterns(password)
    const crackTimes = estimateCrackTime(entropy)

    return {
      level,
      score: password.length === 0 ? 0 : Math.min(100, Math.round((entropy / 128) * 100)),
      entropy,
      crackTimeOnline: crackTimes.online,
      crackTimeOffline: crackTimes.offline,
      crackTimeOfflineFast: crackTimes.offlineFast,
      feedback,
      charSet,
      poolSize,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigits: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9\s]/.test(password),
      hasSpaces: /\s/.test(password),
      length: password.length,
    }
  }, [password])

  const styles = STYLES[result.level]
  const StrengthIcon = styles.icon
  const strengthPercent = password.length === 0 ? 0 : Math.min(100, Math.round((result.entropy / 100) * 100))

  return (
    <ToolLayout
      title="Password Strength Analyzer"
      description="Analyze password entropy, crack time, and get actionable improvement tips"
      tag="analyze"
    >
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel: Input + Analysis */}
          <div className="space-y-4">
            {/* Password Input */}
            <div className="relative">
              <TextInputField
                label="Enter Password"
                value={password}
                onChange={setPassword}
                placeholder="Type a password to analyze..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-[34px] text-dim hover:text-bright transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength Meter */}
            {password.length > 0 && (
              <div className={`rounded-lg border p-4 ${styles.bg} ${styles.border} animate-fade-in`}>
                <div className="flex items-center gap-3 mb-3">
                  <StrengthIcon className={`w-5 h-5 ${styles.color}`} />
                  <span className={`text-sm font-semibold ${styles.color}`}>{styles.label}</span>
                  <span className="text-xs text-dim font-mono ml-auto">{result.score}/100</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.level === 'very-weak' ? 'bg-red-500' :
                      result.level === 'weak' ? 'bg-orange-500' :
                      result.level === 'fair' ? 'bg-yellow-500' :
                      result.level === 'strong' ? 'bg-emerald-500' :
                      'bg-emerald-400'
                    }`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Character Set Breakdown */}
            {password.length > 0 && (
              <div className="card space-y-3 bg-surface/40 border border-border/80 animate-fade-in">
                <h3 className="text-xs font-semibold font-mono text-dim tracking-wider uppercase border-b border-border/40 pb-2">
                  Character Analysis
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className={`w-2 h-2 rounded-full ${result.hasLowercase ? 'bg-emerald-500' : 'bg-border'}`} />
                    <span className={result.hasLowercase ? 'text-bright' : 'text-dim'}>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className={`w-2 h-2 rounded-full ${result.hasUppercase ? 'bg-emerald-500' : 'bg-border'}`} />
                    <span className={result.hasUppercase ? 'text-bright' : 'text-dim'}>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className={`w-2 h-2 rounded-full ${result.hasDigits ? 'bg-emerald-500' : 'bg-border'}`} />
                    <span className={result.hasDigits ? 'text-bright' : 'text-dim'}>Digits (0-9)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className={`w-2 h-2 rounded-full ${result.hasSpecial ? 'bg-emerald-500' : 'bg-border'}`} />
                    <span className={result.hasSpecial ? 'text-bright' : 'text-dim'}>Special (!@#$...)</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-subtle">
                  Character pool: {result.charSet} ({result.poolSize} possibilities)
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Stats + Feedback */}
          <div className="space-y-4">
            {/* Entropy & Crack Time Stats */}
            {password.length > 0 && (
              <div className="grid grid-cols-1 gap-3 animate-fade-in">
                <StatCard
                  label="Entropy"
                  value={`${result.entropy.toFixed(1)} bits`}
                  valueClassName="font-mono text-sm"
                />
                <StatCard
                  label="Online Attack (~100/s)"
                  value={result.crackTimeOnline}
                  valueClassName="font-mono text-sm"
                />
                <StatCard
                  label="Offline Attack (~100K/s)"
                  value={result.crackTimeOffline}
                  valueClassName="font-mono text-sm"
                />
                <StatCard
                  label="GPU Attack (~10B/s)"
                  value={result.crackTimeOfflineFast}
                  valueClassName="font-mono text-sm"
                />
              </div>
            )}

            {/* Feedback / Tips */}
            {password.length > 0 && result.feedback.length > 0 && (
              <div className="card space-y-3 bg-surface/40 border border-border/80 animate-fade-in">
                <h3 className="text-xs font-semibold font-mono text-dim tracking-wider uppercase border-b border-border/40 pb-2">
                  Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.feedback.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-sans text-dim leading-relaxed">
                      <span className="text-yellow-500 mt-0.5 shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Password Insights Output */}
            {password.length > 0 && (
              <OutputPanel
                label="Password Analysis Report"
                value={generateReport(password, result)}
                heightClass="h-[220px]"
                surface="surface"
              />
            )}
          </div>
        </div>

        <TipsCard
          title="About Password Strength Analysis"
          items={[
            'Entropy measures password randomness in bits — higher entropy means more possible combinations an attacker must try.',
            'Online attacks are limited by network speed (~100 attempts/sec), while offline attacks can run millions of guesses per second on modern GPUs.',
            'A strong password uses a mix of character types, avoids common words and patterns, and is at least 12 characters long.',
            'Consider using a password manager to generate and store truly random, long passwords for each account.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}

function generateReport(password: string, result: StrengthResult): string {
  const lines = [
    '═══════════════════════════════════════════',
    '        PASSWORD STRENGTH REPORT',
    '═══════════════════════════════════════════',
    '',
    `Strength:     ${STYLES[result.level].label}`,
    `Score:        ${result.score}/100`,
    `Length:       ${result.length} characters`,
    `Entropy:      ${result.entropy.toFixed(1)} bits`,
    `Pool Size:    ${result.poolSize.toLocaleString()} characters`,
    '',
    '─── CRACK TIME ESTIMATES ──────────────────',
    '',
    `  Online (100/s):      ${result.crackTimeOnline}`,
    `  Offline (100K/s):    ${result.crackTimeOffline}`,
    `  GPU (10B/s):         ${result.crackTimeOfflineFast}`,
    '',
    '─── CHARACTER SET ─────────────────────────',
    '',
    `  Lowercase: ${result.hasLowercase ? '✓' : '✗'}`,
    `  Uppercase: ${result.hasUppercase ? '✓' : '✗'}`,
    `  Digits:    ${result.hasDigits ? '✓' : '✗'}`,
    `  Special:   ${result.hasSpecial ? '✓' : '✗'}`,
    `  Spaces:    ${result.hasSpaces ? '✓' : '✗'}`,
  ]

  if (result.feedback.length > 0) {
    lines.push('', '─── RECOMMENDATIONS ──────────────────────', '')
    result.feedback.forEach(tip => {
      lines.push(`  • ${tip}`)
    })
  }

  lines.push('', '═══════════════════════════════════════════')
  return lines.join('\n')
}
