import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { encodeBase64, decodeBase64, encodeUrl, decodeUrl } from './encoding'
import { compress, decompress } from '../lib/share'

export interface PipelineOperation {
  id: string
  name: string
  category: 'encoding' | 'formatting' | 'auth' | 'text' | 'crypto'
  description: string
  defaultOptions: Record<string, string | number | boolean>
  execute: (input: string, options: Record<string, string | number | boolean>) => string
}

export interface PipelineStep {
  id: string
  operationId: string
  enabled: boolean
  options: Record<string, string | number | boolean>
}

export interface PipelineState {
  title?: string
  input: string
  steps: PipelineStep[]
}

export interface StepExecutionResult {
  stepId: string
  operationId: string
  output: string
  error?: string
  executionTimeMs: number
}

// ── Pure Functional Operations ─────────────────────────────────────────────

export const PIPELINE_OPERATIONS: PipelineOperation[] = [
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    category: 'encoding',
    description: 'Decodes base64 or URL-safe base64 string to plaintext.',
    defaultOptions: {},
    execute: (input) => {
      if (!input.trim()) return ''
      // normalize url-safe base64
      const normalized = input.trim().replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
      return decodeBase64(padded)
    },
  },
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    category: 'encoding',
    description: 'Encodes plaintext into standard Base64 string.',
    defaultOptions: {},
    execute: (input) => {
      if (!input) return ''
      return encodeBase64(input)
    },
  },
  {
    id: 'url-decode',
    name: 'URL Decode',
    category: 'encoding',
    description: 'Decodes URI encoded percent-sequences.',
    defaultOptions: {},
    execute: (input) => {
      if (!input) return ''
      return decodeUrl(input)
    },
  },
  {
    id: 'url-encode',
    name: 'URL Encode',
    category: 'encoding',
    description: 'Percent-encodes characters for URL components.',
    defaultOptions: { componentOnly: true },
    execute: (input, opts) => {
      if (!input) return ''
      return encodeUrl(input, opts.componentOnly ? 'component' : 'full')
    },
  },
  {
    id: 'json-prettify',
    name: 'JSON Prettify / Format',
    category: 'formatting',
    description: 'Formats and indents JSON structure with syntax validation.',
    defaultOptions: { indent: 2, sortKeys: false },
    execute: (input, opts) => {
      if (!input.trim()) return ''
      const parsed = JSON.parse(input)
      if (opts.sortKeys && typeof parsed === 'object' && parsed !== null) {
        const sortObj = (obj: any): any => {
          if (Array.isArray(obj)) return obj.map(sortObj)
          if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
              .sort()
              .reduce<Record<string, any>>((acc, key) => {
                acc[key] = sortObj(obj[key])
                return acc
              }, {})
          }
          return obj
        }
        return JSON.stringify(sortObj(parsed), null, Number(opts.indent) || 2)
      }
      return JSON.stringify(parsed, null, Number(opts.indent) || 2)
    },
  },
  {
    id: 'json-minify',
    name: 'JSON Minify',
    category: 'formatting',
    description: 'Collapses JSON into a compact single-line string.',
    defaultOptions: {},
    execute: (input) => {
      if (!input.trim()) return ''
      const parsed = JSON.parse(input)
      return JSON.stringify(parsed)
    },
  },
  {
    id: 'extract-json-key',
    name: 'Extract JSON Key Path',
    category: 'formatting',
    description: 'Plucks a nested property from JSON (e.g. "data.token" or "results.0.id").',
    defaultOptions: { path: 'data' },
    execute: (input, opts) => {
      if (!input.trim()) return ''
      const parsed = JSON.parse(input)
      const path = String(opts.path || '').trim()
      if (!path) return JSON.stringify(parsed, null, 2)
      
      const parts = path.split('.')
      let current: any = parsed
      for (const part of parts) {
        if (current === undefined || current === null) break
        current = current[part]
      }

      if (current === undefined) {
        throw new Error(`Key path "${path}" not found in JSON payload`)
      }
      if (typeof current === 'string') return current
      return JSON.stringify(current, null, 2)
    },
  },
  {
    id: 'jwt-decode',
    name: 'JWT Decoder',
    category: 'auth',
    description: 'Extracts and formats JWT Header or Payload claims.',
    defaultOptions: { section: 'payload' }, // 'payload' | 'header' | 'all'
    execute: (input, opts) => {
      if (!input.trim()) return ''
      let token = input.trim()
      if (token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7).trim()
      }
      const parts = token.split('.')
      if (parts.length < 2) {
        throw new Error('Invalid JWT format (expected 3 dot-separated segments)')
      }

      const decodeSegment = (seg: string) => {
        const base64 = seg.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
        return JSON.parse(decodeURIComponent(escape(atob(padded))))
      }

      const header = decodeSegment(parts[0])
      const payload = decodeSegment(parts[1])

      if (opts.section === 'header') {
        return JSON.stringify(header, null, 2)
      }
      if (opts.section === 'all') {
        return JSON.stringify({ header, payload, signature: parts[2] || '' }, null, 2)
      }
      return JSON.stringify(payload, null, 2)
    },
  },
  {
    id: 'regex-replace',
    name: 'Regex Search & Replace',
    category: 'text',
    description: 'Searches and replaces patterns using JavaScript RegExp.',
    defaultOptions: { pattern: '\\s+', replacement: ' ', flags: 'g' },
    execute: (input, opts) => {
      const pattern = String(opts.pattern || '')
      if (!pattern) return input
      const flags = String(opts.flags || 'g')
      const replacement = String(opts.replacement ?? '')
      const regex = new RegExp(pattern, flags)
      return input.replace(regex, replacement)
    },
  },
  {
    id: 'regex-extract',
    name: 'Regex Extract Matches',
    category: 'text',
    description: 'Extracts all regular expression matches into newline-delimited lines.',
    defaultOptions: { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    execute: (input, opts) => {
      const pattern = String(opts.pattern || '')
      if (!pattern) return input
      const flags = String(opts.flags || 'g')
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      const matches = input.match(regex) || []
      return matches.join('\n')
    },
  },
  {
    id: 'string-clean',
    name: 'Clean Lines & Whitespace',
    category: 'text',
    description: 'Trims lines, removes empty lines, and sorts entries.',
    defaultOptions: { trimLines: true, removeBlank: true, sort: false, unique: false },
    execute: (input, opts) => {
      let lines = input.split('\n')
      if (opts.trimLines) lines = lines.map(l => l.trim())
      if (opts.removeBlank) lines = lines.filter(l => l.length > 0)
      if (opts.unique) lines = Array.from(new Set(lines))
      if (opts.sort) lines.sort((a, b) => a.localeCompare(b))
      return lines.join('\n')
    },
  },
  {
    id: 'case-transform',
    name: 'Case Converter',
    category: 'text',
    description: 'Converts text between lower, UPPER, camelCase, snake_case, and kebab-case.',
    defaultOptions: { targetCase: 'snake' },
    execute: (input, opts) => {
      const target = String(opts.targetCase || 'snake')
      if (target === 'lower') return input.toLowerCase()
      if (target === 'upper') return input.toUpperCase()
      
      const words = input
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)

      if (target === 'camel') {
        return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('')
      }
      if (target === 'pascal') {
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      }
      if (target === 'kebab') return words.join('-')
      if (target === 'snake') return words.join('_')
      return input
    },
  },
  {
    id: 'sha256-hash',
    name: 'SHA-256 Checksum',
    category: 'crypto',
    description: 'Calculates the SHA-256 cryptographic hexadecimal hash.',
    defaultOptions: {},
    execute: (input) => {
      // Synchronous sha256 approximation for browser execution pipeline
      // We use Web Crypto via synchronous fallback or sha256 implementation
      return calculateSha256Sync(input)
    },
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    category: 'formatting',
    description: 'Parses YAML documents into formatted JSON.',
    defaultOptions: { indent: 2 },
    execute: (input, opts) => {
      if (!input.trim()) return ''
      const parsed = parseYaml(input)
      return JSON.stringify(parsed, null, Number(opts.indent) || 2)
    },
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    category: 'formatting',
    description: 'Converts JSON payloads into clean YAML.',
    defaultOptions: {},
    execute: (input) => {
      if (!input.trim()) return ''
      const parsed = JSON.parse(input)
      return stringifyYaml(parsed).trimEnd()
    },
  },
  {
    id: 'json-flatten',
    name: 'Flatten JSON Keys',
    category: 'formatting',
    description: 'Flattens nested JSON objects into dot-notation key/value pairs.',
    defaultOptions: {},
    execute: (input) => {
      if (!input.trim()) return ''
      const parsed = JSON.parse(input)
      const out: Record<string, unknown> = {}
      const walk = (node: unknown, prefix: string) => {
        if (Array.isArray(node)) {
          if (node.length === 0) {
            out[prefix] = []
          } else {
            node.forEach((item, idx) => walk(item, prefix ? `${prefix}.${idx}` : String(idx)))
          }
        } else if (node !== null && typeof node === 'object') {
          const entries = Object.entries(node as Record<string, unknown>)
          if (entries.length === 0) {
            out[prefix] = {}
          } else {
            for (const [k, v] of entries) {
              walk(v, prefix ? `${prefix}.${k}` : k)
            }
          }
        } else {
          out[prefix] = node
        }
      }
      walk(parsed, '')
      return JSON.stringify(out, null, 2)
    },
  },
  {
    id: 'hex-encode',
    name: 'Hex Encode (UTF-8)',
    category: 'encoding',
    description: 'Encodes UTF-8 text into hexadecimal byte pairs.',
    defaultOptions: { spaced: true },
    execute: (input, opts) => {
      if (!input) return ''
      const bytes = new TextEncoder().encode(input)
      const hexBytes = Array.from(bytes, b => b.toString(16).padStart(2, '0'))
      return opts.spaced ? hexBytes.join(' ') : hexBytes.join('')
    },
  },
  {
    id: 'hex-decode',
    name: 'Hex Decode (UTF-8)',
    category: 'encoding',
    description: 'Decodes hexadecimal bytes back into UTF-8 text.',
    defaultOptions: {},
    execute: (input) => {
      const clean = input.replace(/[\s:,-]+/g, '')
      if (!clean) return ''
      if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
        throw new Error('Invalid hexadecimal string (must contain even number of 0-9, a-f chars)')
      }
      const bytes = new Uint8Array(clean.length / 2)
      for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
      }
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    },
  },
  {
    id: 'url-slugify',
    name: 'URL Slugify',
    category: 'text',
    description: 'Normalizes text lines into URL-safe lowercase hyphenated slugs.',
    defaultOptions: {},
    execute: (input) => {
      return input
        .split('\n')
        .map(line =>
          line
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        )
        .join('\n')
    },
  },
]

// ── Lightweight synchronous SHA-256 implementation for pipeline transforms ──
function calculateSha256Sync(ascii: string): string {
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  const lengthProperty = 'length'
  let i = 0
  let j = 0
  let result = ''
  const words: number[] = []
  const asciiBitLength = ascii[lengthProperty] * 8
  
  const hash: number[] = []
  const k: number[] = []
  let primeCounter = 0

  const isPrime = (candidate: number) => {
    for (let factor = 2, max = Math.sqrt(candidate); factor <= max; factor++) {
      if (candidate % factor === 0) return false
    }
    return true
  }

  const compositeFunction = (candidate: number) => {
    return ((candidate - Math.floor(candidate)) * maxWord) | 0
  }

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = compositeFunction(mathPow(candidate, 1 / 2))
      }
      k[primeCounter] = compositeFunction(mathPow(candidate, 1 / 3))
      primeCounter++
    }
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32))
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength

  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i)
    words[i >> 2] |= j << ((3 - (i % 4)) * 8)
  }

  for (let block = 0; block < words[lengthProperty]; block += 16) {
    const w: number[] = []
    const h = [...hash]

    for (i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[block + i] | 0
      } else {
        const gamma0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)
        const gamma1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)
        w[i] = (w[i - 16] + gamma0 + w[i - 7] + gamma1) | 0
      }

      const ch = (h[4] & h[5]) ^ (~h[4] & h[6])
      const maj = (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2])
      const sigma0 = ((h[0] >>> 2) | (h[0] << 30)) ^ ((h[0] >>> 13) | (h[0] << 19)) ^ ((h[0] >>> 22) | (h[0] << 10))
      const sigma1 = ((h[4] >>> 6) | (h[4] << 26)) ^ ((h[4] >>> 11) | (h[4] << 21)) ^ ((h[4] >>> 25) | (h[4] << 7))

      const temp1 = (h[7] + sigma1 + ch + k[i] + w[i]) | 0
      const temp2 = (sigma0 + maj) | 0

      h[7] = h[6]
      h[6] = h[5]
      h[5] = h[4]
      h[4] = (h[3] + temp1) | 0
      h[3] = h[2]
      h[2] = h[1]
      h[1] = h[0]
      h[0] = (temp1 + temp2) | 0
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + h[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255
      result += (byte < 16 ? '0' : '') + byte.toString(16)
    }
  }
  return result
}

// ── Execution Runner ───────────────────────────────────────────────────────

export function executePipeline(
  initialInput: string,
  steps: PipelineStep[]
): {
  finalOutput: string
  results: StepExecutionResult[]
  hasError: boolean
} {
  let current = initialInput
  const results: StepExecutionResult[] = []
  let hasError = false

  for (const step of steps) {
    if (!step.enabled) {
      continue
    }

    const op = PIPELINE_OPERATIONS.find(o => o.id === step.operationId)
    if (!op) {
      results.push({
        stepId: step.id,
        operationId: step.operationId,
        output: current,
        error: `Unknown operation: ${step.operationId}`,
        executionTimeMs: 0,
      })
      hasError = true
      break
    }

    const start = performance.now()
    try {
      const mergedOpts = { ...op.defaultOptions, ...step.options }
      const output = op.execute(current, mergedOpts)
      const duration = Math.max(0.1, Number((performance.now() - start).toFixed(2)))
      results.push({
        stepId: step.id,
        operationId: step.operationId,
        output,
        executionTimeMs: duration,
      })
      current = output
    } catch (err: any) {
      const duration = Math.max(0.1, Number((performance.now() - start).toFixed(2)))
      results.push({
        stepId: step.id,
        operationId: step.operationId,
        output: current,
        error: err?.message || 'Operation failed',
        executionTimeMs: duration,
      })
      hasError = true
      break
    }
  }

  return {
    finalOutput: current,
    results,
    hasError,
  }
}

// ── Hash URL Sharing ───────────────────────────────────────────────────────

export function serializePipelineToHash(state: PipelineState): string {
  try {
    return compress({
      v: 1,
      t: state.title,
      i: state.input,
      s: state.steps.map(s => ({
        id: s.id,
        op: s.operationId,
        on: s.enabled,
        opt: s.options,
      })),
    })
  } catch {
    return ''
  }
}

export function deserializePipelineFromHash(hashStr: string): PipelineState | null {
  try {
    const raw = decompress<any>(hashStr)
    if (!raw || typeof raw !== 'object') return null
    if (raw.v === 1 && Array.isArray(raw.s)) {
      return {
        title: raw.t,
        input: raw.i || '',
        steps: raw.s.map((s: any) => ({
          id: s.id || `step-${Math.random().toString(36).slice(2, 7)}`,
          operationId: s.op,
          enabled: s.on ?? true,
          options: s.opt || {},
        })),
      }
    }
    return null
  } catch {
    return null
  }
}
