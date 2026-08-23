import { useState, useCallback, useRef, useMemo } from 'react'
import ClientOnly from './ClientOnly'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { getEditorLanguageExtension } from '../lib/editorLanguage'
import { Upload, Copy, Check, Trash2, FileCode, Play } from 'lucide-react'

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
  sampleValue?: string
  sampleLabel?: string
  /** HTML rows attribute — accepted for compatibility but not used by CodeMirror */
  rows?: number
}

export default function CodeInput({
  value,
  onChange,
  language = 'text',
  label,
  placeholder = 'Start typing…',
  minHeight = '220px',
  maxHeight = '480px',
  showLineNumbers = true,
  showStatusBar = true,
  onRun,
  runLabel = 'Run',
  disabled = false,
  sampleValue,
  sampleLabel = 'Load Sample',
  rows: _rows,
}: CodeInputProps) {
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [isFocused, setIsFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(
    (val: string) => { if (!disabled) onChange(val) },
    [disabled, onChange]
  )

  const lineCount = value ? value.split('\n').length : 1
  const byteSize = useMemo(() => {
    if (!value) return '0 B'
    const bytes = new TextEncoder().encode(value).length
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
  }, [value])

  const handleCopy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content !== undefined) onChange(content)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content !== undefined) onChange(content)
    }
    reader.readAsText(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border transition-all overflow-hidden bg-[#1e1e1e] shadow-lg ${
        isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/30' : isFocused ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : 'border-border'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt,.json,.js,.ts,.html,.css,.xml,.sql,.md,.csv,.svg"
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          {/* macOS traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {label && (
            <>
              <div className="w-px h-4 bg-[#3c3c3c]" />
              <span className="text-xs font-mono text-[#cccccc] font-medium flex items-center gap-1.5">
                <FileCode size={13} className="text-indigo-400" />
                {label}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sample Button */}
          {sampleValue && !disabled && (
            <button
              type="button"
              onClick={() => onChange(sampleValue)}
              className="text-xs font-mono px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-[#cccccc] transition-colors"
            >
              {sampleLabel}
            </button>
          )}

          {/* Upload File */}
          {!disabled && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
              className="flex items-center gap-1 text-xs font-mono text-[#a0a0a0] hover:text-white px-2 py-1 rounded hover:bg-[#2d2d2d] transition-colors"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}

          {/* Copy Button */}
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy code"
              className="flex items-center gap-1 text-xs font-mono text-[#a0a0a0] hover:text-white px-2 py-1 rounded hover:bg-[#2d2d2d] transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {/* Language badge */}
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9cdcfe] px-2 py-0.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded-md">
            {language}
          </span>

          {/* Clear button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Clear editor"
              className="text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors text-xs font-mono p-1 rounded"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Run button */}
          {onRun && (
            <button
              type="button"
              onClick={onRun}
              disabled={!value.trim() || disabled}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md
                bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Play size={11} fill="currentColor" />
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
            className="absolute inset-0 pointer-events-none px-4 py-3 text-sm font-mono text-[#666666] select-none flex flex-col items-center justify-center text-center gap-2"
          >
            <p className="text-xs">{placeholder}</p>
            <p className="text-[11px] text-[#555555]">Drag & drop a file or paste content directly</p>
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
              ...getEditorLanguageExtension(language),
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
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-t border-[#3c3c3c] text-[#808080] text-xs font-mono select-none">
          <div className="flex items-center gap-3">
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
