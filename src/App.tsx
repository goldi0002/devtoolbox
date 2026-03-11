import type { RouteRecord } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { tools } from './tools/registry'


import Navbar from './components/Navbar'
import Home from './pages/Home'
import ToolsIndex from './pages/ToolsIndex'
import About from './pages/About'
import ToolPage from './pages/ToolPage'
import NotFound from './pages/NotFound'


const toolSlugs = tools.map(t => t.slug)

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
    path: '/about',
    element: <Layout><About /></Layout>,
  },
  ...toolSlugs.map(slug => ({
    path: `/${slug}`,
    element: <Layout><ToolPage /></Layout>,
  })),
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
  {
    path: '/404',
    element: <Layout><NotFound /></Layout>,
  },
  {
    path: '/tools/:category',
    element: <Layout><ToolsIndex /></Layout>,
  }
]

export default function App() {
  return null
}