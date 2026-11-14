import { useEffect } from 'react'

/**
 * Fallback page title helper for pages without <SEO>.
 * Never overwrites a title already managed by <SEO> (data-rh / json-ld-schema).
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (typeof document === 'undefined' || !title || title.toLowerCase() === 'home') return
    if (document.querySelector('title[data-rh="true"]') || document.querySelector('script[id="json-ld-schema"]')) {
      return
    }
    document.title = title.toLowerCase().includes('toolbox4devs')
      ? title
      : `${title} — ToolBox4Devs`
  }, [title])
}