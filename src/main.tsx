import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './css/index.css'
import './css/global.css'

const PRELOAD_ERROR_RELOAD_KEY = 'vite-preload-error-reload'

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (!isClient || typeof window === 'undefined') return

    window.addEventListener('vite:preloadError', (event) => {
      event.preventDefault()

      if (window.sessionStorage.getItem(PRELOAD_ERROR_RELOAD_KEY) === '1') return

      window.sessionStorage.setItem(PRELOAD_ERROR_RELOAD_KEY, '1')
      window.location.reload()
    })

    window.sessionStorage.removeItem(PRELOAD_ERROR_RELOAD_KEY)
  }
)