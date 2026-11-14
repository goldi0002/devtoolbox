import { describe, it, expect } from 'vitest'
import { auditEnvFiles, parseEnvContent, detectSecrets, maskSecretValue } from '../utils/envAuditor'

describe('envAuditor utility', () => {
  it('parses comments, export prefixes, quotes, inline comments, and duplicate keys', () => {
    const raw = [
      '# Comment line',
      'export NODE_ENV=production',
      'PORT=3000 # inline comment',
      'GREETING="hello # not a comment"',
      "SINGLE='quoted value'",
      'PORT=8080',
      'EMPTY=',
    ].join('\n')

    const entries = parseEnvContent(raw)
    expect(entries).toHaveLength(6)
    expect(entries[0]).toMatchObject({ key: 'NODE_ENV', value: 'production', hasExport: true })
    expect(entries[1]).toMatchObject({ key: 'PORT', value: '3000', isDuplicate: false })
    expect(entries[2]).toMatchObject({ key: 'GREETING', value: 'hello # not a comment', quoteStyle: 'double' })
    expect(entries[3]).toMatchObject({ key: 'SINGLE', value: 'quoted value', quoteStyle: 'single' })
    expect(entries[4]).toMatchObject({ key: 'PORT', value: '8080', isDuplicate: true, firstLine: 3 })
    expect(entries[5]).toMatchObject({ key: 'EMPTY', value: '', isEmpty: true })
  })

  it('detects leaked secrets and masks previews', () => {
    const raw = [
      'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
      'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz',
      'DB_URL=postgres://admin:supersecret@localhost:5432/app',
      'SAFE_PLACEHOLDER=your_api_key_here',
    ].join('\n')

    const entries = parseEnvContent(raw)
    const findings = detectSecrets(entries, 'env')

    expect(findings.map((f) => f.key)).toEqual(['AWS_ACCESS_KEY_ID', 'GITHUB_TOKEN', 'DB_URL'])
    expect(findings[0].severity).toBe('critical')
    expect(findings[1].maskedPreview).toBe('ghp_••••wxyz')
    expect(maskSecretValue('short')).toBe('••••••••')
  })

  it('audits missing, extra, duplicate keys and generates sanitized .env.example', () => {
    const env = [
      'PORT=3000',
      'PORT=4000',
      'EXTRA_FLAG=1',
      'API_KEY=sk-proj-1234567890abcdefghijklmnop',
      'EMPTY_VAR=',
    ].join('\n')

    const example = [
      'PORT=',
      'API_KEY=',
      'REQUIRED_SECRET=',
    ].join('\n')

    const result = auditEnvFiles(env, example)

    expect(result.missingInEnv).toEqual(['REQUIRED_SECRET'])
    expect(result.extraInEnv).toEqual(['EXTRA_FLAG', 'EMPTY_VAR'])
    expect(result.emptyInEnv).toEqual(['EMPTY_VAR'])
    expect(result.duplicateKeysInEnv).toEqual([{ key: 'PORT', lines: [1, 2] }])
    expect(result.secretFindings.length).toBeGreaterThanOrEqual(1)
    expect(result.healthScore).toBeLessThan(100)
    expect(result.sanitizedExample).toBe(
      ['API_KEY=', 'EMPTY_VAR=', 'EXTRA_FLAG=', 'PORT=', 'REQUIRED_SECRET='].join('\n')
    )
    expect(result.sortedEnv).toContain('PORT=4000')
  })
})
