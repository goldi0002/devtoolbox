import { useState, useCallback } from 'react'
import ClientOnly from './ClientOnly'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { xml } from '@codemirror/lang-xml'
import { sql } from '@codemirror/lang-sql'
import { markdown } from '@codemirror/lang-markdown'

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  language?: string
  label?: string
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  showLineNumbers?: boolean
  showStatusBar?: boolean
  onRun?: () => void
  runLabel?: string
  disabled?: boolean
}

function getExtension(language: string) {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts': return [javascript({ typescript: true })]
    case 'json': return [json()]
    case 'html': return [html()]
    case 'css': return [css()]
    case 'xml': return [xml()]
    case 'sql': return [sql()]
    case 'markdown':
    case 'md': return [markdown()]
    default: return []
  }
}

export default function CodeInput({
  value,
  onChange,
  language = 'text',
  label,
  placeholder = 'Start typing…',
  minHeight = '200px',
  maxHeight = '480px',
  showLineNumbers = true,
  showStatusBar = true,
  onRun,
  runLabel = 'Run',
  disabled = false,
}: CodeInputProps) {
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (val: string) => { if (!disabled) onChange(val) },
    [disabled, onChange]
  )

  const lineCount = value ? value.split('\n').length : 1
  const byteSize = value
    ? new Blob([value]).size < 1024
      ? `${new Blob([value]).size} B`
      : `${(new Blob([value]).size / 1024).toFixed(1)} KB`
    : '0 B'

  // Dim ring when focused
  const focusRing = isFocused ? '0 0 0 2px rgba(255,255,255,0.08)' : 'none'

  return (
    <div
      className="rounded-xl border border-border overflow-hidden bg-[#1e1e1e] shadow-lg transition-shadow"
      style={{ boxShadow: focusRing }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-4">
          {/* macOS traffic lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] cursor-default" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] cursor-default" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] cursor-default" />
          </div>

          {label && (
            <>
              <div className="w-px h-4 bg-[#3c3c3c]" />
              <span className="text-xs font-mono text-[#cccccc]">{label}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language badge */}
          <span className="text-xs font-mono text-[#6e7681] px-2 py-1 bg-[#2d2d2d] rounded-md">
            {language}
          </span>

          {/* Clear button */}
          {value && !disabled && (
            <button
              onClick={() => onChange('')}
              title="Clear"
              className="text-[#6e7681] hover:text-[#cccccc] transition-colors text-xs font-mono px-2 py-1 rounded hover:bg-[#2d2d2d]"
            >
              ✕ clear
            </button>
          )}

          {/* Run button */}
          {onRun && (
            <button
              onClick={onRun}
              disabled={!value.trim() || disabled}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md
                bg-[#0e639c] hover:bg-[#1177bb] text-white transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="2,1 9,5 2,9" />
              </svg>
              {runLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Editor ─────────────────────────────────────────── */}
      <div
        className="overflow-auto relative"
        style={{ minHeight, maxHeight }}
      >
        {/* Placeholder — shown when empty and not focused */}
        {!value && !isFocused && (
          <div
            className="absolute inset-0 pointer-events-none px-4 py-3 text-sm font-mono text-[#555] select-none"
            style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace', lineHeight: '1.6' }}
          >
            {placeholder}
          </div>
        )}

        <ClientOnly
          fallback={
            <textarea
              value={value}
              onChange={e => handleChange(e.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              disabled={disabled}
              className="w-full h-full p-4 text-sm font-mono text-[#d4d4d4] bg-[#1e1e1e]
                resize-none border-none outline-none leading-relaxed"
              style={{ minHeight, fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}
            />
          }
        >
          <ReactCodeMirror
            value={value}
            onChange={handleChange}
            extensions={[
              ...getExtension(language),
              EditorView.updateListener.of(update => {
                if (update.selectionSet) {
                  const sel = update.state.selection.main
                  const line = update.state.doc.lineAt(sel.head)
                  setCursor({
                    line: line.number,
                    col: sel.head - line.from + 1,
                  })
                }
              }),
              EditorView.domEventHandlers({
                focus: () => { setIsFocused(true); return false },
                blur:  () => { setIsFocused(false); return false },
              }),
            ]}
            theme="dark"
            editable={!disabled}
            basicSetup={{
              lineNumbers: showLineNumbers,
              foldGutter: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              bracketMatching: true,
              syntaxHighlighting: true,
              autocompletion: true,
              closeBrackets: true,
              indentOnInput: true,
            }}
            style={{
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            }}
          />
        </ClientOnly>
      </div>

      {/* ── Status bar ─────────────────────────────────────── */}
      {showStatusBar && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-t border-[#3c3c3c] text-[#6e7681] text-xs font-mono select-none">
          <div className="flex items-center gap-4">
            <span>Ln {cursor.line}, Col {cursor.col}</span>
            <span className="w-px h-3 bg-[#3c3c3c]" />
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            <span className="w-px h-3 bg-[#3c3c3c]" />
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{byteSize}</span>
            <span className="w-px h-3 bg-[#3c3c3c]" />
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full transition-colors"
                style={{ background: isFocused ? '#27c93f' : '#6e7681' }}
              />
              <span>{disabled ? 'Read Only' : isFocused ? 'Editing' : 'Ready'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}