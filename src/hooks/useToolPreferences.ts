import { useCallback, useEffect, useMemo, useState } from 'react'

const FAVORITES_KEY = 'toolbox4devs:favorites'
const RECENTS_KEY = 'toolbox4devs:recent-tools'
const MAX_RECENTS = 6

function readList(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeList(key: string, value: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('toolbox4devs:preferences-changed'))
}

export function useToolPreferences() {
  const [favorites, setFavorites] = useState<string[]>(() => readList(FAVORITES_KEY))
  const [recentTools, setRecentTools] = useState<string[]>(() => readList(RECENTS_KEY))

  useEffect(() => {
    const sync = () => {
      setFavorites(readList(FAVORITES_KEY))
      setRecentTools(readList(RECENTS_KEY))
    }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('toolbox4devs:preferences-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('toolbox4devs:preferences-changed', sync)
    }
  }, [])

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])

  const toggleFavorite = useCallback((slug: string) => {
    const next = favoriteSet.has(slug)
      ? favorites.filter(item => item !== slug)
      : [slug, ...favorites]
    setFavorites(next)
    writeList(FAVORITES_KEY, next)
  }, [favoriteSet, favorites])

  const recordRecentTool = useCallback((slug: string) => {
    const current = readList(RECENTS_KEY)
    const next = [slug, ...current.filter(item => item !== slug)].slice(0, MAX_RECENTS)
    setRecentTools(next)
    writeList(RECENTS_KEY, next)
  }, [])

  return { favorites, favoriteSet, recentTools, toggleFavorite, recordRecentTool }
}
