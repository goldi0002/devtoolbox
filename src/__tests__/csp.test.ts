import { describe, it, expect } from 'vitest'
import {
  CSP_PRESETS,
  auditCsp,
  formatCspOutputs,
  normalizeCspToken,
  parseCspHeader,
  serializeCsp,
} from '../utils/csp'
import { CSP_BUILDER_META } from '../tools/meta/csp-builder'

describe('CSP Builder & Analyzer', () => {
  it('normalizes quoted CSP keywords and preserves origins', () => {
    expect(normalizeCspToken('self')).toBe("'self'")
    expect(normalizeCspToken("'STRICT-DYNAMIC'")).toBe("'strict-dynamic'")
    expect(normalizeCspToken('https://cdn.example.com')).toBe('https://cdn.example.com')
    expect(normalizeCspToken('nonce-abc123')).toBe("'nonce-abc123'")
  })

  it('parses Content-Security-Policy and Report-Only headers and detects duplicates', () => {
    const parsed = parseCspHeader(
      "Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://cdn.example.com; script-src 'unsafe-inline'"
    )
    expect(parsed.reportOnly).toBe(true)
    expect(parsed.duplicateDirectives).toEqual(['script-src'])
    expect(parsed.directives).toHaveLength(2)
    expect(parsed.warnings.some(w => w.includes('Duplicate directive'))).toBe(true)
  })

  it('flags XSS risks in security audit and clears hardened preset', () => {
    const risky = parseCspHeader("default-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:")
    const riskyFindings = auditCsp(risky.directives, risky.duplicateDirectives)
    expect(riskyFindings.some(f => f.severity === 'high' && f.title.includes('unsafe-inline'))).toBe(true)
    expect(riskyFindings.some(f => f.severity === 'high' && f.title.includes('unsafe-eval'))).toBe(true)
    expect(riskyFindings.some(f => f.severity === 'high' && f.title.includes('data:'))).toBe(true)
    expect(riskyFindings.some(f => f.severity === 'medium' && f.directive === 'frame-ancestors')).toBe(true)

    const strictPreset = CSP_PRESETS[0]
    const strictFindings = auditCsp(strictPreset.directives)
    expect(strictFindings).toHaveLength(0)
  })

  it('formats HTTP, Nginx, Apache, Express, and meta outputs with meta caveats', () => {
    const strict = CSP_PRESETS[0].directives
    const outputs = formatCspOutputs(strict, false)
    expect(outputs.httpHeader).toBe(CSP_BUILDER_META.guide!.example!.output)
    expect(outputs.nginx).toContain('add_header Content-Security-Policy')
    expect(outputs.apache).toContain('Header always set Content-Security-Policy')
    expect(outputs.express).toContain("res.setHeader('Content-Security-Policy'")
    expect(outputs.metaTag).toContain('<meta http-equiv="Content-Security-Policy"')
    expect(outputs.metaWarnings.some(w => w.includes('frame-ancestors'))).toBe(true)

    expect(serializeCsp([{ name: 'upgrade-insecure-requests', values: ['ignored'] }])).toBe(
      'upgrade-insecure-requests'
    )
  })
})
