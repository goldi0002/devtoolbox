import { lazy } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './App'
import { tools } from './tools/registry'
import { blogSlugs } from './data/blog'
import { DEV_RECIPES } from './data/recipes'

// Lazy load pages for SSG
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ToolsIndex = lazy(() => import('./pages/ToolsIndex'))
const About = lazy(() => import('./pages/About'))
const BlogIndex = lazy(() => import('./pages/BlogIndex'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const ToolPage = lazy(() => import('./pages/ToolPage'))
const RecipesIndex = lazy(() => import('./pages/RecipesIndex'))
const RecipePage = lazy(() => import('./pages/RecipePage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Privacy = lazy(() => import('./pages/Privacy'))

const toolSlugs = tools.map(t => t.slug)

// Define nested routes: Layout is the parent of all pages.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'tools', element: <ToolsIndex /> },
      { path: 'tools/:category', element: <ToolsIndex /> },
      { path: 'recipes', element: <RecipesIndex /> },
      { path: 'recipes/:slug', element: <RecipePage /> },
      ...DEV_RECIPES.map(r => ({
        path: `recipes/${r.slug}`,
        element: <RecipePage />,
      })),
      { path: 'about', element: <About /> },
      { path: 'blog', element: <BlogIndex /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      ...blogSlugs.map(slug => ({
        path: `blog/${slug}`,
        element: <BlogPost />,
      })),
      { path: 'privacy', element: <Privacy /> },
      ...toolSlugs.map(slug => ({
        path: slug,
        element: <ToolPage />,
      })),
      { path: 'pipeline', element: <ToolPage /> },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
