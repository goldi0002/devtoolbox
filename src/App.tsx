import type { RouteRecord } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import { PostHogProvider } from 'posthog-js/react'
import { usePostHog } from 'posthog-js/react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ToolsIndex from './pages/ToolsIndex'
import About from './pages/About'
import ToolPage from './pages/ToolPage'
import NotFound from './pages/NotFound'

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  defaults: '2026-01-30', 
} as const

const toolSlugs = [
  'json-formatter',
  'json-model',
  'uuid',
  'base64',
  'text-diff',
  'jwt'
]
function RouteTracker() {
  const location = useLocation()
  const posthog = usePostHog()
  posthog?.capture('$pageview', { currentUrl: location.pathname })
  return null
}
function Layout({ children }: { children: React.ReactNode }) {
  const isBrowser = typeof window !== 'undefined'
  const content = (
    <HelmetProvider>
      <div className="min-h-screen bg-bg text-bright">
        <RouteTracker />
        <Navbar />
        {children}
      </div>
    </HelmetProvider>
  )
  if (!isBrowser) return content  // SSG build — skip PostHog wrapper
  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? ''}
      options={posthogOptions}
    >
      {content}
    </PostHogProvider>
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
]

export default function App() {
  return null
}