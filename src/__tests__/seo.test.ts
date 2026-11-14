import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildSEOConfig, buildBreadcrumbItems } from '../utils/seo'

describe('SEO & Schema.org Structured Data', () => {
  it('emits valid WebApplication, 4-level BreadcrumbList, FAQPage, and HowTo schemas for tool pages', () => {
    const config = buildSEOConfig({
      title: '.env File Auditor & Secret Detector — ToolBox4Devs',
      description: 'Audit .env files client-side.',
      slug: 'env-auditor',
      category: 'analyze-tools',
      categoryLabel: 'Analyze',
      toolName: '.env File Auditor & Secret Detector',
      keywords: ['env auditor', 'dotenv'],
      features: ['Key diffing', 'Entropy secret detection'],
      faqs: [{ question: 'Is it private?', answer: 'Yes, 100% browser-side.' }],
      steps: [{ name: 'Paste .env', text: 'Paste into workspace.' }],
    })

    expect(config.ogType).toBe('website')
    expect(config.url).toBe('https://toolbox4devs.com/env-auditor')
    expect(config.noindex).toBe(false)

    const webApp = config.schemas.find((s) => s['@type'] === 'WebApplication')
    expect(webApp).toBeDefined()
    expect(webApp?.applicationCategory).toBe('DeveloperApplication')
    expect(webApp?.applicationSubCategory).toBe('Analyze')

    const breadcrumb = config.schemas.find((s) => s['@type'] === 'BreadcrumbList')
    expect(breadcrumb).toBeDefined()
    const items = breadcrumb?.itemListElement as Array<{ position: number; name: string; item: string }>
    expect(items.map((i) => i.name)).toEqual([
      'Home',
      'Tools',
      'Analyze Tools',
      '.env File Auditor & Secret Detector',
    ])
    expect(items[2].item).toBe('https://toolbox4devs.com/tools/analyze-tools')

    expect(config.schemas.some((s) => s['@type'] === 'FAQPage')).toBe(true)
    expect(config.schemas.some((s) => s['@type'] === 'HowTo')).toBe(true)
  })

  it('emits BlogPosting schema and article OpenGraph type for blog posts', () => {
    const config = buildSEOConfig({
      title: 'JWT Verification Guide',
      description: 'Deep dive into RFC 7519.',
      slug: 'blog/jwt-decoder-guide',
      type: 'article',
      publishedTime: '2026-08-10',
      modifiedTime: '2026-08-15',
      authorName: 'ToolBox4Devs Architecture Team',
      keywords: ['JWT', 'Security'],
    })

    expect(config.ogType).toBe('article')
    const article = config.schemas.find((s) => s['@type'] === 'BlogPosting')
    expect(article).toBeDefined()
    expect(article?.datePublished).toBe('2026-08-10')
    expect(article?.dateModified).toBe('2026-08-15')
    expect(article?.headline).toBe('JWT Verification Guide')

    const breadcrumb = config.schemas.find((s) => s['@type'] === 'BreadcrumbList')
    const items = breadcrumb?.itemListElement as Array<{ name: string }>
    expect(items.map((i) => i.name)).toEqual(['Home', 'Blog', 'JWT Verification Guide'])
  })

  it('builds accurate BreadcrumbList paths for about, privacy, recipes, and tool categories', () => {
    expect(
      buildBreadcrumbItems({ cleanSlug: 'about', url: 'https://toolbox4devs.com/about' }).map((i) => i.name)
    ).toEqual(['Home', 'About'])

    expect(
      buildBreadcrumbItems({ cleanSlug: 'privacy', url: 'https://toolbox4devs.com/privacy' }).map((i) => i.name)
    ).toEqual(['Home', 'Privacy Policy'])

    expect(
      buildBreadcrumbItems({
        cleanSlug: 'recipes/jwt-auth-verifier',
        url: 'https://toolbox4devs.com/recipes/jwt-auth-verifier',
        toolName: 'JWT Auth Verifier',
      }).map((i) => i.name)
    ).toEqual(['Home', 'Recipes', 'JWT Auth Verifier'])

    expect(
      buildBreadcrumbItems({
        cleanSlug: 'tools/json-tools',
        url: 'https://toolbox4devs.com/tools/json-tools',
        categoryLabel: 'JSON',
      }).map((i) => i.name)
    ).toEqual(['Home', 'Tools', 'JSON Tools'])
  })

  it('sets noindex and omits schemas when noindex is true', () => {
    const config = buildSEOConfig({
      title: 'Page Not Found (404) — ToolBox4Devs',
      description: 'Not found',
      noindex: true,
    })

    expect(config.noindex).toBe(true)
    expect(config.robotsContent).toBe('noindex, nofollow')
    expect(config.botContent).toBe('noindex, nofollow')
    expect(config.schemas).toHaveLength(0)
    expect(config.jsonLdString).toBe('')
  })

  it('emits ItemList schema with resolved absolute URLs', () => {
    const config = buildSEOConfig({
      title: 'Developer Tools Directory',
      slug: 'tools',
      itemList: [
        { name: 'JSON Formatter', url: '/json-formatter', description: 'Format JSON' },
        { name: '.env Auditor', url: '/env-auditor', description: 'Audit .env files' },
      ],
    })

    const itemList = config.schemas.find((s) => s['@type'] === 'ItemList')
    expect(itemList).toBeDefined()
    expect(itemList?.numberOfItems).toBe(2)
    const elements = itemList?.itemListElement as Array<{ position: number; url: string }>
    expect(elements[0].url).toBe('https://toolbox4devs.com/json-formatter')
    expect(elements[1].position).toBe(2)
  })

  it('maintains comprehensive public/robots.txt directives', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt')
    const content = fs.readFileSync(robotsPath, 'utf8')
    expect(content).toContain('User-agent: Googlebot')
    expect(content).toContain('Allow: /')
    expect(content).toContain('Sitemap: https://toolbox4devs.com/sitemap.xml')
  })

  it('emits CollectionPage instead of WebApplication for the root directory homepage', () => {
    const config = buildSEOConfig({
      title: 'ToolBox4Devs — Free Online Developer Tools',
      description: 'Directory of browser tools.',
    })

    expect(config.schemas.some((s) => s['@type'] === 'CollectionPage')).toBe(true)
    expect(config.schemas.some((s) => s['@type'] === 'WebApplication')).toBe(false)
  })

  it('emits AggregateRating on WebApplication only when verified ratingCount > 0 is provided', () => {
    const withoutRating = buildSEOConfig({
      title: 'JSON Formatter',
      slug: 'json-formatter',
      toolName: 'JSON Formatter',
      type: 'software',
    })
    const appWithout = withoutRating.schemas.find((s) => s['@type'] === 'WebApplication')
    expect(appWithout?.aggregateRating).toBeUndefined()
    expect(appWithout?.image).toBe('https://toolbox4devs.com/images/og-1200x630.png')

    const withRating = buildSEOConfig({
      title: 'JSON Formatter',
      slug: 'json-formatter',
      toolName: 'JSON Formatter',
      type: 'software',
      aggregateRating: { ratingValue: 4.8, ratingCount: 42 },
    })
    const appWith = withRating.schemas.find((s) => s['@type'] === 'WebApplication')
    expect(appWith?.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 42,
      bestRating: 5,
      worstRating: 1,
    })
  })
})
