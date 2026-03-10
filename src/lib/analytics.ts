import posthog from 'posthog-js'

export function initAnalytics() {
  if (import.meta.env.VITE_ENVIRONMENT === "development") return // don't track in local dev
  if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) return console.warn('PHog key not found, analytics disabled')
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host:         import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false, // we handle this manually
    persistence:      'memory', // no cookies, privacy friendly
  })
}

export function trackPageView(path: string) {
  posthog.capture('$pageview', { $current_url: path })
}

export function trackToolUsed(slug: string) {
  posthog.capture('tool_used', { tool: slug })
}

export function trackCopied(tool: string) {
  posthog.capture('copy_clicked', { tool })
}