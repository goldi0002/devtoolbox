import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import { readStorage, removeStorage, writeStorage } from './lib/storage'
import { reportError } from './utils/errors'
import './css/index.css'
import './css/global.css'

const PRELOAD_ERROR_RELOAD_KEY = 'vite-preload-error-reload'

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (!isClient || typeof window === 'undefined') return

    window.addEventListener('vite:preloadError', (event) => {
      event.preventDefault()
      reportError('Failed to preload a chunk', (event as Event & { payload?: unknown }).payload ?? event)

      // Reload once to pick up a new deployment; give up afterwards so a
      // persistently failing chunk cannot trap the page in a reload loop.
      if (readStorage('sessionStorage', PRELOAD_ERROR_RELOAD_KEY) === '1') return
      if (!writeStorage('sessionStorage', PRELOAD_ERROR_RELOAD_KEY, '1')) return

      window.location.reload()
    })

    // Register Service Worker for 100% offline support and caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
          console.warn('[SW] Registration failed:', err)
        })
      })
    }

    removeStorage('sessionStorage', PRELOAD_ERROR_RELOAD_KEY)
  }
)