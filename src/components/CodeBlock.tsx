import CopyButton from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  maxHeight?: string
}

export default function CodeBlock({ code, language = 'text', label, maxHeight = '320px' }: CodeBlockProps) {
  if (!code) return null

  return (
    <div className="rounded border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#f8f8f8] border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted" />
            <div className="w-2.5 h-2.5 rounded-full bg-muted" />
          </div>
          {label && <span className="text-xs text-subtle font-mono ml-1">{label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtle font-mono">{language}</span>
          <CopyButton text={code} />
        </div>
      </div>
      <div
        className="overflow-auto bg-[#f8f8f8]"
        style={{ maxHeight }}
      >
        <pre className="p-4 text-xs font-mono text-light leading-relaxed whitespace-pre-wrap break-all">
          {code}
        </pre>
      </div>
    </div>
  )
}
