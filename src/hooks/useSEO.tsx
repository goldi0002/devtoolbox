import { useEffect } from 'react'
import { Head } from 'vite-react-ssg'
import { WEB_INFO } from '../utils/webinfo'
import {
  buildSEOConfig,
  type FAQItem,
  type HowToStep,
  type SEOListItem,
  type SEOProps,
} from '../utils/seo'

export type { FAQItem, HowToStep, SEOListItem, SEOProps }

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

function removeMetaTag(attrName: string, attrValue: string) {
  if (typeof document === 'undefined') return
  document.querySelector(`meta[${attrName}="${attrValue}"]`)?.remove()
}

export function SEO(props: SEOProps = {}) {
  const { keywords = [], publishedTime, modifiedTime } = props
  const config = buildSEOConfig(props)
  const {
    fullTitle,
    description: desc,
    url,
    ogImage,
    ogType,
    robotsContent,
    botContent,
    noindex,
    jsonLdString,
  } = config

  // Keep client DOM in sync for fast SPA route changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    document.title = fullTitle
    updateMetaTag('name', 'description', desc)
    if (keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '))
    } else {
      removeMetaTag('name', 'keywords')
    }
    updateMetaTag('name', 'author', 'ToolBox4Devs')
    updateMetaTag('name', 'robots', robotsContent)
    updateMetaTag('name', 'googlebot', botContent)
    updateMetaTag('name', 'bingbot', botContent)

    updateMetaTag('property', 'og:site_name', WEB_INFO.SITE_NAME)
    updateMetaTag('property', 'og:title', fullTitle)
    updateMetaTag('property', 'og:description', desc)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', ogType)
    updateMetaTag('property', 'og:image', ogImage)
    updateMetaTag('property', 'og:image:width', '1200')
    updateMetaTag('property', 'og:image:height', '630')
    updateMetaTag('property', 'og:image:alt', `${fullTitle} Preview`)
    updateMetaTag('property', 'og:locale', 'en_US')

    if (ogType === 'article' && publishedTime) {
      updateMetaTag('property', 'article:published_time', publishedTime)
      updateMetaTag('property', 'article:modified_time', modifiedTime || publishedTime)
    } else {
      removeMetaTag('property', 'article:published_time')
      removeMetaTag('property', 'article:modified_time')
    }

    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', fullTitle)
    updateMetaTag('name', 'twitter:description', desc)
    updateMetaTag('name', 'twitter:image', ogImage)
    updateMetaTag('name', 'twitter:image:alt', `${fullTitle} Preview`)

    const existingCanonical = document.querySelector('link[rel="canonical"]')
    if (noindex) {
      existingCanonical?.remove()
    } else {
      const canonical = existingCanonical ?? document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      canonical.setAttribute('href', url)
      if (!existingCanonical) {
        document.head.appendChild(canonical)
      }
    }

    const existingScript = document.querySelector('script[id="json-ld-schema"]')
    if (jsonLdString) {
      const script = existingScript ?? document.createElement('script')
      script.setAttribute('id', 'json-ld-schema')
      script.setAttribute('type', 'application/ld+json')
      script.textContent = jsonLdString
      if (!existingScript) {
        document.head.appendChild(script)
      }
    } else {
      existingScript?.remove()
    }
  }, [
    fullTitle,
    desc,
    url,
    ogImage,
    ogType,
    robotsContent,
    botContent,
    noindex,
    jsonLdString,
    keywords,
    publishedTime,
    modifiedTime,
  ])

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content="ToolBox4Devs" />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={botContent} />
      <meta name="bingbot" content={botContent} />
      {!noindex && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={WEB_INFO.SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} Preview`} />
      <meta property="og:locale" content="en_US" />
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && publishedTime && (
        <meta property="article:modified_time" content={modifiedTime || publishedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${fullTitle} Preview`} />

      {/* Structured Data */}
      {jsonLdString && (
        <script id="json-ld-schema" type="application/ld+json">
          {jsonLdString}
        </script>
      )}
    </Head>
  )
}
