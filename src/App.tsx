import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
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

// function PageLoader() {
//   return (
//     <div className="loader-root">
//       <div className="loader-scene">
//         <div className="loader-bars">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="bar" style={{ animationDelay: `${i * 0.12}s` }} />
//           ))}
//         </div>
//         <p className="loader-label">Loading</p>
//       </div>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap');

//         .loader-root {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           height: 100vh;
//           width: 100%;
//           background: #0a0a0f;
//         }

//         .loader-scene {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 28px;
//         }

//         .loader-bars {
//           display: flex;
//           align-items: flex-end;
//           gap: 6px;
//           height: 48px;
//         }

//         .bar {
//           width: 4px;
//           border-radius: 2px;
//           background: #e8e0ff;
//           animation: pulse-bar 1s ease-in-out infinite;
//           box-shadow: 0 0 12px #a78bfa88;
//         }

//         @keyframes pulse-bar {
//           0%, 100% { height: 10px; opacity: 0.3; }
//           50%       { height: 48px; opacity: 1; }
//         }

//         .loader-label {
//           font-family: 'DM Mono', monospace;
//           font-size: 11px;
//           font-weight: 300;
//           letter-spacing: 0.3em;
//           text-transform: uppercase;
//           color: #6d6a8a;
//           animation: fade-pulse 1.8s ease-in-out infinite;
//         }

//         @keyframes fade-pulse {
//           0%, 100% { opacity: 0.4; }
//           50%       { opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// }

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
    <HelmetProvider>
      <div className="min-h-screen bg-bg text-bright">
        <Navbar />
        {/* Suspense is required for lazy loaded components in SSG */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </HelmetProvider>
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
