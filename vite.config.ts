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

const ssgRoutes = [...dynamicRoutes, '/404']

const sitemapRoutes = dynamicRoutes.filter(
  (route) => route !== '/' && route !== '/pipeline' && route !== '/dashboard'
)

const sitemapPriority: Record<string, number> = {
  '/': 1.0,
  '/tools': 0.9,
  '/recipes': 0.9,
  '/blog': 0.9,
  '/about': 0.5,
  '/privacy': 0.5,
  '*': 0.8,
}

const sitemapChangefreq: Record<string, string> = {
  '/': 'daily',
  '/tools': 'weekly',
  '/recipes': 'weekly',
  '/blog': 'weekly',
  '/about': 'monthly',
  '/privacy': 'monthly',
  '*': 'weekly',
}

for (const category of getToolCategories()) {
  const catRoute = `/tools/${category.category}`
  sitemapPriority[catRoute] = 0.85
  sitemapChangefreq[catRoute] = 'weekly'
}

for (const slug of recipeSlugs) {
  const recipeRoute = `/recipes/${slug}`
  sitemapPriority[recipeRoute] = 0.75
  sitemapChangefreq[recipeRoute] = 'monthly'
}

for (const slug of blogSlugs) {
  const blogRoute = `/blog/${slug}`
  sitemapPriority[blogRoute] = 0.75
  sitemapChangefreq[blogRoute] = 'monthly'
}

function stripDuplicateHeadTags(html: string): string {
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i)
  if (!headMatch || !headMatch[1].includes('data-rh="true"')) {
    return html
  }

  const cleanedHead = headMatch[1]
    .replace(/\n?\s*<title>[^<]*<\/title>/gi, '')
    .replace(/\n?\s*<meta\s+name="(?:description|keywords)"\s+content="[^"]*"\s*\/?>/gi, '')
    .replace(/\n?\s*<meta\s+property="og:(?:title|description)"\s+content="[^"]*"\s*\/?>/gi, '')

  return html.replace(headMatch[0], `<head>${cleanedHead}</head>`)
}

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
        dynamicRoutes: sitemapRoutes,
        exclude: ['/404', '/pipeline', '/dashboard'],
        priority: sitemapPriority,
        changefreq: sitemapChangefreq,
        generateRobotsTxt: false,
      }),
    ],
    ssgOptions: {
      includedRoutes() {
        return ssgRoutes
      },
      onFinished() {
        const outDir = path.resolve(process.cwd(), 'dist')
        if (!fs.existsSync(outDir)) return

        // Strip static index.html fallback title/meta duplicates when Head (data-rh) already injected route-specific tags
        const cleanHtmlHeads = (dir: string) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              cleanHtmlHeads(fullPath)
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
              const rawHtml = fs.readFileSync(fullPath, 'utf8')
              const cleaned = stripDuplicateHeadTags(rawHtml)
              if (cleaned !== rawHtml) {
                fs.writeFileSync(fullPath, cleaned)
              }
            }
          }
        }

        cleanHtmlHeads(outDir)

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

        // Stamp built service worker cache version so every deployment busts stale asset caches
        const distSwPath = path.join(outDir, 'sw.js')
        if (fs.existsSync(distSwPath)) {
          const swContent = fs.readFileSync(distSwPath, 'utf8')
          const buildVersion = `v1.0.0-${Date.now().toString(36)}`
          fs.writeFileSync(
            distSwPath,
            swContent.replace(/const CACHE_VERSION = ['"][^'"]+['"]/, `const CACHE_VERSION = '${buildVersion}'`)
          )
        }
      },
    },
    build: {
      chunkSizeWarningLimit: 400,
      rollupOptions: {
        output: {
          // Match exact package directories. React must get its own chunk:
          // otherwise Rollup hoists it (and jsx-runtime) into whichever manual
          // chunk first depends on it, and every page then downloads that
          // chunk (e.g. all of CodeMirror) just to get React.
          manualChunks(id) {
            const pkg = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1]
            if (!pkg) return
            if (['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom', '@remix-run/router'].includes(pkg)) {
              return 'vendor-react'
            }
            // CodeMirror core only. Language packs (@codemirror/lang-*, their
            // @lezer parsers) are left to Rollup so each loads on demand; see
            // src/lib/editorLanguage.ts.
            if (
              /^@codemirror\/(view|state|language|commands|autocomplete|search|lint)$/.test(pkg) ||
              /^@lezer\/(common|lr|highlight)$/.test(pkg) ||
              pkg.startsWith('@uiw/') ||
              ['style-mod', 'w3c-keyname', 'crelt'].includes(pkg)
            ) {
              return 'vendor-codemirror'
            }
            // Icons are shared by most pages; one chunk beats dozens of tiny per-icon files.
            if (pkg === 'lucide-react') return 'vendor-icons'
            if (pkg === 'prettier') return 'vendor-prettier'
            if (pkg === 'yaml') return 'vendor-yaml'
            if (pkg === 'diff') return 'vendor-diff'
          },
        },
      },
    },
  }
})
