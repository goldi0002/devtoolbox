import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'

const dynamicRoutes = [
  '/',
  '/tools',
  '/about',
  '/changelog',
  '/privacy',
  ...getToolCategories().map((category) => `/tools/${category.category}`),
  ...getAllAvailableTools().map((tool) => `/${tool.slug}`),
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const environment = env.VITE_ENVIRONMENT ?? mode

  return {
    define: {
      'process.env.VITE_ENVIRONMENT': JSON.stringify(environment),
    },
    plugins: [
      react(),
      sitemap({
        hostname: env.VITE_BASE_URL || 'https://toolbox4devs.com',
        dynamicRoutes,
        generateRobotsTxt: true,
      }),
    ],
    ssgOptions: {
      includedRoutes() {
        return dynamicRoutes
      },
    },
    build: {
      chunkSizeWarningLimit: 400,
    },
  }
})
