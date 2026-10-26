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
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80
                  bg-surface/85 backdrop-blur-xl p-5 transition-all duration-300
                  hover:-translate-y-1.5 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10
                  animate-slide-up ${delay}`}
    >
      {/* Top gradient glow bar */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <ToolIcon slug={slug} category={category} name={icon} withBadge={false} size={18} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-muted/60 text-indigo-400 border border-border/60 truncate">
            {tag}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition-all ${
              isFavorited
                ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                : 'text-subtle/50 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-muted'
            }`}
            title={isFavorited ? 'Unpin tool' : 'Pin tool'}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${title}`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-400' : ''}`} />
          </button>
          <span className="text-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-400">
            →
          </span>
        </div>
      </div>

      <h3 className="mb-2 font-sans text-base font-bold text-bright transition-colors group-hover:text-indigo-400">
        {title}
      </h3>
      <p className="mb-5 font-sans text-xs leading-relaxed text-dim flex-1">{description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-auto">
        <span className="font-mono text-[11px] text-muted group-hover:text-subtle transition-colors">
          /{slug}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/40 text-subtle">
          Client-side
        </span>
      </div>
    </Link>
  )
}
