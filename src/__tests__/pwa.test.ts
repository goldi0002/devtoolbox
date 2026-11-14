import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Progressive Web App (PWA) Implementation', () => {
  it('validates web app manifest structure and compliance', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json')
    expect(fs.existsSync(manifestPath)).toBe(true)

    const raw = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(raw)

    expect(manifest.name).toContain('ToolBox4Devs')
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBe('/?source=pwa')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0f0f11')
    expect(manifest.background_color).toBe('#0f0f11')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(6)

    // Check maskable icon purpose and ensure maskable icons use dedicated padded assets
    const anyIcons = new Set(
      manifest.icons
        .filter((i: { purpose?: string }) => i.purpose === 'any')
        .map((i: { src: string }) => i.src)
    )
    const maskableIcons = manifest.icons.filter((i: { purpose?: string }) => i.purpose === 'maskable')
    expect(maskableIcons.length).toBeGreaterThan(0)
    for (const icon of maskableIcons) {
      expect(anyIcons.has(icon.src)).toBe(false)
    }

    // Verify all declared icon files exist on disk in public/
    for (const icon of manifest.icons as Array<{ src: string }>) {
      const iconPath = path.resolve(process.cwd(), 'public', icon.src.replace(/^\//, ''))
      expect(fs.existsSync(iconPath)).toBe(true)
    }

    // Check shortcuts
    expect(Array.isArray(manifest.shortcuts)).toBe(true)
    expect(manifest.shortcuts.length).toBeGreaterThan(0)
  })

  it('validates service worker file existence and caching strategy', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js')
    expect(fs.existsSync(swPath)).toBe(true)

    const swContent = fs.readFileSync(swPath, 'utf-8')
    expect(swContent).toContain('STATIC_CACHE')
    expect(swContent).toContain('RUNTIME_CACHE')
    expect(swContent).toContain('FONTS_CACHE')
    expect(swContent).toContain('PRECACHE_ASSETS')
    expect(swContent).toContain('skipWaiting')
    expect(swContent).toContain('clients.claim')
    expect(swContent).toContain('SKIP_WAITING')
    expect(swContent).toContain('CLEAR_CACHE')

    // Ensure every non-root precached asset exists in public/ (or root index.html)
    const precacheMatch = swContent.match(/const PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\]/)
    expect(precacheMatch).not.toBeNull()
    const assets = [...(precacheMatch?.[1] ?? '').matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
    for (const asset of assets) {
      if (asset === '/') continue
      const publicCandidate = path.resolve(process.cwd(), 'public', asset.replace(/^\//, ''))
      const rootCandidate = path.resolve(process.cwd(), asset.replace(/^\//, ''))
      expect(fs.existsSync(publicCandidate) || fs.existsSync(rootCandidate)).toBe(true)
    }
  })

  it('validates index.html PWA tags and meta configuration', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html')
    const indexContent = fs.readFileSync(indexPath, 'utf-8')

    expect(indexContent).toContain('rel="manifest"')
    expect(indexContent).toContain('name="mobile-web-app-capable"')
    expect(indexContent).toContain('name="apple-mobile-web-app-capable"')
    expect(indexContent).toContain('name="apple-mobile-web-app-status-bar-style"')
    expect(indexContent).toContain('name="apple-mobile-web-app-title"')
    expect(indexContent).toContain('name="theme-color"')
  })
})
