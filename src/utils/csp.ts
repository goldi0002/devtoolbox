export interface CspDirectiveMeta {
  name: string
  description: string
  booleanOnly?: boolean
  supportsSources?: boolean
}

export const CSP_DIRECTIVE_CATALOG: ReadonlyArray<CspDirectiveMeta> = [
  { name: 'default-src', description: 'Fallback policy for fetch directives not explicitly listed', supportsSources: true },
  { name: 'script-src', description: 'Valid sources for JavaScript execution', supportsSources: true },
  { name: 'style-src', description: 'Valid sources for stylesheets and inline styles', supportsSources: true },
  { name: 'img-src', description: 'Valid sources for images and favicons', supportsSources: true },
  { name: 'font-src', description: 'Valid sources for web fonts (@font-face)', supportsSources: true },
  { name: 'connect-src', description: 'URLs allowed for fetch(), XHR, WebSockets, and EventSource', supportsSources: true },
  { name: 'frame-src', description: 'Valid sources for nested browsing contexts (<iframe>)', supportsSources: true },
  { name: 'frame-ancestors', description: 'Valid parents that may embed this page (clickjacking defense)', supportsSources: true },
  { name: 'object-src', description: 'Valid sources for <object>, <embed>, and <applet>', supportsSources: true },
  { name: 'base-uri', description: 'Restricts URLs usable in <base> element', supportsSources: true },
  { name: 'form-action', description: 'Restricts target URLs for <form> submissions', supportsSources: true },
  { name: 'media-src', description: 'Valid sources for <audio> and <video>', supportsSources: true },
  { name: 'worker-src', description: 'Valid sources for Web Workers and Service Workers', supportsSources: true },
  { name: 'manifest-src', description: 'Valid sources for Web App Manifest files', supportsSources: true },
  { name: 'upgrade-insecure-requests', description: 'Rewrites HTTP subresource URLs to HTTPS automatically', booleanOnly: true },
  { name: 'block-all-mixed-content', description: 'Prevents loading any HTTP assets on HTTPS pages (deprecated by upgrade-insecure-requests)', booleanOnly: true },
  { name: 'report-to', description: 'Reporting API endpoint group name for violation reports', supportsSources: false },
  { name: 'report-uri', description: 'Legacy endpoint URL for violation reports (prefer report-to)', supportsSources: false },
]

export const QUICK_SOURCE_TOKENS: ReadonlyArray<string> = [
  "'self'",
  "'none'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "'strict-dynamic'",
  'https:',
  'data:',
  'blob:',
  'wss:',
]

export interface CspDirectiveEntry {
  name: string
  values: string[]
}

export interface CspPreset {
  id: string
  label: string
  description: string
  directives: CspDirectiveEntry[]
}

export const CSP_PRESETS: ReadonlyArray<CspPreset> = [
  {
    id: 'strict-spa',
    label: 'Strict SPA',
    description: 'Tight lockdown for modern single-page apps with no inline scripts.',
    directives: [
      { name: 'default-src', values: ["'none'"] },
      { name: 'script-src', values: ["'self'"] },
      { name: 'style-src', values: ["'self'"] },
      { name: 'img-src', values: ["'self'", 'data:'] },
      { name: 'font-src', values: ["'self'"] },
      { name: 'connect-src', values: ["'self'"] },
      { name: 'object-src', values: ["'none'"] },
      { name: 'base-uri', values: ["'self'"] },
      { name: 'frame-ancestors', values: ["'none'"] },
      { name: 'form-action', values: ["'self'"] },
      { name: 'upgrade-insecure-requests', values: [] },
    ],
  },
  {
    id: 'modern-web',
    label: 'Modern Web + CDN',
    description: 'Allows self-hosted scripts plus HTTPS images, fonts, and API calls.',
    directives: [
      { name: 'default-src', values: ["'self'"] },
      { name: 'script-src', values: ["'self'"] },
      { name: 'style-src', values: ["'self'", "'unsafe-inline'"] },
      { name: 'img-src', values: ["'self'", 'https:', 'data:'] },
      { name: 'font-src', values: ["'self'", 'https:', 'data:'] },
      { name: 'connect-src', values: ["'self'", 'https:'] },
      { name: 'object-src', values: ["'none'"] },
      { name: 'base-uri', values: ["'self'"] },
      { name: 'frame-ancestors', values: ["'self'"] },
      { name: 'upgrade-insecure-requests', values: [] },
    ],
  },
  {
    id: 'strict-dynamic',
    label: 'Nonce + Strict Dynamic',
    description: 'Modern script policy using a cryptographic nonce and strict-dynamic.',
    directives: [
      { name: 'default-src', values: ["'self'"] },
      { name: 'script-src', values: ["'nonce-REPLACE_WITH_RANDOM_NONCE'", "'strict-dynamic'"] },
      { name: 'style-src', values: ["'self'", "'unsafe-inline'"] },
      { name: 'img-src', values: ["'self'", 'data:', 'https:'] },
      { name: 'object-src', values: ["'none'"] },
      { name: 'base-uri', values: ["'none'"] },
      { name: 'frame-ancestors', values: ["'none'"] },
    ],
  },
  {
    id: 'static-site',
    label: 'Static Site',
    description: 'Minimal baseline for documentation and static marketing sites.',
    directives: [
      { name: 'default-src', values: ["'self'"] },
      { name: 'img-src', values: ["'self'", 'data:'] },
      { name: 'object-src', values: ["'none'"] },
      { name: 'base-uri', values: ["'self'"] },
      { name: 'frame-ancestors', values: ["'none'"] },
    ],
  },
]

export interface ParsedCsp {
  reportOnly: boolean
  directives: CspDirectiveEntry[]
  duplicateDirectives: string[]
  warnings: string[]
}

const KNOWN_DIRECTIVE_NAMES = new Set(CSP_DIRECTIVE_CATALOG.map(d => d.name))

const QUOTED_KEYWORDS = new Set([
  'self',
  'none',
  'unsafe-inline',
  'unsafe-eval',
  'strict-dynamic',
  'unsafe-hashes',
  'wasm-unsafe-eval',
  'report-sample',
])

export function normalizeCspToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return ''
  const unquoted = trimmed.replace(/^['"]|['"]$/g, '')
  if (QUOTED_KEYWORDS.has(unquoted.toLowerCase())) {
    return `'${unquoted.toLowerCase()}'`
  }
  if (/^(nonce|sha256|sha384|sha512)-/i.test(unquoted)) {
    return `'${unquoted}'`
  }
  return trimmed
}

export function parseCspHeader(raw: string): ParsedCsp {
  let body = raw.trim()
  let reportOnly = false

  if (/^content-security-policy-report-only\s*:/i.test(body)) {
    reportOnly = true
    body = body.replace(/^content-security-policy-report-only\s*:/i, '').trim()
  } else if (/^content-security-policy\s*:/i.test(body)) {
    body = body.replace(/^content-security-policy\s*:/i, '').trim()
  }

  const directives: CspDirectiveEntry[] = []
  const seen = new Set<string>()
  const duplicateDirectives: string[] = []
  const warnings: string[] = []

  if (!body) {
    return { reportOnly, directives, duplicateDirectives, warnings }
  }

  for (const segment of body.split(';')) {
    const cleaned = segment.trim()
    if (!cleaned) continue
    const parts = cleaned.split(/\s+/).filter(Boolean)
    const name = parts[0].toLowerCase()
    const values = Array.from(new Set(parts.slice(1).map(normalizeCspToken).filter(Boolean)))

    if (seen.has(name)) {
      duplicateDirectives.push(name)
      warnings.push(`Duplicate directive "${name}" — browsers ignore subsequent occurrences of the same directive.`)
      continue
    }
    seen.add(name)

    if (!KNOWN_DIRECTIVE_NAMES.has(name)) {
      warnings.push(`Unknown or non-standard directive "${name}".`)
    }

    directives.push({ name, values })
  }

  return { reportOnly, directives, duplicateDirectives, warnings }
}

export function serializeCsp(directives: CspDirectiveEntry[]): string {
  return directives
    .filter(d => d.name.trim())
    .map(d => {
      const name = d.name.trim().toLowerCase()
      const meta = CSP_DIRECTIVE_CATALOG.find(m => m.name === name)
      if (meta?.booleanOnly) return name
      const vals = d.values.map(v => v.trim()).filter(Boolean)
      return vals.length > 0 ? `${name} ${vals.join(' ')}` : name
    })
    .join('; ')
}

export type AuditSeverity = 'high' | 'medium' | 'info'

export interface CspFinding {
  severity: AuditSeverity
  directive: string
  title: string
  recommendation: string
}

export function auditCsp(directives: CspDirectiveEntry[], duplicateDirectives: string[] = []): CspFinding[] {
  const findings: CspFinding[] = []
  const byName = new Map<string, string[]>()
  for (const d of directives) {
    byName.set(d.name.toLowerCase(), d.values)
  }

  for (const dup of duplicateDirectives) {
    findings.push({
      severity: 'high',
      directive: dup,
      title: `Duplicate "${dup}" directive`,
      recommendation: 'Merge sources into a single directive. Browsers only enforce the first occurrence and silently ignore duplicates.',
    })
  }

  const defaultSrc = byName.get('default-src')
  const scriptSrc = byName.get('script-src') ?? defaultSrc
  const styleSrc = byName.get('style-src') ?? defaultSrc
  const objectSrc = byName.get('object-src') ?? defaultSrc

  if (!byName.has('default-src')) {
    findings.push({
      severity: 'medium',
      directive: 'default-src',
      title: 'Missing default-src fallback directive',
      recommendation: "Define default-src 'none' or 'self' so unlisted fetch directives do not default to unrestricted.",
    })
  }

  if (scriptSrc) {
    const hasStrictDynamic = scriptSrc.includes("'strict-dynamic'")
    const hasNonceOrHash = scriptSrc.some(v => v.startsWith("'nonce-") || v.startsWith("'sha"))
    if (scriptSrc.includes("'unsafe-inline'") && !hasStrictDynamic && !hasNonceOrHash) {
      findings.push({
        severity: 'high',
        directive: byName.has('script-src') ? 'script-src' : 'default-src',
        title: "Allows 'unsafe-inline' scripts without a nonce or hash",
        recommendation: "Remove 'unsafe-inline' from script-src and use nonces ('nonce-...') or SHA-256 hashes instead.",
      })
    }
    if (scriptSrc.includes("'unsafe-eval'")) {
      findings.push({
        severity: 'high',
        directive: byName.has('script-src') ? 'script-src' : 'default-src',
        title: "Allows 'unsafe-eval' code execution",
        recommendation: "Remove 'unsafe-eval' unless strictly required, as it permits eval() and Function() execution of strings.",
      })
    }
    if (scriptSrc.includes('*')) {
      findings.push({
        severity: 'high',
        directive: byName.has('script-src') ? 'script-src' : 'default-src',
        title: 'Wildcard (*) allows loading scripts from any origin',
        recommendation: 'Replace * with explicit trusted origins or nonces.',
      })
    }
    if (scriptSrc.includes('data:')) {
      findings.push({
        severity: 'high',
        directive: byName.has('script-src') ? 'script-src' : 'default-src',
        title: 'Allows data: URIs for scripts',
        recommendation: 'Remove data: from script-src to block inline base64 script injection.',
      })
    }
    if (scriptSrc.includes('http:')) {
      findings.push({
        severity: 'high',
        directive: byName.has('script-src') ? 'script-src' : 'default-src',
        title: 'Allows unencrypted http: script sources',
        recommendation: 'Restrict script sources to https: or explicit HTTPS origins to prevent MitM tampering.',
      })
    }
  } else {
    findings.push({
      severity: 'high',
      directive: 'script-src',
      title: 'Neither script-src nor default-src is defined',
      recommendation: "Add script-src 'self' (or default-src 'none') to restrict script execution.",
    })
  }

  if (!objectSrc || !objectSrc.includes("'none'")) {
    findings.push({
      severity: 'medium',
      directive: 'object-src',
      title: "object-src is not set to 'none'",
      recommendation: "Set object-src 'none' to block legacy Flash, Java, and plugin execution vectors.",
    })
  }

  if (!byName.has('base-uri')) {
    findings.push({
      severity: 'medium',
      directive: 'base-uri',
      title: 'Missing base-uri directive',
      recommendation: "Add base-uri 'self' or 'none' to prevent attackers from injecting <base> tags that hijack relative script URLs.",
    })
  }

  if (!byName.has('frame-ancestors')) {
    findings.push({
      severity: 'medium',
      directive: 'frame-ancestors',
      title: 'Missing frame-ancestors clickjacking protection',
      recommendation: "Add frame-ancestors 'none' (or 'self') to prevent your site from being embedded in hostile iframes.",
    })
  }

  if (styleSrc && styleSrc.includes('*')) {
    findings.push({
      severity: 'medium',
      directive: byName.has('style-src') ? 'style-src' : 'default-src',
      title: 'Wildcard (*) in style-src',
      recommendation: 'Limit stylesheet origins to specific trusted domains.',
    })
  }

  for (const d of directives) {
    if (d.values.includes("'none'") && d.values.length > 1) {
      findings.push({
        severity: 'medium',
        directive: d.name,
        title: `'none' combined with other sources in ${d.name}`,
        recommendation: "Remove other values when using 'none', or remove 'none' — mixing them is ambiguous.",
      })
    }
    if (d.values.some(v => v.startsWith('http://'))) {
      findings.push({
        severity: 'medium',
        directive: d.name,
        title: `Plaintext http:// origin in ${d.name}`,
        recommendation: 'Upgrade explicit http:// origins to https://.',
      })
    }
  }

  if (byName.has('report-uri') && !byName.has('report-to')) {
    findings.push({
      severity: 'info',
      directive: 'report-uri',
      title: 'report-uri is deprecated in CSP Level 3',
      recommendation: 'Pair report-uri with report-to and a Reporting-Endpoints header for modern browsers.',
    })
  }

  if (!byName.has('upgrade-insecure-requests')) {
    findings.push({
      severity: 'info',
      directive: 'upgrade-insecure-requests',
      title: 'Consider adding upgrade-insecure-requests',
      recommendation: 'Automatically upgrades legacy HTTP subresource requests to HTTPS.',
    })
  }

  return findings
}

export interface CspFormattedOutputs {
  headerName: string
  headerValue: string
  httpHeader: string
  nginx: string
  apache: string
  express: string
  metaTag: string
  metaWarnings: string[]
}

export function formatCspOutputs(directives: CspDirectiveEntry[], reportOnly: boolean): CspFormattedOutputs {
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
  const headerValue = serializeCsp(directives)
  const escapedQuotes = headerValue.replace(/"/g, '\\"')
  const escapedAttr = headerValue.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

  const metaWarnings: string[] = []
  if (reportOnly) {
    metaWarnings.push('Content-Security-Policy-Report-Only is ignored in <meta> tags and must be sent as an HTTP response header.')
  }
  const ignoredInMeta = directives
    .map(d => d.name.toLowerCase())
    .filter(name => name === 'frame-ancestors' || name === 'report-uri' || name === 'sandbox')
  if (ignoredInMeta.length > 0) {
    metaWarnings.push(`Browsers ignore ${ignoredInMeta.join(', ')} inside <meta> CSP tags; send them via HTTP response headers instead.`)
  }

  return {
    headerName,
    headerValue,
    httpHeader: headerValue ? `${headerName}: ${headerValue}` : '',
    nginx: headerValue ? `add_header ${headerName} "${escapedQuotes}" always;` : '',
    apache: headerValue ? `Header always set ${headerName} "${escapedQuotes}"` : '',
    express: headerValue ? `res.setHeader('${headerName}', '${headerValue.replace(/'/g, "\\'")}')` : '',
    metaTag: headerValue
      ? `<meta http-equiv="Content-Security-Policy" content="${escapedAttr}" />`
      : '',
    metaWarnings,
  }
}
