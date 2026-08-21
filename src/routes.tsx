import { lazy } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './App'
import { tools } from './tools/registry'

// Lazy load pages for SSG
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ToolsIndex = lazy(() => import('./pages/ToolsIndex'))
const About = lazy(() => import('./pages/About'))
const ToolPage = lazy(() => import('./pages/ToolPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Changelog = lazy(() => import('./pages/Changelog'))
const Privacy = lazy(() => import('./pages/Privacy'))

const toolSlugs = tools.map(t => t.slug)

// Define nested routes: Layout is the parent of all pages.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tools', element: <ToolsIndex /> },
      { path: 'tools/:category', element: <ToolsIndex /> },
      { path: 'about', element: <About /> },
      { path: 'changelog', element: <Changelog /> },
      { path: 'privacy', element: <Privacy /> },
      ...toolSlugs.map(slug => ({
        path: slug,
        element: <ToolPage />,
      })),
      { path: '404', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
