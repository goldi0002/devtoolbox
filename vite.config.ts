import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'

const dynamicRoutes = [
  '/',
  '/dashboard',
  '/tools',
  '/about',
  '/privacy',
  ...getToolCategories().map((category) => `/tools/${category.category}`),
  ...getAllAvailableTools().map((tool) => `/${tool.slug}`),
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const environment = env.VITE_ENVIRONMENT ?? mode
  let hostname = env.VITE_BASE_URL || 'https://toolbox4devs.com'
  if (!hostname.startsWith('http://') && !hostname.startsWith('https://')) {
    hostname = 'https://toolbox4devs.com'
  }

  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
    define: {
      'process.env.VITE_ENVIRONMENT': JSON.stringify(environment),
    },
    plugins: [
      react(),
      sitemap({
        hostname,
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
                return 'vendor-react'
              }
              if (id.includes('@codemirror') || id.includes('@uiw/react-codemirror')) {
                return 'vendor-codemirror'
              }
              if (id.includes('prettier')) {
                return 'vendor-prettier'
              }
              if (id.includes('yaml')) {
                return 'vendor-yaml'
              }
              if (id.includes('diff')) {
                return 'vendor-diff'
              }
            }
          },
        },
      },
    },
  }
})
