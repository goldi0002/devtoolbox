/** Extracts a human-readable message from an unknown thrown value. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
    if (error instanceof Error && error.message) return error.message
    if (typeof error === 'string' && error.trim()) return error
    return fallback
}

/**
 * Logs a recovered error so it stays visible in the console instead of being
 * swallowed. Use only where the UI can genuinely continue without the result.
 */
export function reportError(context: string, error: unknown): void {
    console.error(`[toolbox4devs] ${context}:`, error)
}
