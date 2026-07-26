import CopyButton from '../CopyButton'

interface OutputPanelProps {
  label: string
  value: string
  error?: string
  placeholder?: string
  /** Tailwind height class for the output box, e.g. `h-36`. */
  heightClass?: string
  surface?: 'muted' | 'surface'
}

export default function OutputPanel({
  label,
  value,
  error = '',
  placeholder = 'Output will appear here...',
  heightClass = 'h-36',
  surface = 'muted',
}: OutputPanelProps) {
  const background = surface === 'muted' ? 'bg-[#f8f8f8]' : 'bg-surface'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-dim font-mono">{label}</label>
        {value && <CopyButton text={value} />}
      </div>
      <div className={`${background} border border-border rounded px-3 py-2 ${heightClass} overflow-auto`}>
        {error ? (
          <span className="text-xs font-mono text-subtle">⚠ {error}</span>
        ) : value ? (
          <pre className="text-xs font-mono text-light whitespace-pre-wrap break-all">{value}</pre>
        ) : (
          <span className="text-xs font-mono text-subtle">{placeholder}</span>
        )}
      </div>
    </div>
  )
}
