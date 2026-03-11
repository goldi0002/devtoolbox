import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'dist/stats.html' })
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