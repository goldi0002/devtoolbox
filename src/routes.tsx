import type { ComponentType } from 'react'
import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './App'
import { tools } from './tools/registry'

// Each page is loaded on demand so a visitor only downloads the code for the
// route they open. vite-react-ssg resolves the matched route's `lazy` before
// hydrating, and scans these inline import() calls to emit preload hints, so
// keep each import() literal inside its `lazy` function (no shared helper).
type PageModule = { default: ComponentType }
const asRoute = (m: PageModule) => ({ Component: m.default })

// Blog posts and recipes are served by their `:slug` routes; the list of
// URLs to pre-render comes from `includedRoutes` in vite.config.ts.

const toolSlugs = tools.map(t => t.slug)

// Define nested routes: Layout is the parent of all pages.
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, lazy: () => import('./pages/Home').then(asRoute) },
      { path: 'dashboard', lazy: () => import('./pages/Dashboard').then(asRoute) },
      { path: 'tools', lazy: () => import('./pages/ToolsIndex').then(asRoute) },
      { path: 'tools/:category', lazy: () => import('./pages/ToolsIndex').then(asRoute) },
      { path: 'recipes', lazy: () => import('./pages/RecipesIndex').then(asRoute) },
      { path: 'recipes/:slug', lazy: () => import('./pages/RecipePage').then(asRoute) },
      { path: 'about', lazy: () => import('./pages/About').then(asRoute) },
      { path: 'blog', lazy: () => import('./pages/BlogIndex').then(asRoute) },
      { path: 'blog/:slug', lazy: () => import('./pages/BlogPost').then(asRoute) },
      { path: 'privacy', lazy: () => import('./pages/Privacy').then(asRoute) },
      ...toolSlugs.map(slug => ({
        path: slug,
        lazy: () => import('./pages/ToolPage').then(asRoute),
      })),
      { path: 'pipeline', lazy: () => import('./pages/ToolPage').then(asRoute) },
      { path: '404', lazy: () => import('./pages/NotFound').then(asRoute) },
      { path: '*', lazy: () => import('./pages/NotFound').then(asRoute) },
    ],
  },
]
