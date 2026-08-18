import { useEffect } from 'react'
import { WEB_INFO } from '../utils/webinfo'

export interface FAQItem {
  question: string
  answer: string
}

export interface SEOProps {
  title?: string
  description?: string
  slug?: string
  keywords?: string[]
  category?: string
  faqs?: FAQItem[]
  features?: string[]
  toolName?: string
  type?: 'website' | 'article' | 'software'
}

function updateMetaTag(attrName: string, attrValue: string, content: string) {
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
  toolName,
  type = 'website'
}: SEOProps = {}) {
  const isHome = !slug || slug === '/'
  const fullTitle = title 
    ? (title.includes(WEB_INFO.SITE_NAME) ? title : `${title} — ${WEB_INFO.SITE_NAME}`)
    : `${WEB_INFO.SITE_NAME} — Fast, Private, 100% Client-Side Developer Tools`
  
  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const cleanSlug = slug?.replace(/^\/+/, '') ?? ''
  const url = cleanSlug ? `${WEB_INFO.BASE_URL}/${cleanSlug}` : WEB_INFO.BASE_URL
  const ogImage = `${WEB_INFO.BASE_URL}/images/og-1200x630.png`

  const faqsKey = JSON.stringify(faqs)
  const featuresKey = JSON.stringify(features)
  const keywordsKey = keywords.join(',')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Document Title
    document.title = fullTitle

    // Standard SEO Tags
    updateMetaTag('name', 'description', desc)
    if (keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '))
    }
    updateMetaTag('name', 'author', 'ToolBox4Devs')
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    updateMetaTag('name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    updateMetaTag('name', 'bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')

    // Open Graph Tags
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

    // Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', fullTitle)
    updateMetaTag('name', 'twitter:description', desc)
    updateMetaTag('name', 'twitter:image', ogImage)
    updateMetaTag('name', 'twitter:image:alt', `${fullTitle} Preview`)

    // Canonical link tag
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    // Structured Data Schemas
    const schemas: any[] = []

    // 1. WebSite + SearchAction (Home & global discovery)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${WEB_INFO.BASE_URL}/#website`,
      "url": WEB_INFO.BASE_URL,
      "name": WEB_INFO.SITE_NAME,
      "description": "Fast, private, 100% client-side developer utility suite. Formatters, decoders, encoders, and converters running entirely in browser memory.",
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${WEB_INFO.BASE_URL}/tools?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    })

    // 2. Organization Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${WEB_INFO.BASE_URL}/#organization`,
      "name": WEB_INFO.SITE_NAME,
      "url": WEB_INFO.BASE_URL,
      "logo": `${WEB_INFO.BASE_URL}/images/icon-96.png`,
      "sameAs": [
        WEB_INFO.WEB_OWNER_GITHUB_PROFILE || "https://github.com/goldi0002/devtoolbox"
      ].filter(Boolean)
    })

    // 3. WebApplication / SoftwareApplication (for tool pages & general site)
    const appSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${url}#webapp`,
      "name": toolName || title || WEB_INFO.SITE_NAME,
      "url": url,
      "description": desc,
      "applicationCategory": category ? `${category} Developer Application` : "DeveloperApplication",
      "operatingSystem": "All (Web Browser, Chrome, Firefox, Safari, Edge)",
      "browserRequirements": "Requires modern JavaScript enabled",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "Organization",
        "name": WEB_INFO.SITE_NAME,
        "url": WEB_INFO.BASE_URL
      }
    }

    if (features.length > 0) {
      appSchema.featureList = features
    }
    schemas.push(appSchema)

    // 4. BreadcrumbList Schema (if on child route)
    if (cleanSlug) {
      const isToolCategory = cleanSlug.startsWith('tools/')
      const isToolPage = !isToolCategory && cleanSlug !== 'tools' && cleanSlug !== 'about' && cleanSlug !== 'privacy' && cleanSlug !== 'changelog'

      const breadcrumbItems: any[] = [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": WEB_INFO.BASE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Tools",
          "item": `${WEB_INFO.BASE_URL}/tools`
        }
      ]

      if (isToolCategory) {
        const catName = cleanSlug.replace('tools/', '')
        breadcrumbItems.push({
          "@type": "ListItem",
          "position": 3,
          "name": `${catName.charAt(0).toUpperCase() + catName.slice(1)} Tools`,
          "item": url
        })
      } else if (isToolPage) {
        breadcrumbItems.push({
          "@type": "ListItem",
          "position": 3,
          "name": toolName || title || cleanSlug,
          "item": url
        })
      } else {
        breadcrumbItems.push({
          "@type": "ListItem",
          "position": 3,
          "name": title || cleanSlug,
          "item": url
        })
      }

      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      })
    }

    // 5. FAQPage Schema (crucial for AEO - AI engines & Google rich answers)
    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      })
    }

    let script = document.querySelector('script[id="json-ld-schema"]')
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('id', 'json-ld-schema')
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2)
  }, [fullTitle, desc, url, keywordsKey, category, cleanSlug, title, ogImage, isHome, toolName, faqsKey, featuresKey, keywords, faqs, features])

  return null
}
