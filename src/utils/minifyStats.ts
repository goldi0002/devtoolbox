/** Where a minifier found a problem in the source, when it can tell. */
export interface SyntaxErrorInfo {
  message: string
  /** 1-based line of the problem. */
  line?: number
  /** 1-based column of the problem. */
  column?: number
}

export type MinifyOutcome = { ok: true; code: string } | { ok: false; error: SyntaxErrorInfo }

/** UTF-8 size in bytes, which is what a file on disk would weigh. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

/**
 * Share of the original size removed, rounded to one decimal place.
 * Negative when the output is larger than the input. Zero for empty input.
 */
export function savingsPercent(originalBytes: number, minifiedBytes: number): number {
  if (originalBytes <= 0) return 0
  return Math.round(((originalBytes - minifiedBytes) / originalBytes) * 1000) / 10
}

/** A short, readable line for a minifier error, with its position when known. */
export function describeSyntaxError(info: SyntaxErrorInfo): string {
  if (info.line === undefined) return `Could not minify: ${info.message}`
  const column = info.column === undefined ? '' : `, column ${info.column}`
  return `Syntax error at line ${info.line}${column}: ${info.message}`
}

/** Reads the position fields that minifier libraries attach to their errors. */
export function toSyntaxErrorInfo(err: unknown): SyntaxErrorInfo {
  if (typeof err !== 'object' || err === null) return { message: String(err) }
  const { message: rawMessage, line, col, column } = err as {
    message?: unknown
    line?: unknown
    col?: unknown
    column?: unknown
  }
  const message = typeof rawMessage === 'string' && rawMessage ? rawMessage : 'Unknown error'
  if (typeof line !== 'number') return { message }
  // Terser reports `col` counted from zero; shift it to the 1-based column people see in editors.
  const rawColumn = typeof col === 'number' ? col : typeof column === 'number' ? column : undefined
  return rawColumn === undefined ? { message, line } : { message, line, column: rawColumn + 1 }
}
