import { Link } from 'react-router-dom'
import { tools, categoryLabels } from '../tools/registry'

const productLinks = [
  { label: 'All tools', path: '/tools' },
  { label: 'Changelog', path: '/changelog' },
  { label: 'About', path: '/about' },
  { label: 'Privacy', path: '/privacy' },
]

const topCategories = Object.entries(
  tools.reduce<Record<string, number>>((acc, tool) => {
    acc[tool.category] = (acc[tool.category] ?? 0) + 1
    return acc
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 grid grid-cols-2 gap-0.5 p-1 rounded-md bg-accent-soft">
              <div className="bg-accent rounded-[2px]" />
              <div className="bg-accent/40 rounded-[2px]" />
              <div className="bg-accent/40 rounded-[2px]" />
              <div className="bg-accent rounded-[2px]" />
            </div>
            <span className="font-display text-lg tracking-wider text-bright">TOOLBOX4DEVS</span>
          </div>
          <p className="text-sm text-dim leading-relaxed max-w-sm">
            {tools.length} developer utilities that run entirely in your browser. No accounts, no ads,
            no data ever leaves your machine.
          </p>
        </div>

        <nav aria-label="Product">
          <p className="eyebrow mb-3">Product</p>
          <ul className="space-y-2">
            {productLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm text-dim hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Categories">
          <p className="eyebrow mb-3">Categories</p>
          <ul className="space-y-2">
            {topCategories.map(([category, count]) => (
              <li key={category}>
                <Link
                  to={`/tools/${category}`}
                  className="text-sm text-dim hover:text-accent transition-colors flex items-center gap-2"
                >
                  {categoryLabels[category as keyof typeof categoryLabels] ?? category}
                  <span className="text-[10px] font-mono text-muted tabular-nums">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs font-mono text-subtle">
            toolbox4devs.com — built for developers who value clean, private tools.
          </p>
          <p className="text-xs font-mono text-subtle flex items-center gap-2">
            <span>100% client-side</span>
            <span>·</span>
            <span className="text-accent">PWA & Offline Ready</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
