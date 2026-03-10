interface ImportMetaEnv {
    readonly VITE_BASE_URL: string
    readonly VITE_SITE_NAME: string
    readonly VITE_VERCEL_URL?: string
    readonly VITE_ENVIRONMENT: 'development' | 'production' | 'test'
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }