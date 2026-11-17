/**
 * Pure helpers for the Favicon Generator. Canvas drawing lives in the component;
 * everything here works on plain numbers and bytes so it can be unit tested.
 */

/** PNG sizes produced for the icon set (px, square). */
export const PNG_SIZES = [16, 32, 48, 180, 192, 512] as const

/** Sizes packed into favicon.ico. */
export const ICO_SIZES = [16, 32, 48] as const

export const ICO_FILE_NAME = 'favicon.ico'
export const MANIFEST_FILE_NAME = 'site.webmanifest'
export const ZIP_FILE_NAME = 'favicon-package.zip'

/** File name used for each PNG size. */
export function pngFileName(size: number): string {
  if (size === 180) return 'apple-touch-icon.png'
  if (size === 192) return 'android-chrome-192x192.png'
  if (size === 512) return 'android-chrome-512x512.png'
  return `favicon-${size}x${size}.png`
}

/** Every file in the package, in the order it is listed in the ZIP. */
export function packageFileNames(): string[] {
  return [...PNG_SIZES.map(pngFileName), ICO_FILE_NAME, MANIFEST_FILE_NAME]
}

/**
 * Normalises the folder the icons are served from so it always ends with "/".
 * An empty value means the site root.
 */
export function normalizeBasePath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return '/'
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

/**
 * Where a square of `size` px should be drawn so that a `srcWidth` x `srcHeight`
 * source fits inside it, keeping its aspect ratio and centring it. Small sources
 * are scaled up, because a favicon has to fill its size.
 */
export function containRect(
  srcWidth: number,
  srcHeight: number,
  size: number
): { dx: number; dy: number; dw: number; dh: number } {
  if (srcWidth <= 0 || srcHeight <= 0) return { dx: 0, dy: 0, dw: size, dh: size }
  const scale = Math.min(size / srcWidth, size / srcHeight)
  const dw = srcWidth * scale
  const dh = srcHeight * scale
  return { dx: (size - dw) / 2, dy: (size - dh) / 2, dw, dh }
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Width and height from the IHDR chunk of a PNG, or null when the bytes are not a PNG. */
export function readPngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null
  if (!PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const type = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15])
  if (type !== 'IHDR') return null
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

const ICO_HEADER_SIZE = 6
const ICO_ENTRY_SIZE = 16

/**
 * Packs PNG files into a Windows ICO container (PNG-in-ICO, supported by every
 * browser). Each PNG must be square and no larger than 256 px. The header is
 * written as: reserved 0, type 1 (icon), image count, then one 16-byte directory
 * entry per image, then the image data. A 256 px width or height is stored as 0.
 */
export function buildIco(pngs: Uint8Array[]): Uint8Array<ArrayBuffer> {
  if (pngs.length === 0) throw new Error('At least one PNG is needed to build an ICO file.')
  if (pngs.length > 0xffff) throw new Error('Too many images for one ICO file.')

  const sizes = pngs.map((png, index) => {
    const size = readPngSize(png)
    if (!size) throw new Error(`ICO image ${index + 1} is not a PNG file.`)
    if (size.width !== size.height) throw new Error(`ICO image ${index + 1} is not square.`)
    if (size.width < 1 || size.width > 256) throw new Error(`ICO image ${index + 1} must be 1 to 256 px wide.`)
    return size.width
  })

  const dataStart = ICO_HEADER_SIZE + ICO_ENTRY_SIZE * pngs.length
  const total = pngs.reduce((sum, png) => sum + png.length, dataStart)
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)

  view.setUint16(0, 0, true) // reserved, must be 0
  view.setUint16(2, 1, true) // type 1 = icon (2 would be cursor)
  view.setUint16(4, pngs.length, true)

  let offset = dataStart
  pngs.forEach((png, i) => {
    const entry = ICO_HEADER_SIZE + ICO_ENTRY_SIZE * i
    const size = sizes[i]
    const stored = size === 256 ? 0 : size
    out[entry] = stored // width
    out[entry + 1] = stored // height
    out[entry + 2] = 0 // colour count (0 = true colour, no palette)
    out[entry + 3] = 0 // reserved
    view.setUint16(entry + 4, 1, true) // colour planes
    view.setUint16(entry + 6, 32, true) // bits per pixel
    view.setUint32(entry + 8, png.length, true) // size of the image data in bytes
    view.setUint32(entry + 12, offset, true) // offset of the image data from the start of the file
    out.set(png, offset)
    offset += png.length
  })

  return out
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** The <link> tags for the head of an HTML page, with hrefs under basePath. */
export function buildLinkTags(basePath: string): string {
  const base = normalizeBasePath(basePath)
  const href = (file: string) => escapeAttribute(`${base}${file}`)
  return [
    `<link rel="icon" href="${href(ICO_FILE_NAME)}" sizes="16x16 32x32 48x48">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="${href(pngFileName(16))}">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${href(pngFileName(32))}">`,
    `<link rel="icon" type="image/png" sizes="48x48" href="${href(pngFileName(48))}">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="${href(pngFileName(180))}">`,
    `<link rel="manifest" href="${href(MANIFEST_FILE_NAME)}">`,
  ].join('\n')
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

/** Returns the colour when it is a 6-digit hex value, otherwise white. */
export function sanitizeHexColor(value: string): string {
  return HEX_COLOR.test(value) ? value.toLowerCase() : '#ffffff'
}

/**
 * The site.webmanifest JSON. Icon paths are plain file names, because browsers
 * resolve manifest icons relative to the manifest itself.
 */
export function buildManifest(name: string, themeColor: string): string {
  const appName = name.trim() || 'App'
  const color = sanitizeHexColor(themeColor)
  const manifest = {
    name: appName,
    short_name: appName,
    icons: [
      { src: pngFileName(192), sizes: '192x192', type: 'image/png' },
      { src: pngFileName(512), sizes: '512x512', type: 'image/png' },
    ],
    theme_color: color,
    background_color: color,
    display: 'standalone',
  }
  return JSON.stringify(manifest, null, 2)
}

export interface ZipEntry {
  name: string
  data: Uint8Array
}

/**
 * Builds a ZIP archive. fflate is loaded on demand so it stays out of the main bundle.
 */
export async function zipFiles(entries: ZipEntry[]): Promise<Uint8Array<ArrayBuffer>> {
  const { zipSync } = await import('fflate')
  const files: Record<string, Uint8Array> = {}
  for (const entry of entries) files[entry.name] = entry.data
  return zipSync(files, { level: 6 }) as Uint8Array<ArrayBuffer>
}
