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
      className={`group flex h-full flex-col rounded-2xl border border-border bg-bg p-5 shadow-soft
                  transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-lift
                  animate-slide-up opacity-0 ${delay}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="tag">{tag}</span>
        <span className="text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
          →
        </span>
      </div>

      <h3 className="mb-2 font-sans text-base font-semibold tracking-tight text-bright transition-colors group-hover:text-accent">
        {title}
      </h3>
      <p className="mb-5 font-sans text-sm leading-6 text-dim">{description}</p>

      <span className="mt-auto font-mono text-[11px] text-subtle transition-colors group-hover:text-accent">
        /{slug}
      </span>
    </Link>
  )
}
