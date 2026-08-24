import { describe, it, expect } from 'vitest'
import { blogPosts, blogSlugs, getPostBySlug, getSortedPosts } from '../data/blog'

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
    })
  })

  it('correctly retrieves post by slug', () => {
    const post = getPostBySlug('why-client-side-tools-matter')
    expect(post).toBeDefined()
    expect(post?.title).toBe('Why Client-Side Developer Tools Matter')

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
