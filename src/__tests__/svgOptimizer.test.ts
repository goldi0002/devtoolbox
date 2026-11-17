import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SVG_OPTIONS,
  buildSvgoConfig,
  clampPrecision,
  looksLikeSvg,
  optimizeSvg,
  optimizedFileName,
  type SvgOptimizeOptions,
} from '../utils/svgOptimizer'
import { SVG_OPTIMIZER_META } from '../tools/meta/svg-optimizer'

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created in an editor -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/></metadata>
  <path d="M12.000000 2.000000L22.000000 12.000000L12.000000 22.000000L2.000000 12.000000Z" fill="#000000"/>
</svg>`

const withOptions = (overrides: Partial<SvgOptimizeOptions>): SvgOptimizeOptions => ({
  ...DEFAULT_SVG_OPTIONS,
  ...overrides,
})

describe('clampPrecision', () => {
  it('keeps whole numbers between 0 and 8', () => {
    expect(clampPrecision(3)).toBe(3)
    expect(clampPrecision(3.6)).toBe(4)
    expect(clampPrecision(-2)).toBe(0)
    expect(clampPrecision(99)).toBe(8)
  })
  it('falls back to the default for non-finite input', () => {
    expect(clampPrecision(Number.NaN)).toBe(DEFAULT_SVG_OPTIONS.precision)
  })
})

describe('buildSvgoConfig', () => {
  it('uses preset-default with no overrides when every option is on', () => {
    const config = buildSvgoConfig(DEFAULT_SVG_OPTIONS)
    expect(config.floatPrecision).toBe(3)
    expect(config.plugins).toEqual([{ name: 'preset-default', params: { overrides: {} } }])
  })

  it('disables comment and metadata removal when those toggles are off', () => {
    const config = buildSvgoConfig(withOptions({ removeComments: false, removeMetadata: false }))
    expect(config.plugins).toEqual([
      { name: 'preset-default', params: { overrides: { removeComments: false, removeMetadata: false } } },
    ])
  })

  it('turns off path and number minification together when minifyPaths is off', () => {
    const config = buildSvgoConfig(withOptions({ minifyPaths: false }))
    expect(config.plugins).toEqual([
      {
        name: 'preset-default',
        params: { overrides: { convertPathData: false, cleanupNumericValues: false } },
      },
    ])
  })
})

describe('looksLikeSvg', () => {
  it('finds an svg root element', () => {
    expect(looksLikeSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toBe(true)
    expect(looksLikeSvg('<SVG></SVG>')).toBe(true)
  })
  it('rejects text without an svg element', () => {
    expect(looksLikeSvg('<div>hello</div>')).toBe(false)
    expect(looksLikeSvg('<svgfoo></svgfoo>')).toBe(false)
  })
})

describe('optimizeSvg', () => {
  it('rejects empty input', async () => {
    const result = await optimizeSvg('   ', DEFAULT_SVG_OPTIONS)
    expect(result).toEqual({ ok: false, error: 'Paste an SVG or upload a .svg file.' })
  })

  it('rejects input that is not an svg', async () => {
    const result = await optimizeSvg('<html></html>', DEFAULT_SVG_OPTIONS)
    expect(result.ok).toBe(false)
  })

  it('reports a parse error for malformed svg', async () => {
    const result = await optimizeSvg('<svg><path d="M0 0"></svg', DEFAULT_SVG_OPTIONS)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/^Could not parse this SVG/)
  })

  it('removes comments, metadata and the xml declaration by default and shrinks the file', async () => {
    const result = await optimizeSvg(SAMPLE, DEFAULT_SVG_OPTIONS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.output).not.toContain('<!--')
    expect(result.output).not.toContain('<metadata')
    expect(result.output).toContain('<svg')
    expect(result.before).toBeGreaterThan(result.after)
    expect(result.savedPercent).toBeGreaterThan(0)
    expect(result.savedPercent).toBeLessThanOrEqual(100)
  })

  it('keeps comments and metadata when those toggles are off', async () => {
    const result = await optimizeSvg(SAMPLE, withOptions({ removeComments: false, removeMetadata: false }))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.output).toContain('<!--')
    expect(result.output).toContain('<metadata')
  })

  it('rounds numbers to the chosen precision', async () => {
    const coarse = await optimizeSvg(SAMPLE, withOptions({ precision: 0 }))
    const fine = await optimizeSvg(SAMPLE, withOptions({ precision: 6 }))
    expect(coarse.ok && fine.ok).toBe(true)
    if (!coarse.ok || !fine.ok) return
    expect(coarse.output).not.toMatch(/\.\d/)
    expect(fine.output.length).toBeGreaterThanOrEqual(coarse.output.length)
  })

  it('reports the percent saved from the real before and after byte sizes', async () => {
    const result = await optimizeSvg(SAMPLE, DEFAULT_SVG_OPTIONS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.savedPercent).toBe(Math.round(((result.before - result.after) / result.before) * 100))
  })
})

describe('optimizedFileName', () => {
  it('adds .min before the extension', () => {
    expect(optimizedFileName('icon.svg')).toBe('icon.min.svg')
    expect(optimizedFileName('Logo.SVG')).toBe('Logo.min.svg')
  })
  it('falls back to a default name', () => {
    expect(optimizedFileName(undefined)).toBe('image.min.svg')
  })
})

describe('SVG_OPTIMIZER_META', () => {
  it('is registered as a web tool with a complete guide', () => {
    expect(SVG_OPTIMIZER_META.slug).toBe('svg-optimizer')
    expect(SVG_OPTIMIZER_META.category).toBe('web-tools')
    expect(SVG_OPTIMIZER_META.guide?.steps?.length ?? 0).toBeGreaterThan(0)
    expect(SVG_OPTIMIZER_META.guide?.faqs?.length ?? 0).toBeGreaterThan(0)
    expect(SVG_OPTIMIZER_META.guide?.example).toBeDefined()
  })
})
