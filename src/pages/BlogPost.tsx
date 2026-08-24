import { Link, useParams } from 'react-router-dom'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Check, ExternalLink } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { getPostBySlug, getSortedPosts } from '../data/blog'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ── Reading progress bar ──────────────────────────────────────────────────── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const height = el.scrollHeight - el.clientHeight
      setProgress(height > 0 ? Math.min((scrolled / height) * 100, 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ── Share bar ──────────────────────────────────────────────────────────────── */
function ShareBar({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : ''

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); return } catch { /* cancelled */ }
    }
    copyLink()
  }, [title, url, copyLink])

  const encoded = useMemo(() => ({
    u: encodeURIComponent(url),
    t: encodeURIComponent(title),
  }), [url, title])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={shareNative}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface/60 text-xs font-mono text-dim hover:border-accent hover:text-bright transition-all"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <ExternalLink size={13} />}
        {copied ? 'Copied!' : 'Share'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded.t}&url=${encoded.u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/60 text-xs font-mono text-dim hover:border-sky-500/50 hover:text-sky-400 transition-all"
        title="Share on X / Twitter"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded.u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/60 text-xs font-mono text-dim hover:border-blue-500/50 hover:text-blue-400 transition-all"
        title="Share on LinkedIn"
      >
        LinkedIn
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encoded.u}&title=${encoded.t}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/60 text-xs font-mono text-dim hover:border-orange-500/50 hover:text-orange-400 transition-all"
        title="Share on Reddit"
      >
        Reddit
      </a>
      <a
        href={`https://news.ycombinator.com/submitlink?u=${encoded.u}&t=${encoded.t}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/60 text-xs font-mono text-dim hover:border-amber-500/50 hover:text-amber-400 transition-all"
        title="Submit to Hacker News"
      >
        HN
      </a>
    </div>
  )
}

/* ── Table of contents ──────────────────────────────────────────────────────── */
function TableOfContents({ headings }: { headings: string[] }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach(h => {
      const el = document.getElementById(h)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className="hidden xl:block sticky top-28 shrink-0 w-56">
      <p className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase mb-3">On this page</p>
      <ul className="space-y-1.5 border-l border-border pl-3">
        {headings.map(h => {
          const label = h.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          return (
            <li key={h}>
              <a
                href={`#${h}`}
                className={`block text-xs font-sans leading-snug py-0.5 transition-colors ${
                  active === h
                    ? 'text-accent border-l-2 border-accent -ml-[13px] pl-3'
                    : 'text-subtle hover:text-dim'
                }`}
              >
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ── Content renderer ───────────────────────────────────────────────────────── */
function renderContent(content: string) {
  const blocks = content.trim().split(/\n\n+/)
  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      const text = block.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return (
        <h2 key={i} id={id} className="font-display text-xl sm:text-2xl text-bright mt-12 mb-4 tracking-tight scroll-mt-24">
          {text}
        </h2>
      )
    }
    if (block.startsWith('> ')) {
      return (
        <blockquote key={i} className="my-6 pl-4 border-l-2 border-accent/40 bg-accent/5 rounded-r-lg py-3 pr-4">
          <p className="text-sm font-sans text-dim italic leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(block.slice(2)) }} />
        </blockquote>
      )
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').map(line => line.replace(/^- /, ''))
      return (
        <ul key={i} className="space-y-2.5 my-5 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3 text-sm font-sans text-dim leading-relaxed">
              <span className="text-accent mt-1 select-none shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor" opacity="0.5" /></svg>
              </span>
              <span dangerouslySetInnerHTML={{ __html: inline(item) }} />
            </li>
          ))}
        </ul>
      )
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split('\n').map(line => line.replace(/^\d+\.\s/, ''))
      return (
        <ol key={i} className="space-y-3 my-5">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3.5 text-sm font-sans text-dim leading-relaxed">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-accent font-mono text-[10px] font-bold shrink-0 mt-0.5">
                {j + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: inline(item) }} />
            </li>
          ))}
        </ol>
      )
    }
    return (
      <p
        key={i}
        className="text-sm sm:text-base font-sans text-dim leading-[1.8] mb-5"
        dangerouslySetInnerHTML={{ __html: inline(block) }}
      />
    )
  })
}

function inline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escaped
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-surface border border-border text-accent text-[0.85em] font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-bright font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-dim">$1</em>')
}

/* ── Related posts ──────────────────────────────────────────────────────────── */
function RelatedPosts({ slugs, currentSlug }: { slugs: string[]; currentSlug: string }) {
  const posts = slugs
    .map(s => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => !!p && p.slug !== currentSlug)
    .slice(0, 3)

  if (posts.length === 0) return null

  return (
    <section className="mt-20 pt-12 border-t border-border">
      <h2 className="font-mono text-[11px] text-subtle tracking-[0.2em] uppercase mb-6">Keep reading</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {posts.map(other => (
          <Link
            key={other.slug}
            to={`/blog/${other.slug}`}
            className="group p-4 rounded-xl border border-border bg-surface/20 hover:bg-surface/50 hover:border-accent/50 transition-all flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-mono text-subtle mb-2">{other.date}</p>
              <h3 className="text-sm font-sans font-semibold text-bright group-hover:text-accent transition-colors leading-snug mb-2">
                {other.title}
              </h3>
              <div className="flex flex-wrap gap-1">
                {other.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono text-muted">{tag}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-accent group-hover:gap-2 transition-all">
              Read <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  usePageTitle(post ? `${post.title}` : 'Post Not Found')

  const headings = useMemo(() => {
    if (!post) return []
    return post.content
      .split(/\n\n+/)
      .filter(b => b.startsWith('## '))
      .map(b => {
        const t = b.slice(3)
        return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      })
  }, [post])

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24 animate-fade-in">
        <h1 className="font-display text-4xl text-bright mb-4">POST NOT FOUND.</h1>
        <p className="text-sm font-sans text-dim mb-8">That article doesn't exist or has been moved.</p>
        <Link to="/blog" className="btn-primary inline-flex items-center gap-2 text-xs font-mono px-5 py-2.5">
          <ArrowLeft size={14} />
          Back to Blog
        </Link>
      </main>
    )
  }

  const allSlugs = getSortedPosts().map(p => p.slug)

  return (
    <>
      <ReadingProgress />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in">
        <SEO
          title={post.title}
          description={post.excerpt}
          slug={`blog/${post.slug}`}
          keywords={post.tags}
          type="article"
        />

        {/* ── Back link ──────────────────────────────────────────────────────── */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft size={13} />
          All posts
        </Link>

        <div className="flex gap-12 xl:gap-16">
          {/* ── Main column ──────────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* ── Hero card ──────────────────────────────────────────────────── */}
            <header className="mb-12 rounded-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="p-6 sm:p-8 bg-surface/20">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
                    <CalendarDays size={12} />
                    {formatDate(post.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-subtle">
                    <Clock size={12} />
                    {post.readingTime}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-bright mb-5">
                  {post.title}
                </h1>

                <p className="text-sm sm:text-base font-sans text-dim leading-relaxed mb-6 max-w-2xl">
                  {post.excerpt}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full border border-border bg-surface/50 text-[10px] font-mono text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ShareBar title={post.title} slug={post.slug} />
                </div>
              </div>
            </header>

            {/* ── Body ─────────────────────────────────────────────────────────── */}
            <article className="max-w-none">
              {renderContent(post.content)}
            </article>

            {/* ── Share bar (bottom) ────────────────────────────────────────────── */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs font-mono text-subtle">Found this useful? Share it with other developers.</p>
                <ShareBar title={post.title} slug={post.slug} />
              </div>
            </div>

            {/* ── More posts ─────────────────────────────────────────────────────── */}
            <RelatedPosts slugs={allSlugs} currentSlug={post.slug} />
          </div>

          {/* ── TOC sidebar (desktop) ──────────────────────────────────────────── */}
          <TableOfContents headings={headings} />
        </div>
      </main>
    </>
  )
}
