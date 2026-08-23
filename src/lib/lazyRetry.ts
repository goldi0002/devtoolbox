import React from 'react'

/**
 * Wraps a React.lazy() import with automatic retry logic.
 *
 * When a chunk fails to load (network blip, stale cache after deploy, etc.),
 * the factory is retried up to `retries` times with an exponential backoff
 * before the rejection propagates to the ErrorBoundary.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 800,
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory()
      } catch (err) {
        lastError = err
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
        }
      }
    }
    throw lastError
  })
}
