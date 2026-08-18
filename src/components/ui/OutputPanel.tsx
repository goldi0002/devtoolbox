import { useState } from 'react'
import CopyButton from '../CopyButton'
import { Download, WrapText, Check, AlertCircle } from 'lucide-react'

interface OutputPanelProps {
  label?: string
  value?: string
  content?: string
  error?: string
  placeholder?: string
  /** Height class or min height for output box */
  heightClass?: string
  surface?: 'muted' | 'surface'
  language?: string
}

export default function OutputPanel({
  label = 'Output',
  value,
  content,
  error = '',
  placeholder = 'Output will appear here...',
  heightClass = 'min-h-[140px] max-h-[400px]',
  surface = 'surface',
  language = 'text',
}: OutputPanelProps) {
  const [wordWrap, setWordWrap] = useState(true)
  const [downloaded, setDownloaded] = useState(false)

  const textVal = value ?? content ?? ''
  const lineCount = textVal ? textVal.split('\n').length : 0
  const charCount = textVal.length
  const byteSize = textVal ? (new Blob([textVal]).size < 1024 ? `${new Blob([textVal]).size} B` : `${(new Blob([textVal]).size / 1024).toFixed(1)} KB`) : '0 B'

  const handleDownload = () => {
    if (!textVal) return
    const blob = new Blob([textVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const ext = language === 'json' ? 'json' : language === 'html' ? 'html' : language === 'xml' ? 'xml' : 'txt'
    link.download = `output-${Date.now()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden shadow-sm transition-all hover:border-border/80">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-muted/30 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
          <span className="text-xs font-medium font-mono text-bright">{label}</span>
          {textVal && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {charCount} chars ({byteSize})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWordWrap(!wordWrap)}
            title={wordWrap ? "Disable Word Wrap" : "Enable Word Wrap"}
            className={`p-1 rounded text-xs transition-colors ${
              wordWrap ? 'bg-accent/20 text-accent' : 'text-dim hover:text-bright hover:bg-muted'
            }`}
          >
            <WrapText size={14} />
          </button>

          {/* Download Button */}
          {textVal && !error && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download Output"
              className="p-1.5 rounded text-xs font-mono text-dim hover:text-bright hover:bg-muted transition-colors flex items-center gap-1"
            >
              {downloaded ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
            </button>
          )}

          {/* Copy Button */}
          {textVal && <CopyButton text={textVal} />}
        </div>
      </div>

      {/* Panel Body */}
      <div className={`p-3.5 overflow-auto ${heightClass} font-mono text-xs leading-relaxed`}>
        {error ? (
          <div className="flex items-start gap-2 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-xs mb-1">Execution Error</div>
              <div className="whitespace-pre-wrap break-all opacity-90">{error}</div>
            </div>
          </div>
        ) : textVal ? (
          <pre
            className={`text-bright ${
              wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
            }`}
          >
            {textVal}
          </pre>
        ) : (
          <span className="text-subtle select-none italic">{placeholder}</span>
        )}
      </div>
    </div>
  )
}

