import { WEB_INFO } from './webinfo'

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
}

export interface SEOListItem {
  name: string
  url: string
  description?: string
}

export interface SEOProps {
  title?: string
  description?: string
  slug?: string
  keywords?: string[]
  category?: string
  categoryLabel?: string
  faqs?: FAQItem[]
  features?: string[]
  steps?: HowToStep[]
  toolName?: string
  type?: 'website' | 'article' | 'software'
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  authorName?: string
  itemList?: SEOListItem[]
}

export interface BuiltSEOConfig {
  fullTitle: string
  description: string
  cleanSlug: string
  url: string
  ogImage: string
  ogType: 'website' | 'article'
  robotsContent: string
  botContent: string
  noindex: boolean
  schemas: Record<string, unknown>[]
  jsonLdString: string
}

function formatFallbackCategory(category: string): string {
  const base = category.replace(/-tools$/, '').replace(/-/g, ' ')
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function toAbsoluteUrl(rawUrl: string): string {
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl
  }
  const normalized = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${WEB_INFO.BASE_URL}${normalized}`
}

export function buildBreadcrumbItems(params: {
  cleanSlug: string
  url: string
  title?: string
  toolName?: string
  category?: string
  categoryLabel?: string
}): Array<Record<string, unknown>> {
  const { cleanSlug, url, title, toolName, category, categoryLabel } = params
  if (!cleanSlug) return []

  const items: Array<Record<string, unknown>> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: WEB_INFO.BASE_URL,
    },
  ]

  if (cleanSlug === 'blog') {
    items.push({ '@type': 'ListItem', position: 2, name: 'Blog', item: url })
  } else if (cleanSlug.startsWith('blog/')) {
    items.push(
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${WEB_INFO.BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title || cleanSlug.replace('blog/', ''), item: url },
    )
  } else if (cleanSlug === 'recipes') {
    items.push({ '@type': 'ListItem', position: 2, name: 'Recipes', item: url })
  } else if (cleanSlug.startsWith('recipes/')) {
    items.push(
      { '@type': 'ListItem', position: 2, name: 'Recipes', item: `${WEB_INFO.BASE_URL}/recipes` },
      { '@type': 'ListItem', position: 3, name: toolName || title || cleanSlug.replace('recipes/', ''), item: url },
    )
  } else if (cleanSlug === 'tools') {
    items.push({ '@type': 'ListItem', position: 2, name: 'Tools', item: `${WEB_INFO.BASE_URL}/tools` })
  } else if (cleanSlug.startsWith('tools/')) {
    const rawCat = cleanSlug.replace('tools/', '')
    const resolvedCatName = categoryLabel || formatFallbackCategory(rawCat)
    items.push(
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${WEB_INFO.BASE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: `${resolvedCatName} Tools`, item: url },
    )
  } else if (cleanSlug === 'about') {
    items.push({ '@type': 'ListItem', position: 2, name: 'About', item: url })
  } else if (cleanSlug === 'privacy') {
    items.push({ '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: url })
  } else if (cleanSlug === 'dashboard') {
    items.push({ '@type': 'ListItem', position: 2, name: 'Dashboard', item: url })
  } else {
    items.push({ '@type': 'ListItem', position: 2, name: 'Tools', item: `${WEB_INFO.BASE_URL}/tools` })

    if (category) {
      const resolvedCatName = categoryLabel || formatFallbackCategory(category)
      items.push(
        {
          '@type': 'ListItem',
          position: 3,
          name: `${resolvedCatName} Tools`,
          item: `${WEB_INFO.BASE_URL}/tools/${category}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: toolName || title || cleanSlug,
          item: url,
        },
      )
    } else {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: toolName || title || cleanSlug,
        item: url,
      })
    }
  }

  return items
}

export function buildSEOConfig({
  title,
  description,
  slug,
  keywords = [],
  category,
  categoryLabel,
  faqs = [],
  features = [],
  steps = [],
  toolName,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  authorName,
  itemList = [],
}: SEOProps = {}): BuiltSEOConfig {
  const fullTitle = title
    ? title.toLowerCase().includes(WEB_INFO.SITE_NAME.toLowerCase()) || title.length > 40
      ? title
      : `${title} — ${WEB_INFO.SITE_NAME}`
    : `${WEB_INFO.SITE_NAME} — Private Client-Side Dev Tools`

  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const cleanSlug = slug?.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase() ?? ''
  const url = cleanSlug ? `${WEB_INFO.BASE_URL}/${cleanSlug}` : WEB_INFO.BASE_URL
  const ogImage = `${WEB_INFO.BASE_URL}/images/og-1200x630.png`
  const ogType: 'website' | 'article' = type === 'article' ? 'article' : 'website'

  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const botContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

  const schemas: Record<string, unknown>[] = []

  if (!noindex) {
    // 1. WebSite + Sitelinks SearchBox
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${WEB_INFO.BASE_URL}/#website`,
      url: WEB_INFO.BASE_URL,
      name: WEB_INFO.SITE_NAME,
      description:
        'Fast, private, 100% client-side developer utility suite. Formatters, decoders, encoders, and converters running entirely in browser memory.',
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${WEB_INFO.BASE_URL}/tools?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    })

    // 2. Organization Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${WEB_INFO.BASE_URL}/#organization`,
      name: WEB_INFO.SITE_NAME,
      url: WEB_INFO.BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${WEB_INFO.BASE_URL}/images/icon-96.png`,
      },
      sameAs: [
        WEB_INFO.WEB_OWNER_GITHUB_PROFILE || 'https://github.com/goldi0002/devtoolbox',
      ].filter(Boolean),
    })

    // 3. Primary Entity Schema (BlogPosting vs CollectionPage/AboutPage/WebPage vs WebApplication)
    const isCollectionPage =
      cleanSlug === 'tools' ||
      cleanSlug.startsWith('tools/') ||
      cleanSlug === 'recipes' ||
      cleanSlug === 'blog'

    if (type === 'article') {
      const resolvedAuthor = authorName || WEB_INFO.SITE_NAME
      const articleSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: title || fullTitle,
        description: desc,
        url,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        image: ogImage,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        author: {
          '@type': 'Organization',
          name: resolvedAuthor,
          url: WEB_INFO.BASE_URL,
        },
        publisher: {
          '@id': `${WEB_INFO.BASE_URL}/#organization`,
        },
      }
      if (publishedTime) {
        articleSchema.datePublished = publishedTime
        articleSchema.dateModified = modifiedTime || publishedTime
      }
      if (keywords.length > 0) {
        articleSchema.keywords = keywords.join(', ')
      }
      schemas.push(articleSchema)
    } else if (cleanSlug === 'about') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${url}#webpage`,
        name: fullTitle,
        url,
        description: desc,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${WEB_INFO.BASE_URL}/#website` },
      })
    } else if (cleanSlug === 'privacy') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: fullTitle,
        url,
        description: desc,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${WEB_INFO.BASE_URL}/#website` },
      })
    } else if (isCollectionPage) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${url}#collectionpage`,
        name: fullTitle,
        url,
        description: desc,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${WEB_INFO.BASE_URL}/#website` },
      })
    } else {
      const appSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${url}#webapp`,
        name: toolName || title || WEB_INFO.SITE_NAME,
        url,
        description: desc,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All (Web Browser, Chrome, Firefox, Safari, Edge)',
        browserRequirements: 'Requires JavaScript enabled',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        author: {
          '@type': 'Organization',
          name: WEB_INFO.SITE_NAME,
          url: WEB_INFO.BASE_URL,
        },
      }
      if (categoryLabel || category) {
        appSchema.applicationSubCategory = categoryLabel || formatFallbackCategory(category!)
      }
      if (features.length > 0) {
        appSchema.featureList = features
      }
      schemas.push(appSchema)
    }

    // 4. ItemList Schema (directories, home showcase, recipe hubs)
    if (itemList.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: toolName || title || WEB_INFO.SITE_NAME,
        numberOfItems: itemList.length,
        itemListElement: itemList.slice(0, 50).map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          url: toAbsoluteUrl(item.url),
          ...(item.description ? { description: item.description } : {}),
        })),
      })
    }

    // 5. BreadcrumbList Schema
    if (cleanSlug) {
      const breadcrumbItems = buildBreadcrumbItems({
        cleanSlug,
        url,
        title,
        toolName,
        category,
        categoryLabel,
      })
      if (breadcrumbItems.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        })
      }
    }

    // 6. FAQPage Schema
    if (faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      })
    }

    // 7. HowTo Schema
    const howToTarget = toolName || (type === 'software' ? title : undefined)
    if (steps.length > 0 && howToTarget) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${howToTarget}`,
        description: `Step-by-step guide to using ${howToTarget} online securely in your browser.`,
        step: steps.map((step, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      })
    }
  }

  const jsonLdString = schemas.length > 0
    ? JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)
    : ''

  return {
    fullTitle,
    description: desc,
    cleanSlug,
    url,
    ogImage,
    ogType,
    robotsContent,
    botContent,
    noindex,
    schemas,
    jsonLdString,
  }
}
