import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { xml } from '@codemirror/lang-xml'
import { sql } from '@codemirror/lang-sql'
import { markdown } from '@codemirror/lang-markdown'
import type { Extension } from '@codemirror/state'

/**
 * Returns CodeMirror language extensions for the specified language string.
 */
export function getEditorLanguageExtension(language: string): Extension[] {
  const lang = (language || '').toLowerCase().trim()
  switch (lang) {
    case 'javascript':
    case 'js':
    case 'jsx':
      return [javascript()]
    case 'typescript':
    case 'ts':
    case 'tsx':
      return [javascript({ typescript: true })]
    case 'json':
      return [json()]
    case 'html':
      return [html()]
    case 'css':
      return [css()]
    case 'xml':
    case 'svg':
      return [xml()]
    case 'sql':
      return [sql()]
    case 'markdown':
    case 'md':
      return [markdown()]
    default:
      return []
  }
}
