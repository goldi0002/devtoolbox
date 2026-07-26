import { useEffect } from 'react'
import { WEB_INFO } from '../utils/webinfo'

interface SEOProps {
  title?: string
  description?: string
  slug?: string
  keywords?: string[]
  category?: string
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

export function SEO({ title, description, slug, keywords = [], category }: SEOProps = {}) {
  const fullTitle = title ? `${title} — ${WEB_INFO.SITE_NAME}` : `${WEB_INFO.SITE_NAME} — Fast, Private, Client-Side Developer Tools`
  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const url = slug ? `${WEB_INFO.BASE_URL}/${slug}` : WEB_INFO.BASE_URL
  const ogImage = `${WEB_INFO.BASE_URL}/images/og-1200x630.png`

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Dynamic client-side document update
    document.title = fullTitle

    // Primary Meta Description & Keywords
    updateMetaTag('name', 'description', desc)
    if (keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '))
    }

    // Open Graph Tags
    updateMetaTag('property', 'og:site_name', WEB_INFO.SITE_NAME)
    updateMetaTag('property', 'og:title', fullTitle)
    updateMetaTag('property', 'og:description', desc)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', slug ? 'article' : 'website')
    updateMetaTag('property', 'og:image', ogImage)

    // Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', fullTitle)
    updateMetaTag('name', 'twitter:description', desc)
    updateMetaTag('name', 'twitter:image', ogImage)

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    // Schema.org Structured Data
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": title || WEB_INFO.SITE_NAME,
      "description": desc,
      "url": url,
      "applicationCategory": category || "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }

    const breadcrumbsSchema = slug ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
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
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title || slug,
          "item": url
        }
      ]
    } : null

    let script = document.querySelector('script[id="json-ld-schema"]')
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('id', 'json-ld-schema')
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(breadcrumbsSchema ? [appSchema, breadcrumbsSchema] : appSchema)
  }, [fullTitle, desc, url, keywords, category, slug, title, ogImage])

  return null
}
