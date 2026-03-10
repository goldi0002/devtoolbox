// src/hooks/useSEO.tsx
import { Helmet } from 'react-helmet-async'

const SITE_NAME = import.meta.env.VITE_SITE_NAME
const BASE_URL  = import.meta.env.VITE_BASE_URL ?? `https://${import.meta.env.VITE_VERCEL_URL}`
const DEFAULT_DESCRIPTION =
  'A free collection of browser-based developer utilities. ' +
  'JSON formatter, UUID generator, JWT decoder, Base64 encoder and more.'

interface SEOProps {
  title?:       string   // page-specific title, e.g. "JWT Decoder"
  description?: string   // page-specific description
  slug?:        string   // e.g. "jwt" → canonical URL becomes /jwt
}

export function useSEO({ title, description, slug }: SEOProps = {}) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : SITE_NAME

  const desc = description ?? DEFAULT_DESCRIPTION
  const url  = slug ? `${BASE_URL}/${slug}` : BASE_URL

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description"        content={desc} />
      <link rel="canonical"           href={url} />

      {/* Open Graph (Facebook, LinkedIn, Discord previews) */}
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url"         content={url} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter card */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}