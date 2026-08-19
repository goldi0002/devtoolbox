import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import posthog from 'posthog-js'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import PwaStatusBanner from './components/ui/PwaStatusBanner'

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
      <div className="min-h-screen bg-bg text-bright flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:left-4 focus:top-4 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-accent-fg"
        >
          Skip to content
        </a>
        <PwaStatusBanner />
        <Navbar />
        <div id="main-content" className="flex-1">
          {/* Suspense is required for lazy loaded components in SSG */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
  )
}
