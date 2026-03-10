import { usePostHog } from "posthog-js/react";

export function useAnalytics() {
  const posthog = usePostHog();
  return {
    track: (event: string, props?: Record<string, unknown>) => {
      posthog?.capture(event, props)
    }
  }
}