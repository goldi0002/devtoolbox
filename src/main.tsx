import { ViteReactSSG } from 'vite-react-ssg'
import { initAnalytics } from './lib/analytics'
import { routes } from './App'
import './index.css'
initAnalytics()
export const createRoot = ViteReactSSG(
  { routes },
  () => {
    // global setup
  }
)