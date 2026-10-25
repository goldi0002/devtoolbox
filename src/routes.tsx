import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './App'
import { tools } from './tools/registry'
import { blogSlugs } from './data/blog'
import { DEV_RECIPES } from './data/recipes'

import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ToolsIndex from './pages/ToolsIndex'
import About from './pages/About'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import ToolPage from './pages/ToolPage'
import RecipesIndex from './pages/RecipesIndex'
import RecipePage from './pages/RecipePage'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'

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
