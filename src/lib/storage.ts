import { reportError } from '../utils/errors'

type WebStorageKind = 'localStorage' | 'sessionStorage'

function getStorage(kind: WebStorageKind): Storage | null {
    if (typeof window === 'undefined') return null
    try {
        return window[kind]
    } catch (error) {
        // Access itself throws when storage is blocked by browser settings.
        reportError(`${kind} is unavailable`, error)
        return null
    }
}

export function readStorage(kind: WebStorageKind, key: string): string | null {
    const storage = getStorage(kind)
    if (!storage) return null
    try {
        return storage.getItem(key)
    } catch (error) {
        reportError(`Failed to read "${key}" from ${kind}`, error)
        return null
    }
}

export function writeStorage(kind: WebStorageKind, key: string, value: string): boolean {
    const storage = getStorage(kind)
    if (!storage) return false
    try {
        storage.setItem(key, value)
        return true
    } catch (error) {
        // Quota exceeded, private mode, or storage disabled.
        reportError(`Failed to write "${key}" to ${kind}`, error)
        return false
    }
}

export function removeStorage(kind: WebStorageKind, key: string): void {
    const storage = getStorage(kind)
    if (!storage) return
    try {
        storage.removeItem(key)
    } catch (error) {
        reportError(`Failed to remove "${key}" from ${kind}`, error)
    }
}
