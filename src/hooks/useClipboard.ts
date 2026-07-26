import { useState, useCallback } from 'react'
import { getErrorMessage, reportError } from '../utils/errors'

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is unavailable in this browser')
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setError('')
      setTimeout(() => setCopied(false), timeout)
      return true
    } catch (e) {
      reportError('Clipboard write failed', e)
      setCopied(false)
      setError(getErrorMessage(e, 'Copy failed'))
      setTimeout(() => setError(''), timeout)
      return false
    }
  }, [timeout])

  return { copied, error, copy }
}
