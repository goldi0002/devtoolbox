import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { tools } from '../tools/registry'

describe('Tool Catalog & Specification Synchronization', () => {
  const root = path.resolve(__dirname, '../../')
  const registeredSlugs = tools.map((t) => t.slug).sort()

  it('keeps src/tools/registry.ts and src/tools/registry-node.ts in 100% sync', () => {
    const nodeRegistryPath = path.join(root, 'src/tools/registry-node.ts')
    const content = fs.readFileSync(nodeRegistryPath, 'utf8')
    const nodeSlugs = [...content.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)]
      .map((m) => m[1])
      .sort()

    expect(nodeSlugs).toEqual(registeredSlugs)
  })

  it('keeps public/tools.json catalog in 100% sync with registered tools', () => {
    const toolsJsonPath = path.join(root, 'public/tools.json')
    const content = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'))
    const catalogSlugs = content.tools.map((t: { slug: string }) => t.slug).sort()

    expect(content.totalTools).toBe(tools.length)
    expect(catalogSlugs).toEqual(registeredSlugs)
  })

  it('keeps public/sitemap.xml in 100% sync with registered tools', () => {
    const sitemapPath = path.join(root, 'public/sitemap.xml')
    const content = fs.readFileSync(sitemapPath, 'utf8')
    const sitemapSlugs = [...content.matchAll(/https:\/\/toolbox4devs\.com\/([a-z0-9-]+)<\/loc>/g)]
      .map((m) => m[1])
      .filter((slug) => slug !== '' && !['about', 'privacy', 'dashboard', 'tools', 'blog'].includes(slug) && !slug.startsWith('tools/') && !slug.startsWith('blog/'))
      .sort()

    expect(sitemapSlugs).toEqual(registeredSlugs)
  })

  it('keeps public/llms.txt and public/llms-full.txt in 100% sync with registered tools', () => {
    const llmsTxtPath = path.join(root, 'public/llms.txt')
    const llmsTxtContent = fs.readFileSync(llmsTxtPath, 'utf8')
    const llmsTxtSlugs = [...llmsTxtContent.matchAll(/https:\/\/toolbox4devs\.com\/([a-z0-9-]+)/g)]
      .map((m) => m[1])
      .filter((slug) => slug !== '' && !['about', 'privacy', 'dashboard', 'tools', 'blog', 'llms-full'].includes(slug) && !slug.startsWith('tools/') && !slug.startsWith('blog/'))
      .sort()

    expect(llmsTxtSlugs).toEqual(registeredSlugs)

    const llmsFullTxtPath = path.join(root, 'public/llms-full.txt')
    const llmsFullTxtContent = fs.readFileSync(llmsFullTxtPath, 'utf8')
    const llmsFullSlugs = [...llmsFullTxtContent.matchAll(/URL: https:\/\/toolbox4devs\.com\/([a-z0-9-]+)/g)]
      .map((m) => m[1])
      .filter((slug) => slug !== '' && !['about', 'privacy', 'dashboard', 'tools', 'blog'].includes(slug) && !slug.startsWith('tools/') && !slug.startsWith('blog/'))
      .sort()

    expect(llmsFullSlugs).toEqual(registeredSlugs)
  })
})
