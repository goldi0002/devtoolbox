interface TipsCardProps {
  title: string
  items: string[]
}

export default function TipsCard({ title, items }: TipsCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-surface/50">
      <p className="text-[10px] font-mono text-subtle tracking-widest uppercase mb-2">{title}</p>
      <ul className="space-y-2 text-xs font-sans text-dim leading-relaxed">
        {items.map(item => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}
