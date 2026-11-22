import { describe, it, expect } from 'vitest'
import {
  SAMPLE_OPENAPI_SPEC,
  generateCurlSnippet,
  generateFetchSnippet,
  parseOpenApiSpec,
} from '../utils/openApiExplorer'
import {
  explainRegexAst,
  parseRegexToAst,
  renderRegexRailroadSvg,
} from '../utils/regexRailroad'
import {
  buildOtpAuthUri,
  generateHotpCode,
  generateRandomBase32Secret,
  generateTotp,
  parseOtpAuthUri,
} from '../utils/totp'
import { executePipeline } from '../utils/pipelineEngine'

describe('OpenAPI / Swagger 3.0 Explorer', () => {
  it('parses the sample YAML OpenAPI 3.0 spec and resolves $ref schemas', () => {
    const parsed = parseOpenApiSpec(SAMPLE_OPENAPI_SPEC)
    expect(parsed.specVersion).toBe('OpenAPI 3.0.3')
    expect(parsed.title).toBe('Orders & Users API')
    expect(parsed.endpoints.length).toBe(4)
    expect(parsed.schemaCount).toBe(3)

    const createOrder = parsed.endpoints.find(e => e.operationId === 'createOrder')
    expect(createOrder).toBeDefined()
    expect(createOrder?.requestBody?.sampleJson).toContain('WIDGET-42')
    expect(createOrder?.requestBody?.sampleJson).toContain('customerId')
  })

  it('parses Swagger 2.0 JSON specs with host and basePath', () => {
    const swagger2 = JSON.stringify({
      swagger: '2.0',
      info: { title: 'Legacy API', version: '1.2.0' },
      host: 'legacy.example.com',
      basePath: '/api',
      schemes: ['https'],
      paths: {
        '/health': {
          get: {
            summary: 'Health check',
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    })
    const parsed = parseOpenApiSpec(swagger2)
    expect(parsed.servers[0]).toBe('https://legacy.example.com/api')
    expect(parsed.endpoints[0].path).toBe('/health')
  })

  it('generates cURL and fetch() snippets with substituted path and query params', () => {
    const parsed = parseOpenApiSpec(SAMPLE_OPENAPI_SPEC)
    const getOrder = parsed.endpoints.find(e => e.operationId === 'getOrderById')!
    const curl = generateCurlSnippet('https://api.example.com/v2', getOrder, {
      'path:orderId': 'ord_12345',
    })
    expect(curl).toContain('curl -X GET "https://api.example.com/v2/orders/ord_12345"')

    const createOrder = parsed.endpoints.find(e => e.operationId === 'createOrder')!
    const fetchCode = generateFetchSnippet('https://api.example.com/v2', createOrder, {}, '{"sku":"ABC"}')
    expect(fetchCode).toContain('method: "POST"')
    expect(fetchCode).toContain('Content-Type')
  })

  it('throws readable errors for invalid specifications', () => {
    expect(() => parseOpenApiSpec('')).toThrow(/Paste an OpenAPI/)
    expect(() => parseOpenApiSpec('{"foo":"bar"}')).toThrow(/Missing "openapi"/)
  })
})

describe('Regex Railroad Visualizer', () => {
  it('parses alternations, groups, character classes, and quantifiers into AST', () => {
    const ast = parseRegexToAst('^(?<env>prod|staging)-[a-z]{2,4}\\d+?$')
    const explanations = explainRegexAst(ast)
    expect(explanations.some(e => e.role.includes('Named Group (?<env>)'))).toBe(true)
    expect(explanations.some(e => e.role === 'Alternation')).toBe(true)
    expect(explanations.some(e => e.role === 'Quantifier (Lazy)')).toBe(true)
  })

  it('renders valid SVG markup containing start and end track markers', () => {
    const layout = renderRegexRailroadSvg('^(foo|bar)+\\d*$')
    expect(layout.width).toBeGreaterThanOrEqual(220)
    expect(layout.height).toBeGreaterThanOrEqual(80)
    expect(layout.svgMarkup.startsWith('<svg')).toBe(true)
    expect(layout.svgMarkup).toContain('</svg>')
    expect(layout.svgMarkup).toContain('1+ times')
  })
})

describe('TOTP / 2FA Authenticator (RFC 6238 & RFC 4226)', () => {
  // RFC 4226 Appendix D test secret "12345678901234567890"
  const rfcSecretBytes = new TextEncoder().encode('12345678901234567890')

  it('matches RFC 4226 HOTP SHA-1 test vectors', async () => {
    expect(await generateHotpCode(rfcSecretBytes, 0, 'SHA-1', 6)).toBe('755224')
    expect(await generateHotpCode(rfcSecretBytes, 1, 'SHA-1', 6)).toBe('287082')
    expect(await generateHotpCode(rfcSecretBytes, 2, 'SHA-1', 6)).toBe('359152')
  })

  it('matches RFC 6238 TOTP SHA-1 8-digit test vector at t=59s', async () => {
    // Base32("12345678901234567890") = GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
    const res = await generateTotp({
      secretBase32: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',
      algorithm: 'SHA-1',
      digits: 8,
      period: 30,
      timestampMs: 59 * 1000,
    })
    expect(res.code).toBe('94287082')
    expect(res.counter).toBe(1)
    expect(res.secondsRemaining).toBe(1)
  })

  it('builds and parses otpauth:// URIs round-trip', () => {
    const secret = generateRandomBase32Secret(20)
    expect(secret.length).toBe(32)

    const uri = buildOtpAuthUri({
      mode: 'totp',
      issuer: 'ToolBox4Devs',
      account: 'dev@example.com',
      secret,
      algorithm: 'SHA-256',
      digits: 8,
      period: 60,
    })
    const parsed = parseOtpAuthUri(uri)
    expect(parsed.mode).toBe('totp')
    expect(parsed.issuer).toBe('ToolBox4Devs')
    expect(parsed.account).toBe('dev@example.com')
    expect(parsed.secret).toBe(secret)
    expect(parsed.algorithm).toBe('SHA-256')
    expect(parsed.digits).toBe(8)
    expect(parsed.period).toBe(60)
  })
})

describe('New DevFlow Pipeline Engine Operations', () => {
  it('executes yaml-to-json and json-flatten in sequence', () => {
    const yamlInput = 'app:\n  name: api\n  ports:\n    - 8080\n'
    const res = executePipeline(yamlInput, [
      { id: 's1', operationId: 'yaml-to-json', enabled: true, options: { indent: 2 } },
      { id: 's2', operationId: 'json-flatten', enabled: true, options: {} },
    ])
    expect(res.hasError).toBe(false)
    const out = JSON.parse(res.finalOutput)
    expect(out['app.name']).toBe('api')
    expect(out['app.ports.0']).toBe(8080)
  })

  it('round-trips hex-encode and hex-decode and supports json-to-yaml & url-slugify', () => {
    const hexRes = executePipeline('ToolBox4Devs', [
      { id: 'h1', operationId: 'hex-encode', enabled: true, options: { spaced: true } },
      { id: 'h2', operationId: 'hex-decode', enabled: true, options: {} },
    ])
    expect(hexRes.hasError).toBe(false)
    expect(hexRes.finalOutput).toBe('ToolBox4Devs')

    const yamlRes = executePipeline('{"env":"prod","replicas":2}', [
      { id: 'y1', operationId: 'json-to-yaml', enabled: true, options: {} },
    ])
    expect(yamlRes.hasError).toBe(false)
    expect(yamlRes.finalOutput).toContain('env: prod')

    const slugRes = executePipeline('Hello, World! 2026', [
      { id: 'sl1', operationId: 'url-slugify', enabled: true, options: {} },
    ])
    expect(slugRes.finalOutput).toBe('hello-world-2026')
  })
})
