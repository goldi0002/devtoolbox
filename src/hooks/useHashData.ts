import { useEffect } from 'react'
import { readHashData } from '../lib/share'

export function useHashData<T = unknown>(onData: (value: T) => void) {
  useEffect(() => {
    const data = readHashData<T>()
    if (data !== null) {
      onData(data)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])
}