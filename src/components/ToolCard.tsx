import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useToolPreferences } from '../hooks/useToolPreferences'
import ToolIcon from './ui/ToolIcon'
import type { ToolCategory } from '../tools/tool-meta'

interface ToolCardProps {
  slug: string
  title: string
  description: string
  tag: string
  category?: ToolCategory | string
  icon?: string
  index?: number
}

export default function ToolCard({ slug, title, description, tag, category, icon, index = 0 }: ToolCardProps) {
  const { favoriteSet, toggleFavorite } = useToolPreferences()
  const isFavorited = favoriteSet.has(slug)

  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  const delay = delays[index % delays.length]

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(slug)
  }

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

      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ToolIcon slug={slug} category={category} name={icon} withBadge badgeSize="sm" size={15} />
          <span className="tag truncate">{tag}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1 rounded transition-colors ${
              isFavorited
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-subtle/40 opacity-0 group-hover:opacity-100 hover:text-amber-400'
            }`}
            title={isFavorited ? 'Unpin tool' : 'Pin tool'}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${title}`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-400' : ''}`} />
          </button>
          <span className="text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
            →
          </span>
        </div>
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
