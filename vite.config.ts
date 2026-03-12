import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { getAllAvailableTools, getToolCategories } from './src/tools/registry-node'
import { VitePWA } from 'vite-plugin-pwa'
VitePWA({
  registerType:  'autoUpdate',
  injectRegister: null,
  selfDestroying: true,
  workbox: {
    globPatterns: [],    // ← remove the patterns, keep consistent
  },
  manifest: {
    name:             'ToolBox4Devs',
    short_name:       'TB4Devs',
    description:      'A privacy-first collection of browser-based utilities for developers.',
    theme_color:      '#0f0f11',
    background_color: '#0f0f11',
    display:          'standalone',
    scope:            '/',
    start_url:        '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcuts: [
      { name: 'JSON Formatter', url: '/json-formatter' },
      { name: 'JWT Decoder',    url: '/jwt-decoder'    },
      { name: 'UUID Generator', url: '/uuid'           },
      { name: 'All Tools',      url: '/tools'          },
    ],
  },
})
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