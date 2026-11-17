import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import OutputPanel from '../components/ui/OutputPanel'
import JsonTreeView from '../components/tools/json-tools/JsonTreeView'

function buttons(html: string): Record<string, string>[] {
  return [...html.matchAll(/<button\b([^>]*)>/g)].map((m) => {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? ''
    return attrs
  })
}

describe('OutputPanel icon-only buttons', () => {
  const html = renderToStaticMarkup(
    createElement(
      StaticRouter,
      { location: '/' },
      createElement(OutputPanel, { value: 'hello world' }),
    ),
  )
  const all = buttons(html)

  it('labels the word-wrap toggle with its current action', () => {
    // wordWrap defaults to true, so the next action is "Disable word wrap"
    const wrap = all.find((b) => b['aria-label'] === 'Disable word wrap')
    expect(wrap).toBeDefined()
    expect(wrap!.title).toBe('Disable Word Wrap')
  })

  it('labels the download button', () => {
    const download = all.find((b) => b['aria-label'] === 'Download output')
    expect(download).toBeDefined()
    expect(download!.title).toBe('Download Output')
  })
})

describe('JsonTreeView expand toggles', () => {
  const html = renderToStaticMarkup(
    createElement(JsonTreeView, { data: { user: { name: 'Ada', tags: ['a'] } }, maxInitialDepth: 1 }),
  )
  const toggles = buttons(html).filter((b) => /^(Expand|Collapse) /.test(b['aria-label'] ?? ''))

  it('names each toggle with its node and whether it is expanded', () => {
    expect(toggles.length).toBeGreaterThan(0)
    for (const t of toggles) {
      expect(t['aria-expanded']).toMatch(/^(true|false)$/)
      const expanded = t['aria-expanded'] === 'true'
      expect(t['aria-label'].startsWith(expanded ? 'Collapse ' : 'Expand ')).toBe(true)
    }
  })

  it('includes the node name so repeated toggles are distinguishable', () => {
    expect(toggles.some((t) => t['aria-label'].includes('user'))).toBe(true)
  })
})
