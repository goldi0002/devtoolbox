import { describe, expect, it } from 'vitest'
import {
  clampQuality,
  encodedAs,
  fitWithin,
  formatBytes,
  formatInfo,
  outputFileName,
  savedPercent,
} from '../utils/imageCompress'
import { IMAGE_COMPRESSOR_META } from '../tools/meta/image-compressor'

describe('fitWithin', () => {
  it('keeps the size when there are no limits or it already fits', () => {
    expect(fitWithin(800, 600, 0, 0)).toEqual({ width: 800, height: 600 })
    expect(fitWithin(800, 600, 1000, 1000)).toEqual({ width: 800, height: 600 })
  })
  it('scales down by the tighter side and keeps the aspect ratio', () => {
    expect(fitWithin(4000, 2000, 1000, 0)).toEqual({ width: 1000, height: 500 })
    expect(fitWithin(4000, 2000, 0, 500)).toEqual({ width: 1000, height: 500 })
    expect(fitWithin(4000, 2000, 1000, 250)).toEqual({ width: 500, height: 250 })
  })
  it('never returns less than 1px and handles bad input', () => {
    expect(fitWithin(1000, 1, 10, 0)).toEqual({ width: 10, height: 1 })
    expect(fitWithin(0, 100, 50, 50)).toEqual({ width: 0, height: 0 })
  })
})

describe('outputFileName', () => {
  it('swaps the extension and adds a suffix', () => {
    expect(outputFileName('photo.PNG', 'image/webp')).toBe('photo-compressed.webp')
    expect(outputFileName('my.holiday.photo.jpeg', 'image/jpeg')).toBe('my.holiday.photo-compressed.jpg')
    expect(outputFileName('noext', 'image/png')).toBe('noext-compressed.png')
    expect(outputFileName('.png', 'image/png')).toBe('image-compressed.png')
  })
})

describe('size helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
    expect(formatBytes(-1)).toBe('0 B')
  })
  it('computes percent saved, negative when the file grew', () => {
    expect(savedPercent(1000, 250)).toBe(75)
    expect(savedPercent(1000, 1200)).toBe(-20)
    expect(savedPercent(0, 10)).toBe(0)
  })
})

describe('format and quality helpers', () => {
  it('knows which formats are lossy', () => {
    expect(formatInfo('image/png').lossy).toBe(false)
    expect(formatInfo('image/webp').lossy).toBe(true)
  })
  it('detects a browser fallback', () => {
    expect(encodedAs('image/avif', 'image/avif')).toBe(true)
    expect(encodedAs('image/png', 'image/avif')).toBe(false)
  })
  it('clamps quality to 0.01..1', () => {
    expect(clampQuality(80)).toBe(0.8)
    expect(clampQuality(0)).toBe(0.01)
    expect(clampQuality(500)).toBe(1)
    expect(clampQuality(Number.NaN)).toBe(0.8)
  })
})

describe('Image Compressor guide', () => {
  it('only claims formats the tool offers', () => {
    const text = JSON.stringify(IMAGE_COMPRESSOR_META.guide)
    for (const label of ['JPEG', 'WebP', 'PNG', 'AVIF']) expect(text).toContain(label)
    expect(IMAGE_COMPRESSOR_META.guide?.example?.output).toContain('compressed.webp')
  })
})

describe('Image Compressor guide example', () => {
  it('matches the helpers', () => {
    const size = fitWithin(4000, 3000, 1600, 0)
    expect(`${outputFileName('photo.png', 'image/webp')}, ${size.width} × ${size.height} px`).toBe(
      IMAGE_COMPRESSOR_META.guide?.example?.output
    )
  })
})
