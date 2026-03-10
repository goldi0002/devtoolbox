import { Link } from 'react-router-dom'

interface ToolCardProps {
  slug: string
  title: string
  description: string
  tag: string
  index?: number
}

export default function ToolCard({ slug, title, description, tag, index = 0 }: ToolCardProps) {
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  const delay = delays[index % delays.length]

  return (
    <Link
      to={`/${slug}`}
      className={`card group cursor-pointer hover:border-subtle hover:-translate-y-0.5 
                  hover:shadow-sm animate-slide-up opacity-0 ${delay}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="tag">{tag}</span>
        <span className="text-subtle group-hover:text-dim transition-colors duration-200 text-lg">→</span>
      </div>
      <h3 className="text-bright font-sans font-medium mb-1.5 text-sm">{title}</h3>
      <p className="text-dim text-xs leading-relaxed font-sans mb-3">{description}</p>
      <span className="text-[10px] font-mono text-muted group-hover:text-subtle transition-colors">/{slug}</span>
    </Link>
  )
}
