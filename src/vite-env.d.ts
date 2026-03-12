interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_SITE_NAME: string
  readonly VITE_VERCEL_URL?: string
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'preview',
  readonly VITE_PUBLIC_POSTHOG_KEY?: string,
  readonly VITE_PUBLIC_POSTHOG_HOST?: string,
  readonly VITE_CONCAT_QUESTIONS_EMAIL?: string,
  readonly VITE_WEB_OWNER_GIT_PROFILE_URL?: string
  readonly VITE_WEB_OWNER_EMAIL_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}