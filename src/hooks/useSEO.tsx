import { Head } from 'vite-react-ssg'  // ✅ built-in, no extra packages
import { WEB_INFO } from '../utils/webinfo'

interface SEOProps {
  title?: string
  description?: string
  slug?: string
}

export function SEO({ title, description, slug }: SEOProps = {}) {
  const fullTitle = title ? `${title} — ${WEB_INFO.SITE_NAME}` : WEB_INFO.SITE_NAME
  const desc = description ?? WEB_INFO.DEFAULT_DESCRIPTION
  const url = slug ? `${WEB_INFO.BASE_URL}/${slug}` : WEB_INFO.BASE_URL

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={WEB_INFO.SITE_NAME} />
      <meta property="og:image" content={`${WEB_INFO.BASE_URL}/images/og-1200x630.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={`${WEB_INFO.BASE_URL}/images/og-1200x630.png`} />
    </Head>
  )
}