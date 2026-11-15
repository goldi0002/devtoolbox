import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { categoryLabels, getAllAvailableTools } from '../tools/registry'
import { DEV_RECIPES } from '../data/recipes'
import {
  buildCatalogFiles,
  COUNT_FILES,
  GENERATED_FILES,
  syncToolCount,
} from '../tools/catalog-files'

const root = path.resolve(__dirname, '../../')
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8')
const tools = getAllAvailableTools()
const outputs = buildCatalogFiles({ tools, categoryLabels, recipes: DEV_RECIPES })
const STALE = 'is out of date with the tool registry — run `npm run catalog` and commit the result'

describe('Tool catalog files are generated from the registry', () => {
  it.each(GENERATED_FILES)('%s is up to date', file => {
    expect(read(file), `${file} ${STALE}`).toBe(outputs[file])
  })

  it.each(COUNT_FILES)('%s shows the current tool count', file => {
    const content = read(file)
    expect(content, `${file} ${STALE}`).toBe(syncToolCount(file, content, tools.length))
  })

  it('lists every tool exactly once in each catalog', () => {
    const slugs = tools.map(t => t.slug).sort()
    const json = JSON.parse(outputs['public/tools.json'])
    expect(json.totalTools).toBe(tools.length)
    expect(json.tools.map((t: { slug: string }) => t.slug).sort()).toEqual(slugs)

    const llmsSlugs = [...outputs['public/llms.txt'].matchAll(/\]\(https:\/\/toolbox4devs\.com\/([a-z0-9-]+)\)/g)]
      .map(m => m[1])
      .filter(s => s !== 'recipes')
      .sort()
    expect(llmsSlugs).toEqual(slugs)

    const fullSlugs = [...outputs['public/llms-full.txt'].matchAll(/- URL: https:\/\/toolbox4devs\.com\/([a-z0-9-]+)/g)]
      .map(m => m[1])
      .sort()
    expect(fullSlugs).toEqual(slugs)

    const nodeSlugs = [...outputs['src/tools/registry-node.ts'].matchAll(/slug: '([a-z0-9-]+)'/g)].map(m => m[1]).sort()
    expect(nodeSlugs).toEqual(slugs)
  })

  it('syncToolCount rewrites counts and rejects files missing the phrase', () => {
    expect(syncToolCount('public/opensearch.xml', '<d>Search 12+ fast tools</d>', 80)).toBe('<d>Search 80+ fast tools</d>')
    expect(() => syncToolCount('public/opensearch.xml', '<d>no count here</d>', 80)).toThrow(/tool-count phrase/)
  })
})
