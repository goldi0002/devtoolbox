export type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png' | 'image/avif'

export interface FormatInfo {
  mime: OutputFormat
  label: string
  extension: string
  /** PNG is lossless, so the quality setting has no effect on it. */
  lossy: boolean
}

export const FORMATS: readonly FormatInfo[] = [
  { mime: 'image/jpeg', label: 'JPEG', extension: 'jpg', lossy: true },
  { mime: 'image/webp', label: 'WebP', extension: 'webp', lossy: true },
  { mime: 'image/png', label: 'PNG', extension: 'png', lossy: false },
  { mime: 'image/avif', label: 'AVIF', extension: 'avif', lossy: true },
]

export function formatInfo(mime: OutputFormat): FormatInfo {
  return FORMATS.find(f => f.mime === mime) ?? FORMATS[0]
}

export interface Size {
  width: number
  height: number
}

/**
 * Scales to fit inside maxWidth x maxHeight, keeping the aspect ratio.
 * A limit of 0 (or less) means no limit on that side. Never enlarges.
 */
export function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number): Size {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 }
  const limitW = maxWidth > 0 ? maxWidth / width : Infinity
  const limitH = maxHeight > 0 ? maxHeight / height : Infinity
  const scale = Math.min(1, limitW, limitH)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/** Name for the converted file: same base name, new extension, optional suffix. */
export function outputFileName(original: string, mime: OutputFormat): string {
  const base = original.replace(/\.[^./\\]+$/, '') || 'image'
  return `${base}-compressed.${formatInfo(mime).extension}`
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Percentage saved (positive) or added (negative), rounded to a whole number. */
export function savedPercent(before: number, after: number): number {
  if (before <= 0) return 0
  return Math.round(((before - after) / before) * 100)
}

/** Whether the browser really encoded the requested type (unsupported types fall back to PNG). */
export function encodedAs(blobType: string, requested: OutputFormat): boolean {
  return blobType === requested
}

export function clampQuality(percent: number): number {
  if (!Number.isFinite(percent)) return 0.8
  return Math.min(1, Math.max(0.01, percent / 100))
}
