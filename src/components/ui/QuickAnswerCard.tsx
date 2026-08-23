import CopyButton from '../CopyButton'

interface QuickAnswerCardProps {
  headline?: string
  subline?: string
  copyText?: string
  /** Card title — used by tools that pass title + items layout */
  title?: string
  /** Key-value items list — rendered as a description list when provided */
  items?: { label: string; value: string }[]
}

export default function QuickAnswerCard({ headline, subline, copyText, title, items }: QuickAnswerCardProps) {
  // Legacy headline/subline/copyText mode
  if (headline && subline && copyText) {
    return (
      <div className="border border-border rounded bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-1">Quick answer</div>
          <div className="text-lg font-sans text-bright">{headline}</div>
          <div className="text-xs font-mono text-subtle mt-1">{subline}</div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <CopyButton text={copyText} size="md" />
        </div>
      </div>
    )
  }

  // New title + items mode
  if (title && items) {
    return (
      <div className="border border-border rounded bg-surface p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">{title}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-2 py-1.5 rounded bg-bg border border-border/50">
              <span className="text-[11px] font-mono text-dim truncate">{item.label}</span>
              <span className="text-xs font-mono text-bright font-medium truncate">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
