import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'
export default defineConfig({
  define: {
    'process.env.VITE_ENVIRONMENT': '"development"',
  },
  plugins: [
    react(),
    sitemap({
      hostname: 'https://toolbox4devs.com',
      dynamicRoutes: [
        '/',
        '/tools',
        '/about',
        '/changelog',
        '/privacy',
        ...getToolCategories().map(c => `/tools/${c.category}`),
        ...getAllAvailableTools().map(t => `/${t.slug}`),
      ],
      generateRobotsTxt: true,
    })
  ],
  optimizeDeps: {
    include: ['react-helmet-async'],
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  build: {
    chunkSizeWarningLimit: 400
  }
})