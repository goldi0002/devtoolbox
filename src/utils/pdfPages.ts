export type RangeResult = { ok: true; pages: number[] } | { ok: false; error: string }

/**
 * Parses a page selection such as "1-3, 5, 8-" into 0-based page indexes.
 * Pages keep the order they are written in and repeats are allowed.
 * "8-" means page 8 to the last page; "-3" is not accepted.
 */
export function parsePageRanges(spec: string, pageCount: number): RangeResult {
  if (pageCount < 1) return { ok: false, error: 'This PDF has no pages.' }
  const parts = spec.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: 'Enter the pages to keep, for example 1-3, 5.' }
  const pages: number[] = []
  for (const part of parts) {
    const match = /^(\d+)(?:\s*-\s*(\d*))?$/.exec(part)
    if (!match) return { ok: false, error: `"${part}" is not a page or range.` }
    const start = Number(match[1])
    const isRange = part.includes('-')
    const end = !isRange ? start : match[2] ? Number(match[2]) : pageCount
    if (start < 1 || end < 1) return { ok: false, error: 'Pages start at 1.' }
    if (start > pageCount || end > pageCount) {
      return { ok: false, error: `"${part}" is outside this PDF, which has ${pageCount} page${pageCount === 1 ? '' : 's'}.` }
    }
    if (end < start) return { ok: false, error: `"${part}" counts backwards. Write it as ${end}-${start}.` }
    for (let p = start; p <= end; p++) pages.push(p - 1)
  }
  return { ok: true, pages }
}

/** Returns a copy of the list with the item at `from` moved to `to` (clamped). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length) return [...items]
  const target = Math.max(0, Math.min(items.length - 1, to))
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(target, 0, item)
  return next
}

export function mergedFileName(): string {
  return 'merged.pdf'
}

export function extractedFileName(original: string): string {
  const base = original.replace(/\.pdf$/i, '') || 'document'
  return `${base}-pages.pdf`
}
