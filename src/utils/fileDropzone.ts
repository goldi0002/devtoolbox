/** Pure helpers behind the shared FileDropzone. No DOM or React access, so they are unit tested directly. */

export interface FileRules {
  /** Comma-separated list: extensions (".png"), exact MIME types ("application/pdf"), or wildcards ("image/*"). */
  accept?: string
  /** Largest allowed file size in bytes. Omit for no limit. */
  maxBytes?: number
  /** Only true accepts several files. Otherwise just the first file is considered and extras are ignored. */
  multiple?: boolean
  /** Message for files over `maxBytes`. Defaults to a generic message that names the limit. */
  tooLargeMessage?: string
}

export interface FileCheckResult {
  accepted: File[]
  errors: string[]
}

type FileLike = Pick<File, 'name' | 'type'>

/** Splits an `accept` string into trimmed, non-empty tokens. */
export function parseAccept(accept?: string): string[] {
  if (!accept) return []
  return accept
    .split(',')
    .map(token => token.trim().toLowerCase())
    .filter(token => token.length > 0)
}

/** True when the file matches at least one `accept` token. An empty or missing accept list matches everything. */
export function matchesAccept(file: FileLike, accept?: string): boolean {
  const tokens = parseAccept(accept)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some(token => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    if (token.includes('/')) return type === token
    return false
  })
}

/** Human-readable size limit, for example "5 MB" or "512 KB". */
export function formatLimit(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024)
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Splits picked or dropped files into accepted files and error messages.
 * Each rejected file produces one message; identical messages are reported once.
 */
export function checkFiles(files: File[], rules: FileRules = {}): FileCheckResult {
  const candidates = rules.multiple === true ? files : files.slice(0, 1)
  const accepted: File[] = []
  const errors: string[] = []

  for (const file of candidates) {
    if (!matchesAccept(file, rules.accept)) {
      errors.push(`${file.name} is not a supported file type.`)
    } else if (rules.maxBytes !== undefined && file.size > rules.maxBytes) {
      errors.push(rules.tooLargeMessage ?? `${file.name} is larger than ${formatLimit(rules.maxBytes)}. Choose a smaller file.`)
    } else {
      accepted.push(file)
    }
  }

  return { accepted, errors: [...new Set(errors)] }
}
