import type { RouteRecord } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import posthog from 'posthog-js'
import { useEffect,lazy } from 'react'
import { tools } from './tools/registry'
import { useLocation } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const ToolsIndex = lazy(() => import('./pages/ToolsIndex'))
const About = lazy(() => import('./pages/About'))
const ToolPage = lazy(() => import('./pages/ToolPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Navbar = lazy(() => import('./components/Navbar'))

const toolSlugs = tools.map(t => t.slug)
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (import.meta.env.VITE_ENVIRONMENT !== 'development') {
      posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? '', {
        api_host:         import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
        capture_pageview: true,
        persistence:      'memory',
      })
    }
  }, [])
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-bg text-bright">
        <ScrollToTop />
        <Navbar />
        {children}
      </div>
    </HelmetProvider>
  )
}

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/tools',
    element: <Layout><ToolsIndex /></Layout>,
  },
  {
    path: '/tools/:category',
    element: <Layout><ToolsIndex /></Layout>,
  },
  {
    path: '/about',
    element: <Layout><About /></Layout>,
  },
  ...toolSlugs.map(slug => ({
    path: `/:slug`,
    element: <Layout><ToolPage /></Layout>,
  })),
  {
    path: '/404',
    element: <Layout><NotFound /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  }
]

export default function App() {
  return null
}