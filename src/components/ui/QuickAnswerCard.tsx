import CopyButton from '../CopyButton'

interface QuickAnswerCardProps {
  headline: string
  subline: string
  copyText: string
}

export default function QuickAnswerCard({ headline, subline, copyText }: QuickAnswerCardProps) {
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
