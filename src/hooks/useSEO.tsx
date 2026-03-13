import { Helmet } from 'react-helmet-async'
import { WEB_INFO } from '../utils/webinfo'

interface SEOProps {
  title?: string
  description?: string
  slug?: string
}

// Returns a component, not a hook — avoids SSG build issues
export function SEO({ title, description, slug }: SEOProps = {}) {
  const fullTitle = title ? `${title} — ${WEB_INFO.SITE_NAME}` : WEB_INFO.SITE_NAME
  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const url = slug ? `${WEB_INFO.BASE_URL}/${slug}` : WEB_INFO.BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={WEB_INFO.SITE_NAME} />
      <meta property="og:image" content={`${WEB_INFO.BASE_URL}/images/og-1200x630.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={`${WEB_INFO.BASE_URL}/images/og-1200x630.png`} />
    </Helmet>
  )
}