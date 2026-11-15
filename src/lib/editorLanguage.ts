import type { Extension } from '@codemirror/state'

/**
 * CodeMirror language support, loaded on demand.
 *
 * Each language pack is a dynamic import so a page only downloads the grammar
 * it actually displays (e.g. the JSON Formatter never fetches the SQL or
 * Markdown parsers). Resolved extensions are cached, so editors mounted after
 * the first one get their language synchronously via `getCachedEditorLanguage`.
 */

type LanguageKey = 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'xml' | 'sql' | 'markdown'

const ALIASES: Record<string, LanguageKey> = {
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  html: 'html',
  css: 'css',
  xml: 'xml',
  svg: 'xml',
  sql: 'sql',
  markdown: 'markdown',
  md: 'markdown',
}

const LOADERS: Record<LanguageKey, () => Promise<Extension>> = {
  javascript: () => import('@codemirror/lang-javascript').then(m => m.javascript()),
  typescript: () => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  json: () => import('@codemirror/lang-json').then(m => m.json()),
  html: () => import('@codemirror/lang-html').then(m => m.html()),
  css: () => import('@codemirror/lang-css').then(m => m.css()),
  xml: () => import('@codemirror/lang-xml').then(m => m.xml()),
  sql: () => import('@codemirror/lang-sql').then(m => m.sql()),
  markdown: () => import('@codemirror/lang-markdown').then(m => m.markdown()),
}

const NO_EXTENSIONS: Extension[] = []
const resolved = new Map<LanguageKey, Extension[]>()
const pending = new Map<LanguageKey, Promise<Extension[]>>()

/** Normalizes a language name/alias; returns null for plain text or unknown languages. */
export function resolveEditorLanguage(language: string): LanguageKey | null {
  return ALIASES[(language || '').toLowerCase().trim()] ?? null
}

/** Returns the extensions for `language` if already loaded, otherwise an empty array. */
export function getCachedEditorLanguage(language: string): Extension[] {
  const key = resolveEditorLanguage(language)
  return (key && resolved.get(key)) || NO_EXTENSIONS
}

/** Loads (once) and returns the CodeMirror extensions for `language`. */
export function loadEditorLanguageExtension(language: string): Promise<Extension[]> {
  const key = resolveEditorLanguage(language)
  if (!key) return Promise.resolve(NO_EXTENSIONS)

  const cached = resolved.get(key)
  if (cached) return Promise.resolve(cached)

  let request = pending.get(key)
  if (!request) {
    request = LOADERS[key]()
      .then(ext => {
        const extensions = [ext]
        resolved.set(key, extensions)
        return extensions
      })
      .catch(() => NO_EXTENSIONS) // Highlighting is optional; never break the editor.
      .finally(() => pending.delete(key))
    pending.set(key, request)
  }
  return request
}
