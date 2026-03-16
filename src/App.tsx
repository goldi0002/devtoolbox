import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import posthog from 'posthog-js'
import type { RouteRecord } from 'vite-react-ssg'
import { tools } from './tools/registry'
import Navbar from './components/Navbar'

// Lazy load pages for SSG
const Home = lazy(() => import('./pages/Home'))
const ToolsIndex = lazy(() => import('./pages/ToolsIndex'))
const About = lazy(() => import('./pages/About'))
const ToolPage = lazy(() => import('./pages/ToolPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PageLoader = lazy(() => import('./components/ui/PageLoader'))
const Changelog = lazy(() => import('./pages/Changelog'))
const Privacy = lazy(() => import('./pages/Privacy'))

const toolSlugs = tools.map(t => t.slug)
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

// 3. Define nested routes: Layout is the parent of all pages
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tools', element: <ToolsIndex /> },
      { path: 'tools/:category', element: <ToolsIndex /> },
      { path: 'about', element: <About /> },
      // Place broad dynamic routes at the end to avoid conflicts
      ...toolSlugs.map(slug => ({
        path: slug,
        element: <ToolPage />,
      })),
      { path: '404', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
      { path: 'changelog', element: <Changelog /> },
      { path: 'privacy', element: <Privacy /> }
    ],
  },
]
