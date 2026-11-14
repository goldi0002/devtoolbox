import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')

// CRC32 table for PNG chunk encoding
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c >>> 0
}

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = width * 4 + 1
  const raw = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride
    raw[rowStart] = 0 // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4)
  }

  const compressed = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// Signed distance to a rounded rectangle centered at (cx, cy) with half-sizes (hx, hy) and corner radius r
function roundedRectCoverage(px, py, cx, cy, hx, hy, r) {
  const dx = Math.abs(px - cx) - (hx - r)
  const dy = Math.abs(py - cy) - (hy - r)
  const ox = Math.max(dx, 0)
  const oy = Math.max(dy, 0)
  const dist = Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - r
  return Math.max(0, Math.min(1, 0.5 - dist))
}

function blendPixel(buf, idx, r, g, b, alpha) {
  if (alpha <= 0) return
  const srcA = alpha
  const dstA = buf[idx + 3] / 255
  const outA = srcA + dstA * (1 - srcA)
  if (outA <= 0) return
  buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA)
  buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA)
  buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA)
  buf[idx + 3] = Math.round(outA * 255)
}

/**
 * Renders the ToolBox4Devs 2x2 geometric mark matching public/images/favicon.svg
 */
function renderLogoIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)

  // Normalized 32x32 design space; maskable adds ~15% safe-zone padding on all sides
  const scale = maskable ? 0.72 : 1.0
  const offset = ((1 - scale) * size) / 2
  const unit = (size * scale) / 32

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      if (maskable) {
        // Full-bleed dark background (#0f0f11)
        rgba[idx] = 15
        rgba[idx + 1] = 15
        rgba[idx + 2] = 17
        rgba[idx + 3] = 255
      } else {
        // Rounded dark square (#0a0a0a) matching favicon.svg
        const bgCov = roundedRectCoverage(x + 0.5, y + 0.5, size / 2, size / 2, size / 2, size / 2, 6 * unit)
        blendPixel(rgba, idx, 10, 10, 10, bgCov)
      }

      // 4 tiles in 32x32 coordinates:
      // TL: (6,6,8,8) white 1.0, TR: (18,6,8,8) white 0.5
      // BL: (6,18,8,8) white 0.5, BR: (18,18,8,8) white 1.0
      const tiles = [
        { cx: 10, cy: 10, alpha: 1.0 },
        { cx: 22, cy: 10, alpha: 0.5 },
        { cx: 10, cy: 22, alpha: 0.5 },
        { cx: 22, cy: 22, alpha: 1.0 },
      ]

      for (const tile of tiles) {
        const cov = roundedRectCoverage(
          x + 0.5,
          y + 0.5,
          offset + tile.cx * unit,
          offset + tile.cy * unit,
          4 * unit,
          4 * unit,
          Math.max(0.5, 1 * unit)
        )
        if (cov > 0) {
          blendPixel(rgba, idx, 255, 255, 255, cov * tile.alpha)
        }
      }
    }
  }

  return encodePng(size, size, rgba)
}

/**
 * Renders a 1200x630 dark branded OpenGraph social card
 */
function renderOgBanner() {
  const width = 1200
  const height = 630
  const rgba = Buffer.alloc(width * height * 4)

  // Subtle dark radial glow backdrop (#0f0f11 -> subtle indigo glow in center)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const dx = (x - width / 2) / (width * 0.45)
      const dy = (y - height / 2) / (height * 0.55)
      const glow = Math.max(0, 1 - Math.hypot(dx, dy))
      const g2 = glow * glow * 0.22
      rgba[idx] = Math.round(15 + 75 * g2)
      rgba[idx + 1] = Math.round(15 + 85 * g2)
      rgba[idx + 2] = Math.round(17 + 210 * g2)
      rgba[idx + 3] = 255

      // Subtle grid lines every 48px
      if (x % 48 === 0 || y % 48 === 0) {
        blendPixel(rgba, idx, 255, 255, 255, 0.03)
      }
    }
  }

  // Center emblem (180x180)
  const emblemSize = 180
  const emblemX = Math.floor((width - emblemSize) / 2)
  const emblemY = Math.floor((height - emblemSize) / 2)
  const unit = emblemSize / 32

  for (let y = 0; y < emblemSize; y++) {
    for (let x = 0; x < emblemSize; x++) {
      const px = emblemX + x
      const py = emblemY + y
      const idx = (py * width + px) * 4

      const bgCov = roundedRectCoverage(x + 0.5, y + 0.5, emblemSize / 2, emblemSize / 2, emblemSize / 2, emblemSize / 2, 6 * unit)
      blendPixel(rgba, idx, 24, 24, 27, bgCov)

      const tiles = [
        { cx: 10, cy: 10, r: 99, g: 102, b: 241, alpha: 1.0 },
        { cx: 22, cy: 10, r: 99, g: 102, b: 241, alpha: 0.45 },
        { cx: 10, cy: 22, r: 99, g: 102, b: 241, alpha: 0.45 },
        { cx: 22, cy: 22, r: 255, g: 255, b: 255, alpha: 0.95 },
      ]

      for (const tile of tiles) {
        const cov = roundedRectCoverage(
          x + 0.5,
          y + 0.5,
          tile.cx * unit,
          tile.cy * unit,
          4 * unit,
          4 * unit,
          1.2 * unit
        )
        if (cov > 0) {
          blendPixel(rgba, idx, tile.r, tile.g, tile.b, cov * tile.alpha)
        }
      }
    }
  }

  return encodePng(width, height, rgba)
}

/**
 * Encodes multiple PNG buffers into a standard multi-resolution .ico file
 */
function encodeIco(entries) {
  const count = entries.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(count, 4)

  const dirEntries = []
  let offset = 6 + count * 16

  for (const { size, png } of entries) {
    const dir = Buffer.alloc(16)
    dir[0] = size >= 256 ? 0 : size
    dir[1] = size >= 256 ? 0 : size
    dir[2] = 0 // color palette
    dir[3] = 0 // reserved
    dir.writeUInt16LE(1, 4) // color planes
    dir.writeUInt16LE(32, 6) // bits per pixel
    dir.writeUInt32LE(png.length, 8)
    dir.writeUInt32LE(offset, 12)
    dirEntries.push(dir)
    offset += png.length
  }

  return Buffer.concat([header, ...dirEntries, ...entries.map((e) => e.png)])
}

fs.mkdirSync(IMAGES_DIR, { recursive: true })

const targets = [
  { file: 'images/favicon-16.png', size: 16, maskable: false },
  { file: 'images/favicon-32.png', size: 32, maskable: false },
  { file: 'images/favicon-48.png', size: 48, maskable: false },
  { file: 'images/icon-64.png', size: 64, maskable: false },
  { file: 'images/icon-96.png', size: 96, maskable: false },
  { file: 'images/apple-touch-180.png', size: 180, maskable: false },
  { file: 'images/android-192.png', size: 192, maskable: false },
  { file: 'images/pwa-512.png', size: 512, maskable: false },
  { file: 'images/pwa-maskable-192.png', size: 192, maskable: true },
  { file: 'images/pwa-maskable-512.png', size: 512, maskable: true },
]

const renderedBySize = new Map()

for (const t of targets) {
  const png = renderLogoIcon(t.size, { maskable: t.maskable })
  fs.writeFileSync(path.join(PUBLIC_DIR, t.file), png)
  if (!t.maskable) {
    renderedBySize.set(t.size, png)
  }
}

const ico = encodeIco([
  { size: 16, png: renderedBySize.get(16) },
  { size: 32, png: renderedBySize.get(32) },
  { size: 48, png: renderedBySize.get(48) },
])
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico)
fs.writeFileSync(path.join(IMAGES_DIR, 'og-1200x630.png'), renderOgBanner())

console.log(`Generated ${targets.length} PNG icons, favicon.ico, and og-1200x630.png`)
