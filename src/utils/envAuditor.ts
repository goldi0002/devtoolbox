export type QuoteStyle = 'none' | 'single' | 'double' | 'backtick'

export interface EnvEntry {
  key: string
  value: string
  line: number
  quoteStyle: QuoteStyle
  hasExport: boolean
  isEmpty: boolean
  isDuplicate: boolean
  firstLine?: number
}

export interface SecretFinding {
  key: string
  line: number
  source: 'env' | 'example'
  rule: string
  severity: 'critical' | 'high' | 'medium'
  maskedPreview: string
}

export interface EnvAuditResult {
  envEntries: EnvEntry[]
  exampleEntries: EnvEntry[]
  missingInEnv: string[]
  extraInEnv: string[]
  emptyInEnv: string[]
  duplicateKeysInEnv: Array<{ key: string; lines: number[] }>
  duplicateKeysInExample: Array<{ key: string; lines: number[] }>
  secretFindings: SecretFinding[]
  sortedEnv: string
  sanitizedExample: string
  healthScore: number
}

interface SecretPattern {
  name: string
  severity: 'critical' | 'high' | 'medium'
  regex: RegExp
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'Private Key Material (PEM)',
    severity: 'critical',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    name: 'AWS Access Key ID',
    severity: 'critical',
    regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    name: 'GitHub Personal Access Token',
    severity: 'critical',
    regex: /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|gho_[A-Za-z0-9]{30,}|ghs_[A-Za-z0-9]{30,})\b/,
  },
  {
    name: 'OpenAI / Anthropic API Key',
    severity: 'critical',
    regex: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    name: 'Stripe Secret / Restricted Key',
    severity: 'critical',
    regex: /\b[rs]k_(?:live|test)_[0-9a-zA-Z]{16,}\b/,
  },
  {
    name: 'Slack Bot / User Token',
    severity: 'critical',
    regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/,
  },
  {
    name: 'Google / Firebase API Key',
    severity: 'high',
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/,
  },
  {
    name: 'Database URI with Embedded Password',
    severity: 'high',
    regex: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis|amqp):\/\/[^:\s/]+:[^@\s]+@[^\s]+/i,
  },
  {
    name: 'JSON Web Token (JWT)',
    severity: 'medium',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
]

const SENSITIVE_KEY_REGEX = /(SECRET|TOKEN|API_KEY|PRIVATE_KEY|PASSWORD|PASSWD|AUTH|CREDENTIAL|SIGNING_KEY|WEBHOOK_SECRET)/i
const PLACEHOLDER_VALUE_REGEX = /^(?:your[_-]|changeme|example|placeholder|replace[_-]?me|dummy|test[_-]?key|xxx+|<[^>]+>|\$\{[^}]+\}|null|undefined|false|true)$/i

export function shannonEntropy(input: string): number {
  if (!input) return 0
  const counts = new Map<string, number>()
  for (const ch of input) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1)
  }
  let entropy = 0
  const len = input.length
  for (const count of counts.values()) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }
  return entropy
}

export function maskSecretValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 8) return '••••••••'
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`
}

function stripUnquotedComment(raw: string): string {
  let inEscape = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (inEscape) {
      inEscape = false
      continue
    }
    if (ch === '\\') {
      inEscape = true
      continue
    }
    if (ch === '#' && (i === 0 || /\s/.test(raw[i - 1]))) {
      return raw.slice(0, i).trimEnd()
    }
  }
  return raw.trim()
}

function parseQuotedValue(raw: string): { value: string; quoteStyle: QuoteStyle } {
  const trimmed = raw.trimStart()
  if (!trimmed) return { value: '', quoteStyle: 'none' }

  const quote = trimmed[0]
  if (quote === '"' || quote === "'" || quote === '`') {
    const quoteStyle: QuoteStyle = quote === '"' ? 'double' : quote === "'" ? 'single' : 'backtick'
    let out = ''
    let escaped = false
    for (let i = 1; i < trimmed.length; i++) {
      const ch = trimmed[i]
      if (quote === '"' && escaped) {
        if (ch === 'n') out += '\n'
        else if (ch === 'r') out += '\r'
        else if (ch === 't') out += '\t'
        else out += ch
        escaped = false
        continue
      }
      if (quote === '"' && ch === '\\') {
        escaped = true
        continue
      }
      if (ch === quote) {
        return { value: out, quoteStyle }
      }
      out += ch
    }
    return { value: out, quoteStyle }
  }

  return {
    value: stripUnquotedComment(trimmed),
    quoteStyle: 'none',
  }
}

export function parseEnvContent(raw: string): EnvEntry[] {
  if (!raw) return []

  const lines = raw.split(/\r?\n/)
  const entries: EnvEntry[] = []
  const seenLine = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    const trimmed = lines[i].trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    let working = trimmed
    let hasExport = false
    if (/^export\s+/.test(working)) {
      hasExport = true
      working = working.replace(/^export\s+/, '')
    }

    const eqIdx = working.indexOf('=')
    if (eqIdx <= 0) continue

    const key = working.slice(0, eqIdx).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(key)) continue

    const rawVal = working.slice(eqIdx + 1)
    const { value, quoteStyle } = parseQuotedValue(rawVal)

    const firstLine = seenLine.get(key)
    const isDuplicate = firstLine !== undefined
    if (!isDuplicate) {
      seenLine.set(key, lineNum)
    }

    entries.push({
      key,
      value,
      line: lineNum,
      quoteStyle,
      hasExport,
      isEmpty: value.trim() === '',
      isDuplicate,
      firstLine,
    })
  }

  return entries
}

export function detectSecrets(entries: EnvEntry[], source: 'env' | 'example'): SecretFinding[] {
  const findings: SecretFinding[] = []

  for (const entry of entries) {
    if (entry.isEmpty) continue

    let matched = false
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(entry.value)) {
        findings.push({
          key: entry.key,
          line: entry.line,
          source,
          rule: pattern.name,
          severity: pattern.severity,
          maskedPreview: maskSecretValue(entry.value),
        })
        matched = true
        break
      }
    }

    if (
      !matched &&
      SENSITIVE_KEY_REGEX.test(entry.key) &&
      entry.value.length >= 16 &&
      !PLACEHOLDER_VALUE_REGEX.test(entry.value.trim()) &&
      !/\s/.test(entry.value.trim()) &&
      shannonEntropy(entry.value.trim()) >= 3.3
    ) {
      findings.push({
        key: entry.key,
        line: entry.line,
        source,
        rule: 'High-Entropy Secret Value',
        severity: 'medium',
        maskedPreview: maskSecretValue(entry.value),
      })
    }
  }

  return findings
}

function findDuplicates(entries: EnvEntry[]): Array<{ key: string; lines: number[] }> {
  const map = new Map<string, number[]>()
  for (const e of entries) {
    const arr = map.get(e.key) ?? []
    arr.push(e.line)
    map.set(e.key, arr)
  }
  const result: Array<{ key: string; lines: number[] }> = []
  for (const [key, lines] of map.entries()) {
    if (lines.length > 1) {
      result.push({ key, lines })
    }
  }
  return result
}

function formatEnvValue(entry: EnvEntry): string {
  if (entry.quoteStyle === 'single') return `'${entry.value}'`
  if (entry.quoteStyle === 'double' || /\s|#/.test(entry.value)) {
    const escaped = entry.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
    return `"${escaped}"`
  }
  return entry.value
}

export function auditEnvFiles(envText: string, exampleText: string): EnvAuditResult {
  const envEntries = parseEnvContent(envText)
  const exampleEntries = parseEnvContent(exampleText)

  // Deduplicate keeping last value (dotenv override semantics) for comparison
  const envMap = new Map<string, EnvEntry>()
  for (const e of envEntries) envMap.set(e.key, e)

  const exampleMap = new Map<string, EnvEntry>()
  for (const e of exampleEntries) exampleMap.set(e.key, e)

  const missingInEnv: string[] = []
  for (const key of exampleMap.keys()) {
    if (!envMap.has(key)) missingInEnv.push(key)
  }

  const extraInEnv: string[] = []
  for (const key of envMap.keys()) {
    if (exampleMap.size > 0 && !exampleMap.has(key)) {
      extraInEnv.push(key)
    }
  }

  const emptyInEnv: string[] = []
  for (const [key, entry] of envMap.entries()) {
    if (entry.isEmpty) emptyInEnv.push(key)
  }

  const duplicateKeysInEnv = findDuplicates(envEntries)
  const duplicateKeysInExample = findDuplicates(exampleEntries)

  // Flag secrets in .env (and in .env.example if someone accidentally committed real secrets!)
  const secretFindings = [
    ...detectSecrets(envEntries, 'env'),
    ...detectSecrets(exampleEntries, 'example'),
  ]

  const sortedEnv = Array.from(envMap.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((entry) => `${entry.key}=${formatEnvValue(entry)}`)
    .join('\n')

  const allKeys = new Set<string>([...envMap.keys(), ...exampleMap.keys()])
  const sanitizedExample = Array.from(allKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=`)
    .join('\n')

  // Compute 0-100 health score
  let penalty = 0
  penalty += missingInEnv.length * 10
  penalty += extraInEnv.length * 4
  penalty += duplicateKeysInEnv.length * 8
  penalty += duplicateKeysInExample.length * 5
  for (const finding of secretFindings) {
    if (finding.source === 'example') {
      penalty += finding.severity === 'critical' ? 30 : 20
    } else {
      penalty += finding.severity === 'critical' ? 12 : finding.severity === 'high' ? 8 : 4
    }
  }
  const healthScore = envEntries.length === 0 && exampleEntries.length === 0
    ? 100
    : Math.max(0, 100 - penalty)

  return {
    envEntries,
    exampleEntries,
    missingInEnv,
    extraInEnv,
    emptyInEnv,
    duplicateKeysInEnv,
    duplicateKeysInExample,
    secretFindings,
    sortedEnv,
    sanitizedExample,
    healthScore,
  }
}
