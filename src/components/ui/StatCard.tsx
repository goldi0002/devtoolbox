interface StatCardProps {
  label: string
  value: React.ReactNode
  valueClassName?: string
}

export default function StatCard({ label, value, valueClassName = '' }: StatCardProps) {
  return (
    <div className="border border-border rounded px-3 py-2">
      <div className="text-subtle mb-1">{label}</div>
      <div className={`text-bright ${valueClassName}`.trim()}>{value}</div>
    </div>
  )
}
