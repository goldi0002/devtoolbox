import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: React.ReactNode
  valueClassName?: string
  /** Optional Lucide icon component displayed next to the value */
  icon?: LucideIcon
  /** Visual variant — reserved for future styling */
  variant?: string
  /** Optional secondary text displayed below the main value */
  subValue?: string
}

export default function StatCard({ label, value, valueClassName = '', icon: Icon, subValue }: StatCardProps) {
  return (
    <div className="border border-border rounded px-3 py-2">
      <div className="text-subtle mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-accent shrink-0" />}
        <div className={`text-bright ${valueClassName}`.trim()}>{value}</div>
      </div>
      {subValue && (
        <div className="text-[10px] font-mono text-dim mt-1 truncate">{subValue}</div>
      )}
    </div>
  )
}
