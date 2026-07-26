import { useEffect, useRef } from 'react'
import { readHashData } from '../lib/share'
import { reportError } from '../utils/errors'

export function useHashData<T = unknown>(onData: (value: T) => void) {
  const onDataRef = useRef(onData)

  useEffect(() => {
    onDataRef.current = onData
  }, [onData])

  useEffect(() => {
    let data: T | null
    try {
      data = readHashData<T>()
    } catch (error) {
      reportError('Failed to read shared data from the URL', error)
      return
    }
    if (data === null) return

    try {
      onDataRef.current(data)
    } catch (error) {
      // A malformed share link must not take the tool down with it.
      reportError('Failed to apply shared data', error)
    } finally {
      // Drop the hash either way so a reload starts from a clean state.
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])
}
