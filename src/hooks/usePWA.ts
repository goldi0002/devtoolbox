import { useState, useEffect, useCallback } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface CacheInfo {
  keys: string[]
  totalEntries: number
  usageFormatted: string
  quotaFormatted: string
  percentUsed: number
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null)
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false)

  // ── Register Service Worker & Install Event ─────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Online / Offline status
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 2. Detect Standalone / PWA Mode
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error - navigator.standalone is iOS Safari specific
        navigator.standalone === true ||
        document.referrer.includes('android-app://')
      setIsInstalled(isStandalone)
    }
    checkInstalled()

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkInstalled)

    // 3. BeforeInstallPrompt Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 4. App Installed Event
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    // 5. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Check if there's already a waiting worker
          if (registration.waiting) {
            setWaitingWorker(registration.waiting)
            setIsUpdateAvailable(true)
          }

          // Listen for new worker installed
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker)
                  setIsUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration error:', err)
        })

      // Reload when new service worker takes control
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', checkInstalled)
    }
  }, [])

  // ── Refresh Cache Stats ──────────────────────────────────────────────────────
  const refreshCacheInfo = useCallback(async () => {
    if (typeof window === 'undefined' || !('caches' in window)) return

    try {
      const keys = await caches.keys()
      let totalEntries = 0
      for (const key of keys) {
        const cache = await caches.open(key)
        const entries = await cache.keys()
        totalEntries += entries.length
      }

      let usageFormatted = '0 B'
      let quotaFormatted = '0 B'
      let percentUsed = 0

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate()
        if (estimate.usage !== undefined) {
          usageFormatted = formatBytes(estimate.usage)
        }
        if (estimate.quota !== undefined) {
          quotaFormatted = formatBytes(estimate.quota)
        }
        if (estimate.usage && estimate.quota) {
          percentUsed = Math.min(100, Math.round((estimate.usage / estimate.quota) * 100))
        }
      }

      setCacheInfo({
        keys,
        totalEntries,
        usageFormatted,
        quotaFormatted,
        percentUsed,
      })
    } catch (err) {
      console.warn('[PWA] Failed to calculate cache stats:', err)
    }
  }, [])

  // Initial stats fetch
  useEffect(() => {
    refreshCacheInfo()
  }, [refreshCacheInfo])

  // ── Actions ──────────────────────────────────────────────────────────────────
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null)
        setIsInstalled(true)
        return true
      }
      return false
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err)
      return false
    }
  }, [installPrompt])

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }, [waitingWorker])

  const clearAllCache = useCallback(async () => {
    setIsClearingCache(true)
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }
      await refreshCacheInfo()
      return true
    } catch (err) {
      console.warn('[PWA] Error clearing cache:', err)
      return false
    } finally {
      setIsClearingCache(false)
    }
  }, [refreshCacheInfo])

  return {
    isOnline,
    isInstalled,
    isInstallable: !!installPrompt,
    promptInstall,
    isUpdateAvailable,
    applyUpdate,
    cacheInfo,
    refreshCacheInfo,
    clearAllCache,
    isClearingCache,
  }
}
