import { useEffect, useState } from 'react'
import type { Extension } from '@codemirror/state'
import { getCachedEditorLanguage, loadEditorLanguageExtension } from '../lib/editorLanguage'

/**
 * CodeMirror language extensions for `language`, loaded on demand.
 * Returns an empty array until the language pack arrives (the editor shows
 * plain text for that moment), then re-renders with syntax highlighting.
 */
export function useEditorLanguage(language: string): Extension[] {
  const [extensions, setExtensions] = useState(() => getCachedEditorLanguage(language))

  useEffect(() => {
    let active = true
    setExtensions(getCachedEditorLanguage(language))
    loadEditorLanguageExtension(language).then(ext => {
      if (active) setExtensions(ext)
    })
    return () => {
      active = false
    }
  }, [language])

  return extensions
}
