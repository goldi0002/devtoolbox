// ToolBox4Devs — Service Worker
// 100% Offline Support & Intelligent Multi-Tier Caching

const CACHE_VERSION = 'v1.0.0'
const STATIC_CACHE = `tb4devs-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `tb4devs-runtime-${CACHE_VERSION}`
const FONTS_CACHE = `tb4devs-fonts-${CACHE_VERSION}`
const IMAGES_CACHE = `tb4devs-images-${CACHE_VERSION}`

const ALL_CACHES = [STATIC_CACHE, RUNTIME_CACHE, FONTS_CACHE, IMAGES_CACHE]

// Core app shell assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/tools.json',
  '/images/android-192.png',
  '/images/pwa-512.png',
  '/images/apple-touch-180.png',
  '/images/favicon-32.png',
  '/images/favicon-16.png',
  '/images/favicon.svg'
]

// ── Install Event: Precache App Shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        // Automatically skip waiting for seamless activation
        return self.skipWaiting()
      })
      .catch((error) => {
        console.warn('[SW] Precache failed during install:', error)
      })
  )
})

// ── Activate Event: Clean up outdated caches ───────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('tb4devs-') && !ALL_CACHES.includes(cacheName))
            .map((cacheName) => {
              console.log('[SW] Purging old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// ── Fetch Event: Multi-Tier Caching Strategies ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and non-http(s) protocols
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return
  }

  // 1. Google Fonts Caching (Cache First with 1-year max age)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) return cachedResponse

        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        } catch (err) {
          return cachedResponse || new Response('', { status: 408, statusText: 'Font fetch timeout' })
        }
      })
    )
    return
  }

  // 2. Static Images & Icons (Cache First with Network Fallback)
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.jpg')
  ) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached

        try {
          const fresh = await fetch(request)
          if (fresh && fresh.status === 200) {
            cache.put(request, fresh.clone())
          }
          return fresh
        } catch (err) {
          // If offline and image isn't cached, return fallback if available
          return cached || new Response('', { status: 404, statusText: 'Offline image not found' })
        }
      })
    )
    return
  }

  // 3. Navigation Requests / HTML Pages (Network First with Cache Fallback for SSG routes & offline)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network first for latest content
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE)
            cache.put(request, networkResponse.clone())
            return networkResponse
          }
          return networkResponse
        } catch (error) {
          // If offline or network error, attempt to match request in cache
          const cachedPage = await caches.match(request)
          if (cachedPage) {
            return cachedPage
          }

          // Fallback to static root shell / index.html for SPA/SSG client routing
          const cachedShell = (await caches.match('/index.html')) || (await caches.match('/'))
          if (cachedShell) {
            return cachedShell
          }

          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Offline — ToolBox4Devs</title>
              <style>
                body { background: #0f0f11; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .card { background: #18181b; border: 1px solid #27272a; padding: 32px; border-radius: 12px; max-width: 480px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
                h1 { font-size: 20px; margin: 0 0 12px 0; color: #e4e4e7; }
                p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin: 0 0 20px 0; }
                button { background: #3b82f6; color: #fff; border: none; border-radius: 6px; padding: 10px 20px; font-weight: 500; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ ToolBox4Devs (Offline Ready)</h1>
                <p>You appear to be offline. Reconnecting will sync your tool suites automatically, but all previously opened utilities are fully functional offline.</p>
                <button onclick="window.location.reload()">Retry Connection</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          )
        }
      })()
    )
    return
  }

  // 4. JavaScript Chunks, CSS, and Assets (Stale-While-Revalidate)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker' ||
    url.pathname.includes('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/tools.json'
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request)

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch((err) => {
            // Network fetch failed, silence error if we already served cache
            return cachedResponse
          })

        // Return cached immediately if present, otherwise await network fetch
        return cachedResponse || fetchPromise
      })
    )
    return
  }

  // 5. Default Fallback Strategy: Cache First, Network Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
        }
        return res
      }).catch(() => {
        return new Response('', { status: 408, statusText: 'Request timed out or offline' })
      })
    })
  )
})

// ── Message Event: Controller Communication ──────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim()
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)))
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true })
      }
    })
  }

  if (event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then(async (keys) => {
      let totalEntries = 0
      for (const key of keys) {
        const cache = await caches.open(key)
        const items = await cache.keys()
        totalEntries += items.length
      }
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ keys, totalEntries, version: CACHE_VERSION })
      }
    })
  }
})
