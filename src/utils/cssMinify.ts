import { toSyntaxErrorInfo, type MinifyOutcome } from './minifyStats'

/**
 * Minifies a stylesheet with csso. csso is imported on first use, so it is
 * fetched as its own chunk and stays out of the main bundle.
 */
export async function minifyCss(source: string): Promise<MinifyOutcome> {
  const { minify } = await import('csso')
  try {
    const { css } = minify(source, { comments: false })
    return { ok: true, code: css }
  } catch (err) {
    return { ok: false, error: toSyntaxErrorInfo(err) }
  }
}
