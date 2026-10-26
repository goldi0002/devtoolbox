import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'
import { blogSlugs } from './src/data/blog'
import { recipeSlugs } from './src/data/recipes'

const dynamicRoutes = [
  '/',
  '/dashboard',
  '/tools',
  '/recipes',
  ...recipeSlugs.map((slug) => `/recipes/${slug}`),
  '/pipeline',
  '/about',
  '/privacy',
  '/blog',
  ...blogSlugs.map((slug) => `/blog/${slug}`),
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
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        'papaparse',
        'diff',
        'yaml',
        '@uiw/react-codemirror',
      ],
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
      onFinished() {
        const outDir = path.resolve(process.cwd(), 'dist')
        if (!fs.existsSync(outDir)) return

        // Recursively find all generated HTML files (except index.html and 404.html)
        // and ensure both `path.html` and `path/index.html` exist so reloads on any host never 404
        const ensureDualIndexFiles = (dir: string) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              ensureDualIndexFiles(fullPath)
            } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html' && entry.name !== '404.html') {
              const baseName = entry.name.slice(0, -'.html'.length)
              const nestedDir = path.join(dir, baseName)
              const nestedIndex = path.join(nestedDir, 'index.html')

              if (!fs.existsSync(nestedDir)) {
                fs.mkdirSync(nestedDir, { recursive: true })
              }
              if (!fs.existsSync(nestedIndex)) {
                fs.copyFileSync(fullPath, nestedIndex)
              }
            }
          }
        }

        ensureDualIndexFiles(outDir)
      },
    },
    build: {
      chunkSizeWarningLimit: 400,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
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
