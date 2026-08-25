import { describe, it, expect } from 'vitest'
import {
  generateCustomSvg,
  generateEps,
  generateQrMatrix,
  ErrorCorrectionLevel,
  ModuleShape,
  EyeShape
} from '../utils/qrVectorEngine'

describe('Bulk QR Code Generation Logic', () => {
  // Test bulk SVG generation with multiple inputs
  it('generates unique SVG for different input texts', () => {
    const inputs = [
      'https://example.com',
      'https://github.com',
      'https://docs.example.com',
      'Hello World',
      'mailto:test@example.com'
    ]

    const svgs = inputs.map(text =>
      generateCustomSvg({
        text,
        fgColor: '#000000',
        bgColor: '#ffffff',
        margin: 4
      })
    )

    // All should be valid SVG
    svgs.forEach(svg => {
      expect(svg).toContain('<svg')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    // Each SVG should be unique (different data encodes differently)
    const uniqueSvgs = new Set(svgs)
    expect(uniqueSvgs.size).toBe(inputs.length)
  })

  it('applies consistent styling across bulk generation', () => {
    const inputs = ['url1.com', 'url2.com', 'url3.com']
    const styleOptions = {
      fgColor: '#ff0000',
      bgColor: '#00ff00',
      margin: 4,
      moduleShape: 'dots' as ModuleShape,
      eyeShape: 'rounded' as EyeShape
    }

    const svgs = inputs.map(text =>
      generateCustomSvg({ text, ...styleOptions })
    )

    // All should use the same colors
    svgs.forEach(svg => {
      expect(svg).toContain('fill="#ff0000"')
      expect(svg).toContain('<circle') // dots shape uses circles
    })
  })

  it('handles various QR content types for bulk generation', () => {
    const contentTypes = [
      // URL
      'https://toolbox4devs.com',
      // Plain text
      'Hello, World!',
      // WiFi format
      'WIFI:T:WPA;S:MyNetwork;P:password123;;',
      // vCard format
      'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD',
      // Email
      'mailto:contact@example.com?subject=Hello',
      // Phone
      'tel:+1234567890',
      // SMS
      'smsto:+1234567890:Hello!',
      // Geo
      'geo:37.7749,-122.4194?q=37.7749,-122.4194',
      // Bitcoin
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    ]

    const svgs = contentTypes.map(text =>
      generateCustomSvg({ text, margin: 4 })
    )

    // All should generate valid SVGs
    expect(svgs.length).toBe(contentTypes.length)
    svgs.forEach((svg, i) => {
      expect(svg).toContain('<svg')
      expect(svg.length).toBeGreaterThan(100)
    })
  })

  it('generates different QR codes for same content with different error correction levels', () => {
    const text = 'https://example.com'
    const levels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

    const svgs = levels.map(level =>
      generateCustomSvg({ text, errorCorrectionLevel: level, margin: 4 })
    )

    // L and H should produce different SVGs (different error correction adds more modules)
    expect(svgs[0]).not.toBe(svgs[3])
  })

  it('supports all module shapes for bulk generation', () => {
    const shapes: ModuleShape[] = ['square', 'dots', 'rounded', 'squircle']
    const text = 'Bulk QR Test'

    shapes.forEach(shape => {
      const svg = generateCustomSvg({
        text,
        moduleShape: shape,
        margin: 4
      })
      expect(svg).toContain('<svg')
    })
  })

  it('supports all eye shapes for bulk generation', () => {
    const shapes: EyeShape[] = ['square', 'rounded', 'circle']
    const text = 'Bulk QR Test'

    shapes.forEach(shape => {
      const svg = generateCustomSvg({
        text,
        eyeShape: shape,
        margin: 4
      })
      expect(svg).toContain('<svg')
    })
  })

  it('generates EPS format for bulk export', () => {
    const inputs = ['url1.com', 'url2.com', 'url3.com']

    const epsFiles = inputs.map(text =>
      generateEps({ text, fgColor: '#000000', bgColor: '#ffffff' })
    )

    epsFiles.forEach(eps => {
      expect(eps).toContain('%!PS-Adobe-3.0 EPSF-3.0')
      expect(eps).toContain('%%EOF')
    })
  })

  it('generates transparent background SVGs correctly', () => {
    const svg = generateCustomSvg({
      text: 'Transparent Test',
      transparentBg: true,
      fgColor: '#4f46e5'
    })

    expect(svg).toContain('<svg')
    // With transparent background, no background rect is rendered
    expect(svg).not.toContain('<rect width="400" height="400" fill="#ffffff" />')
    // But the SVG should still contain the foreground color
    expect(svg).toContain('#4f46e5')
  })

  it('handles very long payloads in bulk mode', () => {
    // Test with maximum reasonable payload length
    const longPayload = 'A'.repeat(1000)
    const svg = generateCustomSvg({ text: longPayload, margin: 4 })
    expect(svg).toContain('<svg')
  })

  it('generates matrix with correct dimensions for different payloads', () => {
    const shortPayload = 'Hi'
    const longPayload = 'https://very-long-url-example.com/with/many/paths?query=value&another=param'

    const matrixShort = generateQrMatrix(shortPayload, 'M')
    const matrixLong = generateQrMatrix(longPayload, 'M')

    // Longer payload should produce larger matrix
    expect(matrixLong.size).toBeGreaterThanOrEqual(matrixShort.size)
  })
})

describe('Input Parsing Logic (Bulk Mode)', () => {
  // Test the parsing logic that would be used in BulkQrGenerator
  it('parses one-per-line input correctly', () => {
    const input = 'https://example.com\nhttps://github.com\nHello World'
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('https://example.com')
    expect(lines[1]).toBe('https://github.com')
    expect(lines[2]).toBe('Hello World')
  })

  it('parses CSV input correctly', () => {
    const input = 'https://example.com, https://github.com, Hello World'
    const items = input.split(/[,\n]+/).map(l => l.trim()).filter(l => l.length > 0)
    expect(items).toHaveLength(3)
    expect(items[0]).toBe('https://example.com')
    expect(items[1]).toBe('https://github.com')
    expect(items[2]).toBe('Hello World')
  })

  it('handles mixed newline and comma separators', () => {
    const input = 'url1.com,\nurl2.com\n,\nurl3.com,'
    const items = input.split(/[,\n]+/).map(l => l.trim()).filter(l => l.length > 0)
    expect(items).toHaveLength(3)
  })

  it('filters empty lines', () => {
    const input = 'https://example.com\n\n\nhttps://github.com\n\n'
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    expect(lines).toHaveLength(2)
  })

  it('generates QR codes for parsed inputs', () => {
    const input = 'url1.com\nurl2.com\nurl3.com'
    const items = input.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    const svgs = items.map(text =>
      generateCustomSvg({ text, margin: 4 })
    )

    expect(svgs).toHaveLength(3)
    svgs.forEach(svg => {
      expect(svg).toContain('<svg')
    })
  })
})
