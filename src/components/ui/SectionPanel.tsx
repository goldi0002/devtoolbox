import CopyButton from '../CopyButton'

interface SectionPanelProps {
  label: string
  children: React.ReactNode
  /** Tailwind background class for the status dot, e.g. `bg-green-400`. */
  dot?: string
  copyText?: string
  extra?: React.ReactNode
}

export default function SectionPanel({ label, children, dot, copyText, extra }: SectionPanelProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
          <span className="text-xs font-mono text-dim tracking-widest uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {copyText !== undefined && <CopyButton text={copyText} disabled={!copyText} />}
        </div>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
