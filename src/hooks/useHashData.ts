import { useEffect, useRef } from 'react'
import { readHashData } from '../lib/share'

export function useHashData<T = unknown>(onData: (value: T) => void) {
  const onDataRef = useRef(onData)

  useEffect(() => {
    onDataRef.current = onData
  }, [onData])

  useEffect(() => {
    const data = readHashData<T>()
    if (data !== null) {
      onDataRef.current(data)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])
}
