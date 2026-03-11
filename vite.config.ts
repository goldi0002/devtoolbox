import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'process.env.VITE_ENVIRONMENT': '"development"',
  },
  plugins: [
    react()
  ],
  optimizeDeps: {
    include: ['react-helmet-async'],
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  build:{
    chunkSizeWarningLimit:400
  }
})