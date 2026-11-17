import { describe, expect, it } from 'vitest'
import { unzipSync } from 'fflate'
import {
  PNG_SIZES,
  buildIco,
  buildLinkTags,
  buildManifest,
  containRect,
  normalizeBasePath,
  packageFileNames,
  pngFileName,
  readPngSize,
  sanitizeHexColor,
  zipFiles,
} from '../utils/favicon'
import { FAVICON_GENERATOR_META } from '../tools/meta/favicon-generator'

/** A minimal PNG: signature, IHDR chunk with the given size, and a few filler bytes. */
function fakePng(width: number, height: number, filler = 8): Uint8Array {
  const bytes = new Uint8Array(33 + filler)
  const view = new DataView(bytes.buffer)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  view.setUint32(8, 13) // IHDR length
  bytes.set([0x49, 0x48, 0x44, 0x52], 12) // "IHDR"
  view.setUint32(16, width)
  view.setUint32(20, height)
  bytes[24] = 8 // bit depth
  bytes[25] = 6 // RGBA
  return bytes
}

describe('pngFileName and packageFileNames', () => {
  it('names the icons the way browsers and manifests expect', () => {
    expect(pngFileName(16)).toBe('favicon-16x16.png')
    expect(pngFileName(48)).toBe('favicon-48x48.png')
    expect(pngFileName(180)).toBe('apple-touch-icon.png')
    expect(pngFileName(192)).toBe('android-chrome-192x192.png')
    expect(pngFileName(512)).toBe('android-chrome-512x512.png')
  })
  it('lists every PNG size plus favicon.ico and the manifest', () => {
    const names = packageFileNames()
    expect(names).toHaveLength(PNG_SIZES.length + 2)
    expect(names).toContain('favicon.ico')
    expect(names).toContain('site.webmanifest')
  })
})

describe('containRect', () => {
  it('fills the square for a square source', () => {
    expect(containRect(1024, 1024, 180)).toEqual({ dx: 0, dy: 0, dw: 180, dh: 180 })
  })
  it('centres a wide source and keeps its aspect ratio', () => {
    expect(containRect(200, 100, 100)).toEqual({ dx: 0, dy: 25, dw: 100, dh: 50 })
  })
  it('centres a tall source', () => {
    expect(containRect(100, 400, 200)).toEqual({ dx: 75, dy: 0, dw: 50, dh: 200 })
  })
  it('scales small sources up to fill the size', () => {
    expect(containRect(16, 16, 512)).toEqual({ dx: 0, dy: 0, dw: 512, dh: 512 })
  })
  it('falls back to the full square when the source has no size', () => {
    expect(containRect(0, 0, 32)).toEqual({ dx: 0, dy: 0, dw: 32, dh: 32 })
  })
})

describe('readPngSize', () => {
  it('reads the width and height from the IHDR chunk', () => {
    expect(readPngSize(fakePng(192, 96))).toEqual({ width: 192, height: 96 })
  })
  it('returns null for bytes that are not a PNG', () => {
    expect(readPngSize(new TextEncoder().encode('GIF89a-not-a-png-but-long-enough'))).toBeNull()
    expect(readPngSize(new Uint8Array(4))).toBeNull()
  })
})

describe('buildIco header bytes', () => {
  const p16 = fakePng(16, 16, 10)
  const p32 = fakePng(32, 32, 20)
  const p48 = fakePng(48, 48, 30)
  const ico = buildIco([p16, p32, p48])
  const view = new DataView(ico.buffer)

  it('writes the reserved field as 0 and the type as 1 (icon)', () => {
    expect(view.getUint16(0, true)).toBe(0)
    expect(view.getUint16(2, true)).toBe(1)
  })

  it('writes the image count', () => {
    expect(view.getUint16(4, true)).toBe(3)
  })

  it('writes one 16-byte directory entry per image with width and height', () => {
    expect(ico[6]).toBe(16)
    expect(ico[7]).toBe(16)
    expect(ico[22]).toBe(32)
    expect(ico[23]).toBe(32)
    expect(ico[38]).toBe(48)
    expect(ico[39]).toBe(48)
  })

  it('writes colour count, reserved, planes and bit depth', () => {
    for (let i = 0; i < 3; i++) {
      const entry = 6 + 16 * i
      expect(ico[entry + 2]).toBe(0)
      expect(ico[entry + 3]).toBe(0)
      expect(view.getUint16(entry + 4, true)).toBe(1)
      expect(view.getUint16(entry + 6, true)).toBe(32)
    }
  })

  it('writes byte sizes and offsets that point at each PNG', () => {
    const firstOffset = 6 + 16 * 3
    expect(view.getUint32(6 + 8, true)).toBe(p16.length)
    expect(view.getUint32(6 + 12, true)).toBe(firstOffset)
    expect(view.getUint32(22 + 8, true)).toBe(p32.length)
    expect(view.getUint32(22 + 12, true)).toBe(firstOffset + p16.length)
    expect(view.getUint32(38 + 8, true)).toBe(p48.length)
    expect(view.getUint32(38 + 12, true)).toBe(firstOffset + p16.length + p32.length)
    expect(ico.length).toBe(firstOffset + p16.length + p32.length + p48.length)
  })

  it('copies the PNG bytes unchanged at those offsets', () => {
    const offset = view.getUint32(22 + 12, true)
    expect(Array.from(ico.subarray(offset, offset + p32.length))).toEqual(Array.from(p32))
  })

  it('stores a 256 px image as 0 in the width and height fields', () => {
    const big = buildIco([fakePng(256, 256)])
    expect(big[6]).toBe(0)
    expect(big[7]).toBe(0)
    expect(new DataView(big.buffer).getUint16(4, true)).toBe(1)
  })

  it('rejects empty input, non-PNG data, non-square and oversized images', () => {
    expect(() => buildIco([])).toThrow(/At least one PNG/)
    expect(() => buildIco([new TextEncoder().encode('not a png, but long enough to check the header')])).toThrow(/not a PNG/)
    expect(() => buildIco([fakePng(32, 16)])).toThrow(/not square/)
    expect(() => buildIco([fakePng(512, 512)])).toThrow(/1 to 256 px/)
  })
})

describe('buildLinkTags', () => {
  it('uses the root path by default and lists the icon files', () => {
    const tags = buildLinkTags('')
    expect(tags).toContain('<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">')
    expect(tags).toContain('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">')
    expect(tags).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">')
    expect(tags).toContain('<link rel="manifest" href="/site.webmanifest">')
  })
  it('prefixes every href with the base path', () => {
    const tags = buildLinkTags('/assets/icons')
    expect(tags.split('\n').every(line => line.includes('href="/assets/icons/'))).toBe(true)
  })
  it('escapes characters that would break out of the attribute', () => {
    const tags = buildLinkTags('"><script>')
    expect(tags).not.toContain('<script>')
    expect(tags).toContain('&quot;&gt;&lt;script&gt;/favicon.ico')
  })
})

describe('normalizeBasePath', () => {
  it('ends the path with a slash and defaults to the root', () => {
    expect(normalizeBasePath('')).toBe('/')
    expect(normalizeBasePath('  ')).toBe('/')
    expect(normalizeBasePath('/img')).toBe('/img/')
    expect(normalizeBasePath('./icons/')).toBe('./icons/')
  })
})

describe('buildManifest', () => {
  it('produces the JSON the manifest needs', () => {
    const manifest = JSON.parse(buildManifest('My Site', '#1E90FF'))
    expect(manifest.name).toBe('My Site')
    expect(manifest.short_name).toBe('My Site')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#1e90ff')
    expect(manifest.icons).toEqual([
      { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ])
  })
  it('uses a fallback name and white for an invalid colour', () => {
    const manifest = JSON.parse(buildManifest('   ', 'red'))
    expect(manifest.name).toBe('App')
    expect(manifest.background_color).toBe('#ffffff')
  })
  it('escapes names through JSON', () => {
    const manifest = JSON.parse(buildManifest('Say "hi" <b>', '#000000'))
    expect(manifest.name).toBe('Say "hi" <b>')
  })
})

describe('sanitizeHexColor', () => {
  it('accepts 6-digit hex and rejects everything else', () => {
    expect(sanitizeHexColor('#AABBCC')).toBe('#aabbcc')
    expect(sanitizeHexColor('#abc')).toBe('#ffffff')
    expect(sanitizeHexColor('')).toBe('#ffffff')
  })
})

describe('zipFiles', () => {
  it('packs the entries into a ZIP that unzips to the same bytes', async () => {
    const zip = await zipFiles([
      { name: 'favicon-16x16.png', data: fakePng(16, 16) },
      { name: 'favicon.ico', data: buildIco([fakePng(16, 16)]) },
    ])
    const files = unzipSync(zip)
    expect(Object.keys(files).sort()).toEqual(['favicon-16x16.png', 'favicon.ico'])
    expect(Array.from(files['favicon-16x16.png'])).toEqual(Array.from(fakePng(16, 16)))
  })
})

describe('Favicon Generator guide', () => {
  it('its worked example lists the files the tool really produces', () => {
    const example = FAVICON_GENERATOR_META.guide!.example!
    for (const name of packageFileNames()) {
      expect(example.output).toContain(name)
    }
  })
})
