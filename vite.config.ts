import { defineConfig } from 'vite'  //  keep original vite import
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'

const dynamicRoutes = [
  '/',
  '/tools',
  '/about',
  '/changelog',
  '/privacy',
  ...getToolCategories().map(c => `/tools/${c.category}`),
  ...getAllAvailableTools().map(t => `/${t.slug}`),
]

export default defineConfig({
  define: {
    'process.env.VITE_ENVIRONMENT': '"development"',
  },
  plugins: [
    react(),
    sitemap({
      hostname: 'https://toolbox4devs.com',
      dynamicRoutes,
      generateRobotsTxt: true,
    })
  ],
  ssgOptions: {
    includedRoutes() {
      return dynamicRoutes
    },
  },
  build: {
    chunkSizeWarningLimit: 400
  }
} as any) 