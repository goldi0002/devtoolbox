import posthog from 'posthog-js'

export function initAnalytics() {
  if (import.meta.env.VITE_ENVIRONMENT === "development") return
  if (typeof window === 'undefined') return  // ← SSG build runs in Node, no window
  if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) return

  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host:         import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false,
    persistence:      'memory',
  })
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return
  posthog.capture('$pageview', { $current_url: path })
}

export function trackToolUsed(slug: string) {
  if (typeof window === 'undefined') return
  posthog.capture('tool_used', { tool: slug })
}

export function trackCopied(tool: string) {
  if (typeof window === 'undefined') return
  posthog.capture('copy_clicked', { tool })
}