import type { RouteRecord } from 'vite-react-ssg'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ToolsIndex from './pages/ToolsIndex'
import About from './pages/About'
import ToolPage from './pages/ToolPage'
import NotFound from './pages/NotFound'

const toolSlugs = [
  'json-formatter',
  'json-model',
  'uuid',
  'base64',
  'text-diff',
  'jwt'
]

function Layout({ children }: { children: React.ReactNode }) {
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
]

export default function App() {
  return null
}