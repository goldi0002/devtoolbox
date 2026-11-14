export function useAnalytics() {
  return {
    track: (_event: string, _props?: Record<string, unknown>) => {
      // Zero-tracking policy: telemetry is disabled client-side.
    },
  }
}