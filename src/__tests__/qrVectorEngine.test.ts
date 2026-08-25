import { describe, it, expect } from 'vitest'
import {
  generateCustomSvg,
  generateEps,
  generateQrMatrix,
  analyzePayloadSafety
} from '../utils/qrVectorEngine'

describe('QR Vector Engine & Safety', () => {
  it('generates 2D matrix with valid module and corner eye partitions', () => {
    const matrix = generateQrMatrix('https://toolbox4devs.com', 'M')
    expect(matrix.size).toBeGreaterThanOrEqual(21)
    expect(matrix.modules.length).toBe(matrix.size)
    expect(matrix.isEyeModule.length).toBe(matrix.size)
    // Corner eye module top-left must be true
    expect(matrix.isEyeModule[0][0]).toBe(true)
    expect(matrix.isEyeModule[6][6]).toBe(true)
  })

  it('generates valid vector SVG markup with custom options', () => {
    const svg = generateCustomSvg({
      text: 'https://toolbox4devs.com',
      fgColor: '#4f46e5',
      bgColor: '#ffffff',
      moduleShape: 'dots',
      eyeShape: 'rounded',
      margin: 4
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('fill="#4f46e5"')
    expect(svg).toContain('circle')
  })

  it('supports transparent background in SVG', () => {
    const svg = generateCustomSvg({
      text: 'https://toolbox4devs.com',
      transparentBg: true
    })
    expect(svg).not.toContain('<rect width="400" height="400" fill="#ffffff" />')
  })

  it('generates standard Encapsulated PostScript (EPS) format', () => {
    const eps = generateEps({
      text: 'https://toolbox4devs.com',
      fgColor: '#000000',
      bgColor: '#ffffff',
      transparentBg: false
    })
    expect(eps).toContain('%!PS-Adobe-3.0 EPSF-3.0')
    expect(eps).toContain('%%BoundingBox: 0 0 500 500')
    expect(eps).toContain('/cell {')
    expect(eps).toContain('%%EOF')
  })

  it('analyzes payload safety and flags unencrypted or suspicious URLs', () => {
    const safeHttps = analyzePayloadSafety('https://toolbox4devs.com')
    expect(safeHttps.isSafe).toBe(true)
    expect(safeHttps.warnings.length).toBe(0)

    const httpUrl = analyzePayloadSafety('http://example.com')
    expect(httpUrl.warnings.some(w => w.includes('HTTP'))).toBe(true)

    const javascriptUri = analyzePayloadSafety('javascript:alert(1)')
    expect(javascriptUri.isSafe).toBe(false)
    expect(javascriptUri.warnings.length).toBeGreaterThan(0)
  })
})
