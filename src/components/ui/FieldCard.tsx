import CopyButton from '../CopyButton'

interface FieldCardProps {
  label: string
  value: string
  /** Text style of the value, `mono` for machine output and `sans` for prose. */
  font?: 'mono' | 'sans'
  emphasis?: 'bright' | 'dim'
  copyable?: boolean
  className?: string
}

export default function FieldCard({
  label,
  value,
  font = 'mono',
  emphasis = 'bright',
  copyable = false,
  className = 'border border-border rounded p-4 bg-surface',
}: FieldCardProps) {
  const valueClasses = [
    'text-sm flex-1',
    font === 'mono' ? 'font-mono break-all' : 'font-sans break-words',
    emphasis === 'bright' ? 'text-bright' : 'text-dim',
  ].join(' ')

  return (
    <div className={className}>
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">{label}</div>
      <div className="flex items-start gap-3">
        <p className={valueClasses}>{value}</p>
        {copyable && value && <CopyButton text={value} />}
      </div>
    </div>
  )
}
