import { useEffect } from 'react'
import { Head } from 'vite-react-ssg'
import { WEB_INFO } from '../utils/webinfo'

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
}

export interface SEOProps {
  title?: string
  description?: string
  slug?: string
  keywords?: string[]
  category?: string
  faqs?: FAQItem[]
  features?: string[]
  steps?: HowToStep[]
  toolName?: string
  type?: 'website' | 'article' | 'software'
}

function updateMetaTag(attrName: string, attrValue: string, content: string) {
  if (typeof document === 'undefined') return
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function SEO({
  title,
  description,
  slug,
  keywords = [],
  category,
  faqs = [],
  features = [],
  steps = [],
  toolName,
  type = 'website'
}: SEOProps = {}) {
  const isHome = !slug || slug === '/'
  const fullTitle = title 
    ? (title.toLowerCase().includes(WEB_INFO.SITE_NAME.toLowerCase()) || title.length > 40
        ? title 
        : `${title} — ${WEB_INFO.SITE_NAME}`)
    : `${WEB_INFO.SITE_NAME} — Private Client-Side Dev Tools`
  
  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const cleanSlug = slug?.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase() ?? ''
  const url = cleanSlug ? `${WEB_INFO.BASE_URL}/${cleanSlug}` : WEB_INFO.BASE_URL
  const ogImage = `${WEB_INFO.BASE_URL}/images/og-1200x630.png`

  // Structured Data Schemas
  const schemas: any[] = []

  // 1. WebSite + SearchAction (Home & global discovery)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${WEB_INFO.BASE_URL}/#website`,
    'url': WEB_INFO.BASE_URL,
    'name': WEB_INFO.SITE_NAME,
    'description': 'Fast, private, 100% client-side developer utility suite. Formatters, decoders, encoders, and converters running entirely in browser memory.',
    'inLanguage': 'en-US',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${WEB_INFO.BASE_URL}/tools?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  })

  // 2. Organization Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${WEB_INFO.BASE_URL}/#organization`,
    'name': WEB_INFO.SITE_NAME,
    'url': WEB_INFO.BASE_URL,
    'logo': `${WEB_INFO.BASE_URL}/images/icon-96.png`,
    'sameAs': [
      WEB_INFO.WEB_OWNER_GITHUB_PROFILE || 'https://github.com/goldi0002/devtoolbox'
    ].filter(Boolean)
  })

  // 3. WebApplication / SoftwareApplication (for tool pages & general site)
  const appSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${url}#webapp`,
    'name': toolName || title || WEB_INFO.SITE_NAME,
    'url': url,
    'description': desc,
    'applicationCategory': category ? `${category} Developer Application` : 'DeveloperApplication',
    'operatingSystem': 'All (Web Browser, Chrome, Firefox, Safari, Edge)',
    'browserRequirements': 'Requires JavaScript enabled',
    'isAccessibleForFree': true,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'author': {
      '@type': 'Organization',
      'name': WEB_INFO.SITE_NAME,
      'url': WEB_INFO.BASE_URL
    }
  }

  if (features.length > 0) {
    appSchema.featureList = features
  }
  schemas.push(appSchema)

  // 4. BreadcrumbList Schema (if on child route)
  if (cleanSlug) {
    const isToolCategory = cleanSlug.startsWith('tools/')
    const isToolPage = !isToolCategory && cleanSlug !== 'tools' && cleanSlug !== 'about' && cleanSlug !== 'privacy'

    const breadcrumbItems: any[] = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': WEB_INFO.BASE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Tools',
        'item': `${WEB_INFO.BASE_URL}/tools`
      }
    ]

    if (isToolCategory) {
      const catName = cleanSlug.replace('tools/', '')
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': `${catName.charAt(0).toUpperCase() + catName.slice(1)} Tools`,
        'item': url
      })
    } else if (isToolPage) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': toolName || title || cleanSlug,
        'item': url
      })
    } else {
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': title || cleanSlug,
        'item': url
      })
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbItems
    })
  }

  // 5. FAQPage Schema (crucial for AEO - AI engines & Google rich answers)
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    })
  }

  // 6. HowTo Schema (for step-by-step guides)
  if (steps.length > 0 && toolName) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use ${toolName}`,
      'description': `Step-by-step guide to using ${toolName} online securely in your browser.`,
      'step': steps.map((step, i) => ({
        '@type': 'HowToStep',
        'position': i + 1,
        'name': step.name,
        'text': step.text
      }))
    })
  }

  const jsonLdString = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)

  // Keep client DOM in sync for fast SPA route changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    document.title = fullTitle
    updateMetaTag('name', 'description', desc)
    if (keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '))
    }
    updateMetaTag('name', 'author', 'ToolBox4Devs')
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMetaTag('name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    updateMetaTag('name', 'bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')

    updateMetaTag('property', 'og:site_name', WEB_INFO.SITE_NAME)
    updateMetaTag('property', 'og:title', fullTitle)
    updateMetaTag('property', 'og:description', desc)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', isHome ? 'website' : 'article')
    updateMetaTag('property', 'og:image', ogImage)
    updateMetaTag('property', 'og:image:width', '1200')
    updateMetaTag('property', 'og:image:height', '630')
    updateMetaTag('property', 'og:image:alt', `${fullTitle} Preview`)
    updateMetaTag('property', 'og:locale', 'en_US')

    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', fullTitle)
    updateMetaTag('name', 'twitter:description', desc)
    updateMetaTag('name', 'twitter:image', ogImage)
    updateMetaTag('name', 'twitter:image:alt', `${fullTitle} Preview`)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    let script = document.querySelector('script[id="json-ld-schema"]')
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('id', 'json-ld-schema')
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    script.textContent = jsonLdString
  }, [fullTitle, desc, url, ogImage, isHome, jsonLdString, keywords])

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content="ToolBox4Devs" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={WEB_INFO.SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={isHome ? 'website' : 'article'} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} Preview`} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${fullTitle} Preview`} />

      {/* Structured Data */}
      <script id="json-ld-schema" type="application/ld+json">
        {jsonLdString}
      </script>
    </Head>
  )
}

