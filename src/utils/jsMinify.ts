import { toSyntaxErrorInfo, type MinifyOutcome } from './minifyStats'

export interface JsMinifyOptions {
  /** Shorten local variable and function names. */
  mangle: boolean
  /** Remove console.* calls. */
  dropConsole: boolean
}

/**
 * Minifies JavaScript with Terser. Terser is imported on first use, so it is
 * fetched as its own chunk and stays out of the main bundle.
 */
export async function minifyJavaScript(source: string, options: JsMinifyOptions): Promise<MinifyOutcome> {
  const { minify } = await import('terser')
  try {
    const result = await minify(source, {
      mangle: options.mangle ? {} : false,
      compress: { drop_console: options.dropConsole },
      format: { comments: false },
    })
    // Terser reports parse errors on the result rather than throwing; its typings omit this field.
    const failure = (result as { error?: unknown }).error
    if (failure) return { ok: false, error: toSyntaxErrorInfo(failure) }
    return { ok: true, code: result.code ?? '' }
  } catch (err) {
    return { ok: false, error: toSyntaxErrorInfo(err) }
  }
}
