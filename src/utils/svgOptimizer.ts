import type { Config } from 'svgo/browser'
import { savedPercent } from './imageCompress'

export interface SvgOptimizeOptions {
  /** Remove <!-- comments -->. */
  removeComments: boolean
  /** Remove <metadata> elements (editor and license blocks). */
  removeMetadata: boolean
  /** Rewrite path data and numeric values into shorter forms, rounded to `precision` decimals. */
  minifyPaths: boolean
  /** Decimal places kept for numbers when minifyPaths is on. */
  precision: number
}

export const DEFAULT_SVG_OPTIONS: SvgOptimizeOptions = {
  removeComments: true,
  removeMetadata: true,
  minifyPaths: true,
  precision: 3,
}

export const MAX_PRECISION = 8

/** Clamps the precision to a whole number between 0 and MAX_PRECISION. */
export function clampPrecision(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SVG_OPTIONS.precision
  return Math.min(MAX_PRECISION, Math.max(0, Math.round(value)))
}

/**
 * Maps the UI options onto an svgo config. Kept pure so it can be tested without
 * loading svgo itself. Plugins not listed here keep svgo's preset-default behaviour.
 */
export function buildSvgoConfig(options: SvgOptimizeOptions): Config {
  const overrides: Record<string, false> = {}
  if (!options.removeComments) overrides.removeComments = false
  if (!options.removeMetadata) overrides.removeMetadata = false
  if (!options.minifyPaths) {
    overrides.convertPathData = false
    overrides.cleanupNumericValues = false
  }
  return {
    multipass: false,
    floatPrecision: clampPrecision(options.precision),
    plugins: [{ name: 'preset-default', params: { overrides } }],
  }
}

/** A cheap check that the text contains an <svg> root element before svgo runs. */
export function looksLikeSvg(text: string): boolean {
  return /<svg[\s>/]/i.test(text)
}

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export type SvgOptimizeResult =
  | {
      ok: true
      output: string
      before: number
      after: number
      /** Percent saved; negative when optimizing made the file larger. */
      savedPercent: number
    }
  | { ok: false; error: string }

/**
 * Optimizes an SVG string in the browser. svgo is loaded with a dynamic import so it
 * is split into its own chunk and only fetched when this tool runs.
 */
export async function optimizeSvg(input: string, options: SvgOptimizeOptions): Promise<SvgOptimizeResult> {
  if (!input.trim()) return { ok: false, error: 'Paste an SVG or upload a .svg file.' }
  if (!looksLikeSvg(input)) {
    return { ok: false, error: 'This does not look like an SVG: no <svg> element was found.' }
  }

  const { optimize } = await import('svgo/browser')
  let output: string
  try {
    output = optimize(input, buildSvgoConfig(options)).data
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error'
    return { ok: false, error: `Could not parse this SVG: ${reason}` }
  }

  const before = byteLength(input)
  const after = byteLength(output)
  return { ok: true, output, before, after, savedPercent: savedPercent(before, after) }
}

/** File name for the optimized download, e.g. `icon.svg` → `icon.min.svg`. */
export function optimizedFileName(original: string | undefined): string {
  const base = (original ?? '').replace(/\.svg$/i, '').trim() || 'image'
  return `${base}.min.svg`
}
