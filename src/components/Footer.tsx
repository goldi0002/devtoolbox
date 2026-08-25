import { Link } from 'react-router-dom'
import { tools, categoryLabels } from '../tools/registry'

const productLinks = [
  { label: 'All tools', path: '/tools' },
  { label: 'About', path: '/about' },
  { label: 'Privacy', path: '/privacy' },
]

const popularTools = [
  { name: 'JSON Formatter', slug: 'json-formatter' },
  { name: 'JWT Decoder', slug: 'jwt' },
  { name: 'Base64 Encoder', slug: 'base64' },
  { name: 'UUID Generator', slug: 'uuid' },
  { name: 'CIDR Calculator', slug: 'cidr-calculator' },
  { name: 'Bcrypt Generator', slug: 'bcrypt-generator' },
  { name: 'SQL Formatter', slug: 'sql-formatter' },
  { name: 'Regex Tester', slug: 'regex' },
  { name: 'SHA-256 Hash', slug: 'sha256' },
  { name: 'Cron Parser', slug: 'cron-parser' },
  { name: 'SemVer Calculator', slug: 'semver-calculator' },
  { name: 'URL Encoder', slug: 'url-encoder' },
]

const topCategories = Object.entries(
  tools.reduce<Record<string, number>>((acc, tool) => {
    acc[tool.category] = (acc[tool.category] ?? 0) + 1
    return acc
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.2fr_1fr_1fr] gap-10">
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
          <p className="text-sm text-dim leading-relaxed max-w-sm mb-4">
            {tools.length} developer utilities that run entirely in your browser. No accounts, no ads,
            no data ever leaves your machine.
          </p>
          <div className="flex items-center gap-3 text-xs font-mono text-subtle">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-soft text-accent">
              ● 100% In-Browser
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-dim">
              Zero Telemetry
            </span>
          </div>
        </div>

        <nav aria-label="Popular Tools">
          <p className="eyebrow mb-3">Popular Utilities</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
            {popularTools.map(tool => (
              <li key={tool.slug}>
                <Link to={`/${tool.slug}`} className="text-xs text-dim hover:text-accent transition-colors">
                  {tool.name}
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
                  className="text-xs text-dim hover:text-accent transition-colors flex items-center justify-between"
                >
                  <span>{categoryLabels[category as keyof typeof categoryLabels] ?? category}</span>
                  <span className="text-[10px] font-mono text-muted tabular-nums">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Product">
          <p className="eyebrow mb-3">Navigation</p>
          <ul className="space-y-2">
            {productLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className="text-xs text-dim hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs font-mono text-subtle">
            toolbox4devs.com — Free, private developer utilities running 100% in your browser.
          </p>
          <p className="text-xs font-mono text-subtle flex items-center gap-2">
            <span>Client-Side Only</span>
            <span>·</span>
            <span className="text-accent">PWA & Offline Ready</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

