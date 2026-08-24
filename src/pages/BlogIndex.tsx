import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Newspaper,
  Share2,
  Search,
  Check,
  ShieldCheck,
  Zap,
  HardDrive,
  Wrench,
  User,
  Sparkles,
  X
} from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { getSortedPosts, type BlogPost } from '../data/blog'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const TAG_COLORS: Record<string, string> = {
  Privacy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Security: 'bg-red-500/10 text-red-400 border-red-500/20',
  Architecture: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  WebCrypto: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  JWT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Auth: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  RFC7519: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Regex: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Productivity: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Performance: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Streams: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Data: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  WebAPIs: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Encoding: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  Fundamentals: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Binary: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PWA: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  Offline: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Tooling: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  ServiceWorker: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function tagColor(tag: string): string {
  return TAG_COLORS[tag] || 'bg-surface/60 text-muted border-border'
}

function SharePostButton({ slug, title }: { slug: string; title: string }) {
  const [state, setState] = useState<'idle' | 'copied'>('idle')

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/blog/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url)
    setState('copied')
    setTimeout(() => setState('idle'), 2000)
  }, [slug, title])

  return (
    <button
      onClick={handleShare}
      className="p-1.5 rounded-lg border border-border text-subtle hover:text-accent hover:border-accent/40 bg-surface/50 hover:bg-surface transition-all flex items-center gap-1 text-xs"
      title={state === 'copied' ? 'Link copied!' : 'Share article'}
    >
      {state === 'copied' ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400">Copied</span>
        </>
      ) : (
        <Share2 className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

function FeaturedCard({ post, onSelectTag }: { post: BlogPost; onSelectTag?: (tag: string) => void }) {
  return (
    <div className="relative rounded-2xl border border-border bg-gradient-to-b from-surface/80 to-surface/40 overflow-hidden shadow-2xl transition-all duration-300 hover:border-accent/50 group">
      {/* Top Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />

      <div className="p-6 sm:p-8 lg:p-10">
        {/* Badges & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              Featured Guide
            </span>
            {post.author && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-subtle">
                <User className="w-3 h-3 text-dim" />
                {post.author.name}
              </span>
            )}
          </div>
          <SharePostButton slug={post.slug} title={post.title} />
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`} className="block group/title">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-bright leading-tight mb-4 group-hover/title:text-accent transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm sm:text-base font-sans text-dim leading-relaxed mb-6 max-w-3xl">
          {post.excerpt}
        </p>

        {/* Interactive Tool Callout Pill if available */}
        {post.featuredTool && (
          <div className="mb-6 p-3 rounded-xl border border-border/80 bg-background/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-bright font-mono">
                    {post.featuredTool.toolName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-mono">
                    {post.featuredTool.badgeText || 'Interactive Tool'}
                  </span>
                </div>
                <p className="text-xs text-subtle line-clamp-1">{post.featuredTool.description}</p>
              </div>
            </div>
            <Link
              to={`/${post.featuredTool.toolSlug}`}
              className="text-xs font-mono text-accent hover:text-bright hover:underline inline-flex items-center gap-1 shrink-0 self-end sm:self-center"
            >
              Open Tool <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Footer Meta & Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-subtle">
              <CalendarDays className="w-3.5 h-3.5 text-dim" />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-subtle">
              <Clock className="w-3.5 h-3.5 text-dim" />
              {post.readingTime}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={(e) => {
                  e.preventDefault()
                  onSelectTag?.(tag)
                }}
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all hover:scale-105 ${tagColor(tag)}`}
                title={`Filter by tag #${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-accent hover:text-bright group-hover:gap-3 transition-all"
          >
            <span>Read full guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onSelectTag }: { post: BlogPost; onSelectTag?: (tag: string) => void }) {
  return (
    <div className="group rounded-xl border border-border bg-surface/30 hover:bg-surface/60 hover:border-accent/40 transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 shadow-sm hover:shadow-xl">
      <div>
        {/* Header meta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
              <CalendarDays className="w-3 h-3 text-dim" />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
              <Clock className="w-3 h-3 text-dim" />
              {post.readingTime}
            </span>
          </div>
          <SharePostButton slug={post.slug} title={post.title} />
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-base sm:text-lg font-sans font-semibold text-bright group-hover:text-accent transition-colors mb-2.5 leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm font-sans text-dim leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Mini Tool Link if present */}
        {post.featuredTool && (
          <div className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent/5 border border-accent/20 px-2.5 py-1 rounded-md">
            <Wrench className="w-3 h-3" />
            <span className="truncate">{post.featuredTool.toolName}</span>
          </div>
        )}
      </div>

      <div>
        {/* Tag pills */}
        <div className="flex flex-wrap gap-1.5 mb-4 pt-3 border-t border-border/50">
          {post.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={(e) => {
                e.preventDefault()
                onSelectTag?.(tag)
              }}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all hover:scale-105 ${tagColor(tag)}`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-dim group-hover:text-accent group-hover:gap-2 transition-all"
        >
          <span>Read article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default function BlogIndex() {
  usePageTitle('Engineering Blog & Technical Guides')
  const posts = getSortedPosts()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach(p => p.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  // Filter posts based on search query, category, and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = post.title.toLowerCase().includes(query)
        const matchExcerpt = post.excerpt.toLowerCase().includes(query)
        const matchTags = post.tags.some(t => t.toLowerCase().includes(query))
        const matchContent = post.content.toLowerCase().includes(query)
        if (!matchTitle && !matchExcerpt && !matchTags && !matchContent) {
          return false
        }
      }

      // Tag filter
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false
      }

      // Category filter preset
      if (selectedCategory === 'privacy') {
        return post.tags.some(t => ['Privacy', 'Security', 'WebCrypto'].includes(t))
      }
      if (selectedCategory === 'auth') {
        return post.tags.some(t => ['JWT', 'Auth', 'RFC7519'].includes(t))
      }
      if (selectedCategory === 'performance') {
        return post.tags.some(t => ['Performance', 'Streams', 'Data', 'WebAPIs'].includes(t))
      }
      if (selectedCategory === 'encoding') {
        return post.tags.some(t => ['Encoding', 'Fundamentals', 'Binary'].includes(t))
      }
      if (selectedCategory === 'pwa') {
        return post.tags.some(t => ['PWA', 'Offline', 'ServiceWorker', 'Tooling'].includes(t))
      }

      return true
    })
  }, [posts, searchQuery, selectedTag, selectedCategory])

  const [featuredPost, ...otherPosts] = filteredPosts

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTag(null)
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory !== 'all' || selectedTag)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-fade-in">
      <SEO
        title="Developer Blog & Engineering Guides — ToolBox4Devs"
        description="In-depth technical guides on client-side security, JWT verification, 1GB+ stream processing, regex optimization, and offline PWA developer tooling."
        slug="blog"
        keywords={[
          'developer blog',
          'client-side security',
          'jwt verification guide',
          'large csv viewer streams',
          'regex testing without redos',
          'base64 vs hex encoding',
          'offline pwa developer tools'
        ]}
      />

      {/* ── Header & Banner ─────────────────────────────────────────────────── */}
      <section className="relative mb-12">
        <div className="absolute -top-10 left-1/3 w-[500px] h-[250px] bg-accent/8 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Field Notes & Technical Guides
          </div>
          <span className="text-xs font-mono text-subtle">• 100% In-Browser Engineering</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-bright mb-4 leading-[1.05]">
          ENGINEERING <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-pink-400">BLOG</span>.
        </h1>
        <p className="text-dim font-sans text-base sm:text-lg leading-relaxed max-w-2xl">
          Deep dives on client-side cryptography, high-performance web streams, auth inspection, and the browser-native architecture powering{' '}
          <span className="text-bright font-semibold">ToolBox4Devs</span>.
        </p>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2.5 text-xs font-mono text-dim">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>0% Data Exfiltration</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-dim">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Microsecond Execution</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-dim">
            <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% Offline Capable</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-dim">
            <Wrench className="w-4 h-4 text-purple-400 shrink-0" />
            <span>70+ Free Developer Tools</span>
          </div>
        </div>
      </section>

      {/* ── Search and Filter Controls ───────────────────────────────────────── */}
      <section className="mb-10 space-y-4">
        {/* Search Bar & Category Presets */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides by title, tag, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-mono bg-surface border border-border rounded-xl pl-10 pr-9 py-2.5 text-bright focus:outline-none focus:border-accent transition-colors placeholder:text-subtle"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-bright"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
            {[
              { id: 'all', label: 'All Articles' },
              { id: 'privacy', label: 'Privacy & Security' },
              { id: 'auth', label: 'Auth & JWT' },
              { id: 'performance', label: 'Streams & Data' },
              { id: 'encoding', label: 'Encodings' },
              { id: 'pwa', label: 'PWA & Offline' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedTag(null)
                }}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id && !selectedTag
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-surface/50 border-border text-dim hover:text-bright hover:border-border-hover'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Cloud Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-mono text-subtle mr-1">Topics:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(selectedTag === tag ? null : tag)
                if (selectedTag !== tag) setSelectedCategory('all')
              }}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition-all ${
                selectedTag === tag
                  ? 'bg-accent text-background font-bold border-accent scale-105'
                  : `${tagColor(tag)} hover:scale-105`
              }`}
            >
              #{tag}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-mono text-accent hover:underline ml-2 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ── Article List Content ────────────────────────────────────────────── */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-8">
          {/* Featured Post (Only shown if no query or first item in filtered set) */}
          {featuredPost && (
            <section>
              <FeaturedCard
                post={featuredPost}
                onSelectTag={(tag) => {
                  setSelectedTag(tag)
                  setSelectedCategory('all')
                }}
              />
            </section>
          )}

          {/* Grid of Remaining Posts */}
          {otherPosts.length > 0 && (
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs text-subtle tracking-widest uppercase">
                  {hasActiveFilters ? `Filtered Articles (${otherPosts.length})` : 'More Technical Guides'}
                </h3>
                <span className="text-xs font-mono text-dim">{otherPosts.length} posts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherPosts.map(post => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    onSelectTag={(tag) => {
                      setSelectedTag(tag)
                      setSelectedCategory('all')
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty State */
        <section className="py-20 text-center rounded-2xl border border-dashed border-border bg-surface/20 flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-surface border border-border text-subtle">
            <Newspaper className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <h3 className="font-semibold text-bright text-base mb-1">No articles found</h3>
            <p className="text-xs font-mono text-subtle max-w-sm">
              No technical guides matched your search or tag criteria.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="btn-primary text-xs font-mono px-4 py-2"
          >
            Reset Filters
          </button>
        </section>
      )}

      {/* ── Bottom Callout Banner ───────────────────────────────────────────── */}
      <section className="mt-20 pt-10 border-t border-border">
        <div className="p-8 sm:p-10 rounded-2xl border border-border bg-gradient-to-br from-surface/80 via-surface/40 to-background flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono mb-3">
              <Wrench className="w-3.5 h-3.5" />
              100% Client-Side Suite
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-bright mb-2">
              BUILD WITH ZERO PRIVACY COMPROMISE.
            </h2>
            <p className="text-sm font-sans text-dim leading-relaxed">
              Experience all 70+ developer utilities: JSON formatters, JWT decoders, stream-based CSV viewers, and cryptography engines — completely private, fast, and offline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/tools"
              className="btn-primary text-xs font-mono px-6 py-3 flex items-center gap-2"
            >
              Explore 70+ Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
