#!/usr/bin/env node
/**
 * Regenerates the tool catalog files from the registry.
 *
 *   npm run catalog          write the files
 *   npm run catalog:check    exit 1 if any file is out of date (no writes)
 *
 * What gets generated, and why, is documented in src/tools/catalog-files.ts.
 * The registry is TypeScript that imports React, so it is loaded through
 * Vite's SSR module loader rather than plain Node.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')

const vite = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
})

let changed
try {
  const registry = await vite.ssrLoadModule('/src/tools/registry.ts')
  const { DEV_RECIPES } = await vite.ssrLoadModule('/src/data/recipes.ts')
  const catalog = await vite.ssrLoadModule('/src/tools/catalog-files.ts')

  const tools = registry.getAllAvailableTools()
  const outputs = catalog.buildCatalogFiles({
    tools,
    categoryLabels: registry.categoryLabels,
    recipes: DEV_RECIPES,
  })
  for (const file of catalog.COUNT_FILES) {
    const current = fs.readFileSync(path.join(root, file), 'utf8')
    outputs[file] = catalog.syncToolCount(file, current, tools.length)
  }

  changed = Object.entries(outputs).filter(([file, content]) => {
    const abs = path.join(root, file)
    return !fs.existsSync(abs) || fs.readFileSync(abs, 'utf8') !== content
  })

  if (!check) {
    for (const [file, content] of changed) fs.writeFileSync(path.join(root, file), content)
  }
  console.log(
    changed.length === 0
      ? `Catalog up to date (${tools.length} tools).`
      : `${check ? 'Out of date' : 'Updated'} (${tools.length} tools): ${changed.map(([f]) => f).join(', ')}`
  )
} finally {
  await vite.close()
}

if (check && changed.length > 0) {
  console.error('Run `npm run catalog` and commit the result.')
  process.exit(1)
}
