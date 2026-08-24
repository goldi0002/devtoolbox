import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, Newspaper, Share2 } from 'lucide-react'
import { useState, useCallback } from 'react'
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
  Privacy: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Architecture: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  JWT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Security: 'bg-red-500/10 text-red-400 border-red-500/20',
  Auth: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Regex: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Productivity: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Encoding: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Fundamentals: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  PWA: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Offline: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  Tooling: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
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
      try { await navigator.share({ title, url }); return } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url)
    setState('copied')
    setTimeout(() => setState('idle'), 2000)
  }, [slug, title])

  return (
    <button
      onClick={handleShare}
      className="p-1.5 rounded-md border border-border text-subtle hover:text-accent hover:border-accent/50 transition-all"
      title={state === 'copied' ? 'Link copied!' : 'Share post'}
    >
      {state === 'copied'
        ? <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <Share2 size={14} />
      }
    </button>
  )
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group relative block rounded-2xl border border-border overflow-hidden transition-all hover:border-accent/50"
    >
      {/* Gradient header band */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-6 sm:p-8 bg-surface/20 hover:bg-surface/40 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft border border-accent/20 text-accent text-[10px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Latest
          </div>
          <SharePostButton slug={post.slug} title={post.title} />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-bright leading-tight mb-3 group-hover:text-accent transition-colors">
          {post.title}
        </h2>

        <p className="text-sm sm:text-base font-sans text-dim leading-relaxed mb-5 max-w-2xl">
          {post.excerpt}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
              <CalendarDays size={12} />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
              <Clock size={12} />
              {post.readingTime}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${tagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-mono text-accent group-hover:gap-2.5 transition-all">
          Read article <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block p-5 sm:p-6 rounded-xl border border-border bg-surface/20 hover:bg-surface/50 hover:border-accent/50 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-subtle">
            <CalendarDays size={11} />
            {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-subtle">
            <Clock size={11} />
            {post.readingTime}
          </span>
        </div>
        <SharePostButton slug={post.slug} title={post.title} />
      </div>

      <h2 className="text-base sm:text-lg font-sans font-semibold text-bright group-hover:text-accent transition-colors mb-2 leading-snug">
        {post.title}
      </h2>
      <p className="text-xs sm:text-sm font-sans text-dim leading-relaxed mb-3">{post.excerpt}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${tagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <ArrowRight size={14} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  )
}

export default function BlogIndex() {
  usePageTitle('Blog — Guides & Notes for Developers')
  const posts = getSortedPosts()
  const [featured, ...rest] = posts
  const pageDescription =
    'Practical guides on client-side tooling, JWTs, regex workflows, encoding, and offline-first development — all written by the ToolBox4Devs team.'

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
      <SEO
        title="Blog — Developer Guides & Engineering Notes"
        description={pageDescription}
        slug="blog"
        keywords={['developer blog', 'client-side tools', 'jwt guide', 'regex testing', 'pwa']}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="relative mb-16 pt-4">
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-indigo-400 text-[11px] font-mono font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Field Notes & Guides
          </div>
        </div>

        <h1 className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.9] mb-6 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">DEV</span>
          <span className="text-bright">BLOG</span>
          <span className="text-bright">.</span>
        </h1>
        <p className="text-dim font-sans text-base sm:text-lg leading-relaxed max-w-xl">
          Short, practical write-ups on privacy-first tooling, security fundamentals, and the
          workflows we use every day while building{' '}
          <span className="text-bright font-semibold">ToolBox4Devs</span>.
        </p>
      </section>

      {/* ── Featured Post ────────────────────────────────────────────────────── */}
      {featured && (
        <section className="mb-8">
          <FeaturedCard post={featured} />
        </section>
      )}

      {/* ── Post Grid ──────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="border-t border-border pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-[11px] text-subtle tracking-[0.2em] uppercase">More articles</h2>
            <span className="text-[10px] font-mono text-muted">{rest.length} posts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section className="border-t border-border pt-12">
          <div className="py-16 text-center flex flex-col items-center gap-3 text-subtle">
            <Newspaper size={28} className="opacity-40" />
            <p className="text-sm font-mono">No posts yet — check back soon.</p>
          </div>
        </section>
      )}

      {/* ── Newsletter CTA ──────────────────────────────────────────────────── */}
      <section className="mt-16 pt-12 border-t border-border">
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-xl text-bright mb-1">STAY IN THE LOOP.</h2>
            <p className="text-xs font-mono text-subtle">New articles on developer tooling, privacy, and browser-native workflows.</p>
          </div>
          <Link to="/tools" className="btn-primary text-xs font-mono px-5 py-2.5 whitespace-nowrap flex items-center gap-2 shrink-0">
            Browse Tools
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
