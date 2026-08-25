import { Link, useParams, useLocation } from 'react-router-dom'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Check,
  ExternalLink,
  Copy,
  Wrench,
  User,
  ShieldCheck,
  AlertTriangle,
  Info,
  Lightbulb,
  Bookmark,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { SEO } from '../hooks/useSEO'
import { getPostBySlug, getSortedPosts, type BlogPost } from '../data/blog'
import { getToolBySlug } from '../tools/registry'
import {
  slugifyHeading,
  parseInlineMarkdown,
  parseMarkdownDocument,
} from '../lib/markdown'

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
    <div className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-border/20 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent via-purple-500 to-pink-500 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ── Share bar ──────────────────────────────────────────────────────────────── */
function ShareBar({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : `https://toolbox4devs.com/blog/${slug}`

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* user cancelled */
      }
    }
    copyLink()
  }, [title, url, copyLink])

  const encoded = useMemo(
    () => ({
      u: encodeURIComponent(url),
      t: encodeURIComponent(title),
    }),
    [url, title]
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={shareNative}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface/80 text-xs font-mono text-dim hover:border-accent hover:text-bright transition-all"
        title="Share or copy URL"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
        {copied ? 'Copied Link!' : 'Share'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded.t}&url=${encoded.u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/80 text-xs font-mono text-dim hover:border-sky-500/50 hover:text-sky-400 transition-all"
        title="Share on X / Twitter"
      >
        X (Twitter)
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded.u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/80 text-xs font-mono text-dim hover:border-blue-500/50 hover:text-blue-400 transition-all"
        title="Share on LinkedIn"
      >
        LinkedIn
      </a>
      <a
        href={`https://news.ycombinator.com/submitlink?u=${encoded.u}&t=${encoded.t}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/80 text-xs font-mono text-dim hover:border-amber-500/50 hover:text-amber-400 transition-all"
        title="Submit to Hacker News"
      >
        Hacker News
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encoded.u}&title=${encoded.t}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg border border-border bg-surface/80 text-xs font-mono text-dim hover:border-orange-500/50 hover:text-orange-400 transition-all"
        title="Share on Reddit"
      >
        Reddit
      </a>
    </div>
  )
}

/* ── Code block with copy button ────────────────────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-xl border border-border bg-[#0b0f17] overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface/70 border-b border-border/80 text-xs font-mono text-subtle">
        <span className="text-accent uppercase text-[11px] font-bold tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent/70 inline-block" />
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/60 hover:bg-surface border border-border/60 hover:border-accent/40 text-[11px] text-dim hover:text-bright transition-all"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/* ── Callout / Blockquote Renderer ─────────────────────────────────────────── */
function CalloutBlock({
  type,
  lines,
}: {
  type: 'note' | 'warning' | 'security' | 'tip' | 'quote'
  lines: string[]
}) {
  const text = lines.join(' ')

  if (type === 'quote') {
    return (
      <blockquote className="my-6 p-4 sm:p-5 rounded-xl border-l-4 border-accent bg-surface/30 text-dim italic text-sm sm:text-base leading-relaxed">
        <div dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(text) }} />
      </blockquote>
    )
  }

  const styles = {
    note: {
      border: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />,
      title: 'Note',
    },
    warning: {
      border: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      title: 'Caution',
    },
    security: {
      border: 'border-red-500/40 bg-red-500/10 text-red-400',
      icon: <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
      title: 'Security Advisory',
    },
    tip: {
      border: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      icon: <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      title: 'Pro Tip',
    },
  }[type]

  return (
    <div className={`my-6 p-4 sm:p-5 rounded-xl border ${styles.border} flex items-start gap-3.5 shadow-sm`}>
      {styles.icon}
      <div className="min-w-0 flex-1">
        <span className="block font-mono text-xs font-bold uppercase tracking-wider mb-1">
          {styles.title}
        </span>
        <div
          className="text-xs sm:text-sm font-sans text-dim leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(text) }}
        />
      </div>
    </div>
  )
}

/* ── Table of contents ──────────────────────────────────────────────────────── */
function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[]
}) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className="hidden xl:block sticky top-28 shrink-0 w-64 self-start p-4 rounded-xl border border-border bg-surface/30">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/60">
        <Bookmark className="w-3.5 h-3.5 text-accent" />
        <p className="text-[11px] font-mono text-subtle tracking-[0.15em] uppercase font-semibold">
          Table of Contents
        </p>
      </div>
      <ul className="space-y-1.5">
        {headings.map(h => (
          <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${h.id}`}
              className={`block text-xs font-sans leading-snug py-1 px-2 rounded transition-colors ${
                active === h.id
                  ? 'text-accent bg-accent/10 font-semibold'
                  : 'text-subtle hover:text-dim hover:bg-surface/50'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ── Markdown table renderer ────────────────────────────────────────────────── */
function renderTable(headers: string[], rows: string[][], key: number) {
  return (
    <div key={key} className="my-6 overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm font-sans border-collapse">
        <thead>
          <tr className="bg-surface/80 border-b border-border text-bright font-mono text-xs">
            {headers.map((h, i) => (
              <th
                key={i}
                className="p-3 sm:p-4 font-semibold"
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(h) }}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-surface/20">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-surface/40 transition-colors">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="p-3 sm:p-4 text-dim leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Rich Content renderer ──────────────────────────────────────────────────── */
function renderContent(content: string) {
  const blocks = parseMarkdownDocument(content)

  return blocks.map((block, i) => {
    switch (block.type) {
      case 'code':
        return <CodeBlock key={i} code={block.code} lang={block.lang} />

      case 'h2':
        return (
          <h2
            key={i}
            id={block.id}
            className="font-display text-xl sm:text-2xl lg:text-3xl text-bright mt-12 mb-4 tracking-tight scroll-mt-24 pb-2 border-b border-border/50 flex items-center justify-between group"
          >
            <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} />
            <a
              href={`#${block.id}`}
              className="text-dim opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono px-2 py-1 hover:text-accent"
              title="Direct link"
            >
              #
            </a>
          </h2>
        )

      case 'h3':
        return (
          <h3
            key={i}
            id={block.id}
            className="font-sans font-semibold text-lg sm:text-xl text-bright mt-8 mb-3 scroll-mt-24"
          >
            <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} />
          </h3>
        )

      case 'h4':
        return (
          <h4
            key={i}
            id={block.id}
            className="font-sans font-semibold text-base sm:text-lg text-bright mt-6 mb-2 scroll-mt-24"
          >
            <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} />
          </h4>
        )

      case 'table':
        return renderTable(block.headers, block.rows, i)

      case 'callout':
        return <CalloutBlock key={i} type={block.calloutType} lines={block.lines} />

      case 'ul':
        return (
          <ul key={i} className="space-y-2.5 my-5 pl-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-3 text-sm font-sans text-dim leading-relaxed">
                <span className="text-accent mt-2 select-none shrink-0">
                  <svg width="6" height="6" viewBox="0 0 6 6">
                    <circle cx="3" cy="3" r="3" fill="currentColor" />
                  </svg>
                </span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }}
                />
              </li>
            ))}
          </ul>
        )

      case 'ol':
        return (
          <ol key={i} className="space-y-3 my-5">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-3.5 text-sm font-sans text-dim leading-relaxed">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent font-mono text-[11px] font-bold shrink-0 mt-0.5">
                  {j + 1}
                </span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }}
                />
              </li>
            ))}
          </ol>
        )

      case 'p':
        return (
          <p
            key={i}
            className="text-sm sm:text-base font-sans text-dim leading-[1.8] mb-5"
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }}
          />
        )
    }
  })
}

/* ── Related Tools Component ────────────────────────────────────────────────── */
function RelatedTools({ toolSlugs }: { toolSlugs?: string[] }) {
  if (!toolSlugs || toolSlugs.length === 0) return null

  const tools = toolSlugs
    .map(slug => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => !!t)

  if (tools.length === 0) return null

  return (
    <div className="my-8 p-6 rounded-2xl border border-border bg-gradient-to-br from-surface/80 to-surface/40 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-4 h-4 text-accent" />
        <h3 className="font-mono text-xs text-bright uppercase tracking-wider font-semibold">
          Interactive Tools Mentioned in This Guide
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map(tool => (
          <Link
            key={tool.slug}
            to={`/${tool.slug}`}
            className="group p-3 rounded-xl border border-border bg-background/60 hover:bg-surface/80 hover:border-accent/50 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-surface text-accent group-hover:text-bright shrink-0 transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-bright font-mono truncate group-hover:text-accent transition-colors">
                  {tool.name}
                </p>
                <p className="text-[10px] text-subtle truncate">{tool.category}</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ── Prev / Next Navigation Footer ──────────────────────────────────────────── */
function PostNavigation({ currentSlug }: { currentSlug: string }) {
  const posts = getSortedPosts()
  const currentIndex = posts.findIndex(p => p.slug === currentSlug)
  if (currentIndex === -1) return null

  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-border">
      {prevPost ? (
        <Link
          to={`/blog/${prevPost.slug}`}
          className="group p-4 rounded-xl border border-border bg-surface/20 hover:bg-surface/60 hover:border-accent/40 transition-all flex flex-col justify-between"
        >
          <span className="text-[10px] font-mono text-subtle flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Previous Article
          </span>
          <p className="text-xs sm:text-sm font-semibold text-bright group-hover:text-accent transition-colors line-clamp-1">
            {prevPost.title}
          </p>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          to={`/blog/${nextPost.slug}`}
          className="group p-4 rounded-xl border border-border bg-surface/20 hover:bg-surface/60 hover:border-accent/40 transition-all flex flex-col justify-between text-right"
        >
          <span className="text-[10px] font-mono text-subtle flex items-center justify-end gap-1 mb-1">
            Next Article
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
          <p className="text-xs sm:text-sm font-semibold text-bright group-hover:text-accent transition-colors line-clamp-1">
            {nextPost.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}

/* ── Main BlogPost Component ────────────────────────────────────────────────── */
export default function BlogPost() {
  const { slug: paramSlug } = useParams<{ slug: string }>()
  const { pathname } = useLocation()
  const slug = useMemo(() => {
    if (paramSlug) return paramSlug
    const segments = pathname.split('/').filter(Boolean)
    return segments.at(-1) ?? ''
  }, [paramSlug, pathname])

  const post = slug ? getPostBySlug(slug) : undefined

  usePageTitle(post ? `${post.title}` : 'Guide Not Found')

  const headings = useMemo(() => {
    if (!post) return []
    const lines = post.content.split('\n')
    const list: { id: string; text: string; level: number }[] = []
    let inCode = false

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('```')) {
        inCode = !inCode
        return
      }
      if (inCode) return

      if (trimmed.startsWith('## ')) {
        const text = trimmed.slice(3).trim()
        const id = slugifyHeading(text)
        const cleanText = text.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
        list.push({ id, text: cleanText, level: 2 })
      } else if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4).trim()
        const id = slugifyHeading(text)
        const cleanText = text.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
        list.push({ id, text: cleanText, level: 3 })
      }
    })
    return list
  }, [post])

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24 animate-fade-in text-center">
        <h1 className="font-display text-4xl text-bright mb-4">ARTICLE NOT FOUND.</h1>
        <p className="text-sm font-sans text-dim mb-8">
          The requested engineering guide could not be found.
        </p>
        <Link
          to="/blog"
          className="btn-primary inline-flex items-center gap-2 text-xs font-mono px-5 py-2.5"
        >
          <ArrowLeft size={14} />
          Back to Blog Overview
        </Link>
      </main>
    )
  }

  return (
    <>
      <ReadingProgress />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-fade-in">
        <SEO
          title={`${post.title} — ToolBox4Devs`}
          description={post.excerpt}
          slug={`blog/${post.slug}`}
          keywords={post.tags}
          type="article"
        />

        {/* ── Breadcrumb Navigation ─────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-mono text-subtle mb-8 overflow-x-auto">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <Link to="/blog" className="hover:text-accent transition-colors">
            Blog
          </Link>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <span className="text-bright truncate max-w-xs sm:max-w-md">{post.title}</span>
        </nav>

        <div className="flex gap-10 xl:gap-14 items-start">
          {/* ── Main Article Column ─────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* ── Article Header Card ───────────────────────────────────────── */}
            <header className="mb-10 rounded-2xl border border-border bg-gradient-to-b from-surface/80 to-surface/40 overflow-hidden shadow-2xl">
              <div className="h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-mono font-semibold">
                      <Sparkles className="w-3 h-3 text-accent" />
                      Engineering Guide
                    </span>
                    {post.author && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-subtle">
                        <User className="w-3.5 h-3.5 text-dim" />
                        {post.author.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-dim" />
                      {formatDate(post.date)}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-dim" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>

                {/* Article Title */}
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-bright mb-6">
                  {post.title}
                </h1>

                {/* Executive Excerpt */}
                <p className="text-sm sm:text-base font-sans text-dim leading-relaxed mb-6 max-w-3xl border-l-2 border-accent/40 pl-4 py-1">
                  {post.excerpt}
                </p>

                {/* Tags & Top Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full border border-border bg-surface text-xs font-mono text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <ShareBar title={post.title} slug={post.slug} />
                </div>
              </div>
            </header>

            {/* ── Featured Tool Banner if applicable ─────────────────────────── */}
            {post.featuredTool && (
              <div className="mb-10 p-5 rounded-2xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent text-background shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-bright font-mono">
                      {post.featuredTool.toolName}
                    </h3>
                    <p className="text-xs text-dim">{post.featuredTool.description}</p>
                  </div>
                </div>
                <Link
                  to={`/${post.featuredTool.toolSlug}`}
                  className="btn-primary text-xs font-mono px-4 py-2 shrink-0 flex items-center gap-1.5"
                >
                  Open Live Tool
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ── Article Body Content ────────────────────────────────────────── */}
            <article className="max-w-none font-sans text-dim">
              {renderContent(post.content)}
            </article>

            {/* ── Interactive Related Tools ───────────────────────────────────── */}
            <RelatedTools toolSlugs={post.relatedToolSlugs} />

            {/* ── Share Bar (Bottom) ──────────────────────────────────────────── */}
            <div className="mt-12 p-6 rounded-2xl border border-border bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-bright mb-1">
                  Enjoyed this technical guide?
                </p>
                <p className="text-xs font-mono text-subtle">
                  Share it with your engineering team and network.
                </p>
              </div>
              <ShareBar title={post.title} slug={post.slug} />
            </div>

            {/* ── Previous & Next Article Navigation ──────────────────────────── */}
            <PostNavigation currentSlug={post.slug} />
          </div>

          {/* ── Table of Contents (Sticky Desktop Sidebar) ──────────────────── */}
          <TableOfContents headings={headings} />
        </div>
      </main>
    </>
  )
}
