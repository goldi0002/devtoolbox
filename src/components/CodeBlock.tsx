import CopyButton from './CopyButton'
import ShareButton from './ui/ShareTool'
import ClientOnly from './ClientOnly'
import ReactCodeMirror from '@uiw/react-codemirror'
import { getEditorLanguageExtension } from '../lib/editorLanguage'
import { ToolDataShare } from '../types/share'
import { useState, useCallback, useMemo } from 'react'
import type { Statistics } from '@uiw/react-codemirror'
import { foldGutter, codeFolding } from '@codemirror/language'

type StatusType = 'ready' | 'editing' | 'saved' | 'error' | 'loading' | 'copied'

const STATUS_CONFIG: Record<StatusType, { label: string; color: string }> = {
  ready: { label: 'Ready', color: 'bg-green-500/50' },
  editing: { label: 'Editing', color: 'bg-yellow-400/60' },
  saved: { label: 'Saved', color: 'bg-blue-400/60' },
  error: { label: 'Error', color: 'bg-red-500/60' },
  loading: { label: 'Loading', color: 'bg-gray-400/50' },
  copied: { label: 'Copied', color: 'bg-purple-400/60' },
}

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  maxHeight?: string
  minHeight?: string
  showLineNumbers?: boolean
  readOnly?: boolean
  shareTool?: ToolDataShare
  onChange?: (value: string) => void
  theme?: 'light' | 'dark' | 'none'
  isForInput?: boolean
  status?: StatusType
}

export default function CodeBlock({
  code,
  language = 'text',
  label,
  maxHeight = '320px',
  minHeight,
  showLineNumbers = true,
  readOnly = true,
  shareTool,
  onChange,
  theme = 'dark',
  isForInput = false,
  status: externalStatus,
}: CodeBlockProps) {
  const [internalStatus, setInternalStatus] = useState<StatusType>('ready')
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  const extensions = useMemo(() => [
    ...getEditorLanguageExtension(language),
    codeFolding(),
    foldGutter(),
  ], [language])
  // Use external status if provided, otherwise use internal
  const activeStatus = externalStatus ?? internalStatus
  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[activeStatus]

  const handleChange = useCallback((value: string) => {
    if (!externalStatus) setInternalStatus('editing')
    onChange?.(value)
  }, [onChange, externalStatus])

  const handleFocus = useCallback(() => {
    if (!externalStatus && !readOnly) setInternalStatus('editing')
  }, [externalStatus, readOnly])

  const handleBlur = useCallback(() => {
    if (!externalStatus && !readOnly) setInternalStatus('ready')
  }, [externalStatus, readOnly])

  const handleStatistics = useCallback((data: Statistics) => {
    const newLine = data.line.number
    const newCol = data.selection.main.head - data.line.from + 1

    setCursorPos(prev => {
      if (prev.line === newLine && prev.col === newCol) return prev  // ← no change, no re-render
      return { line: newLine, col: newCol }
    })
  }, [])
  if (!isForInput && !code) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-[#1e1e1e] shadow-lg">
      {/* Header with macOS-style traffic lights */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all cursor-default" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition-all cursor-default" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 transition-all cursor-default" />
          </div>
          {label && (
            <>
              <div className="w-px h-4 bg-[#3c3c3c]" />
              <span className="text-xs font-mono text-[#cccccc]">{label}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#6e7681] px-2 py-1 bg-[#2d2d2d] rounded-md">
            {language}
          </span>
          <CopyButton text={code} />
          {shareTool && (
            <ShareButton data={shareTool} size="sm" disabled={false} />
          )}
        </div>
      </div>

      {/* CodeMirror with dark theme */}
      <div
        className="overflow-auto"
        style={{ 
          maxHeight,
          minHeight,
          scrollbarWidth: 'thin',                    // Firefox
          scrollbarColor: '#4e4e4e #1e1e1e',         // Firefox: thumb track
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <ClientOnly
          fallback={
            <pre className="p-4 text-xs font-mono text-[#d4d4d4] leading-relaxed whitespace-pre-wrap break-all overflow-x-auto bg-[#1e1e1e]">
              {code}
            </pre>
          }
        >
          <ReactCodeMirror
            value={code}
            extensions={extensions}
            theme={theme}
            editable={!readOnly}
            basicSetup={{
              lineNumbers: showLineNumbers,
              foldGutter: false,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
              bracketMatching: true,
              syntaxHighlighting: true,
              autocompletion: false,
            }}
            style={{
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            }}
            onChange={handleChange}
            onStatistics={handleStatistics}
          />
        </ClientOnly>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-t border-[#3c3c3c] text-[#6e7681] text-xs font-mono">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${statusColor}`} />
          <span className="transition-all duration-300">{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}