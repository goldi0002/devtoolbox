import { describe, it, expect } from 'vitest'
import { blogPosts, blogSlugs, getPostBySlug, getSortedPosts } from '../data/blog'
import { parseInlineMarkdown, parseMarkdownDocument } from '../lib/markdown'

describe('blog data & helpers', () => {
  it('contains unique slugs for every post', () => {
    expect(blogSlugs.length).toBeGreaterThan(0)
    const uniqueSlugs = new Set(blogSlugs)
    expect(blogSlugs.length).toBe(uniqueSlugs.size)
  })

  it('every post has required fields and valid content', () => {
    blogPosts.forEach((post) => {
      expect(post.slug).toBeTruthy()
      expect(post.title).toBeTruthy()
      expect(post.excerpt).toBeTruthy()
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.readingTime).toMatch(/\d+ min read/)
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.tags.length).toBeGreaterThan(0)
      expect(post.content.length).toBeGreaterThan(50)
      if (post.author) {
        expect(post.author.name).toBeTruthy()
        expect(post.author.role).toBeTruthy()
      }
      if (post.featuredTool) {
        expect(post.featuredTool.toolName).toBeTruthy()
      }
    })
  })

  it('correctly retrieves post by slug', () => {
    const post = getPostBySlug('why-client-side-tools-matter')
    expect(post).toBeDefined()
    expect(post?.title).toContain('Why Client-Side Developer Tools Matter')

    const csvPost = getPostBySlug('mastering-large-csv-txt-streams')
    expect(csvPost).toBeDefined()
    expect(csvPost?.title).toContain('Handling 1GB+ Massive CSV')

    // Normalized / defensive lookups
    expect(getPostBySlug('/why-client-side-tools-matter/')).toBeDefined()
    expect(getPostBySlug('WHY-CLIENT-SIDE-TOOLS-MATTER')).toBeDefined()
    expect(getPostBySlug('non-existent-slug')).toBeUndefined()
  })

  it('correctly sorts posts by date descending', () => {
    const sorted = getSortedPosts()
    expect(sorted.length).toBe(blogPosts.length)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].date >= sorted[i + 1].date).toBe(true)
    }
  })
})

describe('markdown parser & inline formatting', () => {
  it('correctly parses multiple inline code spans without placeholder collisions', () => {
    const text = '`m` (Multiline): Changes `^` (start) and `$` (end) to match the beginning and end.'
    const result = parseInlineMarkdown(text)
    expect(result).not.toContain('INLINE_CODE')
    expect(result).not.toContain('\uE000')
    expect(result).toContain('<code')
    expect(result).toContain('>m<')
    expect(result).toContain('>^<')
    expect(result).toContain('>$<')
  })

  it('escapes HTML special characters in code and text', () => {
    const text = 'Check `<div> & <span class="test">` with **bold <tag>**'
    const result = parseInlineMarkdown(text)
    expect(result).toContain('&lt;div&gt; &amp; &lt;span class=&quot;test&quot;&gt;')
    expect(result).toContain('<strong class="text-bright font-semibold">bold &lt;tag&gt;</strong>')
  })

  it('renders markdown links and math expressions accurately', () => {
    const text = 'See [Docs](https://example.com) and formula $O(n \\log n)$'
    const result = parseInlineMarkdown(text)
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('Docs')
    expect(result).toContain('O(n \\log n)')
  })

  it('renders entire blog post corpus cleanly without any lingering placeholders', () => {
    blogPosts.forEach(post => {
      const blocks = parseMarkdownDocument(post.content)
      expect(blocks.length).toBeGreaterThan(0)

      blocks.forEach(block => {
        if (block.type === 'p') {
          const formatted = parseInlineMarkdown(block.text)
          expect(formatted).not.toContain('INLINE_CODE')
          expect(formatted).not.toContain('\uE000')
          expect(formatted).not.toContain('\uE001')
        } else if (block.type === 'ul' || block.type === 'ol') {
          block.items.forEach(item => {
            const formatted = parseInlineMarkdown(item)
            expect(formatted).not.toContain('INLINE_CODE')
            expect(formatted).not.toContain('\uE000')
            expect(formatted).not.toContain('\uE001')
          })
        } else if (block.type === 'table') {
          block.headers.forEach(h => {
            const formatted = parseInlineMarkdown(h)
            expect(formatted).not.toContain('INLINE_CODE')
          })
          block.rows.forEach(row => {
            row.forEach(cell => {
              const formatted = parseInlineMarkdown(cell)
              expect(formatted).not.toContain('INLINE_CODE')
            })
          })
        }
      })
    })
  })
})

