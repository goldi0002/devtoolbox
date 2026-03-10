import { Helmet } from 'react-helmet-async'

const SITE_NAME = import.meta.env.VITE_SITE_NAME ?? 'DevToolbox'
const BASE_URL  = import.meta.env.VITE_BASE_URL ?? `https://${import.meta.env.VITE_VERCEL_URL ?? 'localhost'}`
const DEFAULT_DESCRIPTION =
  'A free collection of browser-based developer utilities. ' +
  'JSON formatter, UUID generator, JWT decoder, Base64 encoder and more.'

interface SEOProps {
  title?:       string
  description?: string
  slug?:        string
}

// Returns a component, not a hook — avoids SSG build issues
export function SEO({ title, description, slug }: SEOProps = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  const desc = description ?? DEFAULT_DESCRIPTION
  const url  = slug ? `${BASE_URL}/${slug}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description"         content={desc} />
      <link rel="canonical"            href={url} />
      <meta property="og:type"         content="website" />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={desc} />
      <meta property="og:url"          content={url} />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}