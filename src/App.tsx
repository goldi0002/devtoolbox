import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import posthog from 'posthog-js'
import Navbar from './components/Navbar'

const PageLoader = lazy(() => import('./components/ui/PageLoader'))
export function Layout() {
  const { pathname } = useLocation()

  // useEffect(() => {
  //   // 1. SSR Safety: Only initialize PostHog on the client
  //   if (typeof window !== 'undefined' && import.meta.env.VITE_ENVIRONMENT !== 'development') {
  //     posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? '', {
  //       api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  //       capture_pageview: true,
  //       persistence: 'memory',
  //     })
  //   }
  // }, [])

  useEffect(() => {
    // 2. Scroll to top on route change
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
      <div className="min-h-screen bg-bg text-bright">
        <Navbar />
        {/* Suspense is required for lazy loaded components in SSG */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
  )
}
