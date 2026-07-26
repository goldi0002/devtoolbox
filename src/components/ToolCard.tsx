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
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-border
                  bg-surface/60 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent
                  hover:shadow-lift animate-slide-up opacity-0 ${delay}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="tag">{tag}</span>
        <span className="text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
          →
        </span>
      </div>

      <h3 className="mb-1.5 font-sans text-sm font-semibold text-bright transition-colors group-hover:text-accent">
        {title}
      </h3>
      <p className="mb-4 font-sans text-xs leading-relaxed text-dim">{description}</p>

      <span className="mt-auto font-mono text-[10px] text-muted transition-colors group-hover:text-subtle">
        /{slug}
      </span>
    </Link>
  )
}
