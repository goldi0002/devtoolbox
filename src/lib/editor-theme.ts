import { EditorView } from '@uiw/react-codemirror'

/**
 * Shared CodeMirror theme for ToolBox4Devs.
 * Uses CSS variables so it automatically responds to theme changes
 * (dark, light, nord, terminal, etc.) from ThemePicker.
 *
 * Usage:
 *   import { toolboxTheme, baseExtensions } from '@/lib/editor-theme'
 *
 *   <CodeMirror
 *     extensions={[...baseExtensions, yourLanguage]}
 *     theme="none"
 *   />
 */
export const toolboxTheme = EditorView.theme({
  // ── Wrapper ─────────────────────────────────────────────────────────
  '&': {
    fontSize:        '12px',
    fontFamily:      '"JetBrains Mono", "Fira Code", Consolas, monospace',
    backgroundColor: 'var(--color-surface)',
    color:           'var(--color-bright)',
    border:          '1px solid var(--color-border)',
    maxHeight:       '400px',
  },
  '&.cm-focused': {
    outline:     'none',
    borderColor: 'var(--color-subtle)',
  },

  // ── Content area ────────────────────────────────────────────────────
  '.cm-content': {
    padding:    '10px 12px',
    caretColor: 'var(--color-bright)',
    lineHeight: '1.6',
  },
  '.cm-line': {
    color: 'var(--color-bright)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // ── Gutter (line numbers) ────────────────────────────────────────────
  '.cm-gutters': {
    backgroundColor: 'var(--color-bg)',
    borderRight:     '1px solid var(--color-border)',
    color:           'var(--color-muted)',
    padding:         '0 6px 0 8px',
    minWidth:        '40px',
  },
  '.cm-gutterElement': {
    lineHeight: '1.6',
    fontSize:   '11px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color:           'var(--color-subtle)',
  },

  // ── Cursor ──────────────────────────────────────────────────────────
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-bright)',
  },

  // ── Selection ───────────────────────────────────────────────────────
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  '::selection': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ── Scrollbar ───────────────────────────────────────────────────────
  '.cm-scroller': {
    overflow:   'auto',        // scrolls once content exceeds maxHeight
    lineHeight: '1.6',
  },
  '.cm-scroller::-webkit-scrollbar': {
    width:  '6px',
    height: '6px',
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    background: 'var(--color-bg)',
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background:   'var(--color-border)',
    borderRadius: '3px',
  },
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {
    background: 'var(--color-subtle)',
  },

  // ── Placeholder ─────────────────────────────────────────────────────
  '.cm-placeholder': {
    color:      'var(--color-muted)',
    fontFamily: '"JetBrains Mono", monospace',
  },

  // ── Search / match highlight ─────────────────────────────────────────
  '.cm-searchMatch': {
    backgroundColor: 'rgba(255,255,255,0.15)',
    outline:         '1px solid var(--color-subtle)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
})

/**
 * Base extensions every tool should include.
 * Pass additional language or feature extensions alongside these.
 *
 * Example:
 *   import { json } from '@codemirror/lang-json'
 *   extensions={[...baseExtensions, json()]}
 */
export const baseExtensions = [
  EditorView.lineWrapping,
  toolboxTheme,
]

/**
 * Shared basicSetup config — disables features irrelevant to dev tools.
 * Override individual keys per tool as needed.
 */
export const baseSetup = {
  lineNumbers:               true,
  foldGutter:                false,
  dropCursor:                false,
  allowMultipleSelections:   false,
  indentOnInput:             false,
  syntaxHighlighting:        true,   // false for plain text tools
  highlightActiveLine:       true,
  highlightActiveLineGutter: true,
  autocompletion:            false,
  closeBrackets:             false,
} as const