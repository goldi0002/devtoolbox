import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FaqAccordion from '../components/ui/FaqAccordion'

const items = [
  { question: 'Is my data private?', answer: 'Everything runs in your browser.' },
  { question: 'Does it work offline?', answer: 'Yes, once the page has loaded.' },
]

function render() {
  const html = renderToStaticMarkup(createElement(FaqAccordion, { items }))
  const doc = new DOMParserShim(html)
  return { html, doc }
}

// Minimal attribute extraction so the test runs in vitest's node environment.
class DOMParserShim {
  constructor(private html: string) {}
  all(tag: string): Record<string, string>[] {
    const re = new RegExp(`<${tag}\\b([^>]*)>`, 'g')
    return [...this.html.matchAll(re)].map((m) => {
      const attrs: Record<string, string> = {}
      for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? ''
      return attrs
    })
  }
}

describe('FaqAccordion', () => {
  it('renders each question as a collapsed button controlling its answer region', () => {
    const { doc } = render()
    const buttons = doc.all('button')
    const regions = doc.all('div').filter((a) => a.role === 'region')

    expect(buttons).toHaveLength(2)
    expect(regions).toHaveLength(2)
    buttons.forEach((button, i) => {
      expect(button.type).toBe('button')
      expect(button['aria-expanded']).toBe('false')
      expect(button['aria-controls']).toBe(regions[i].id)
      expect(regions[i]['aria-labelledby']).toBe(button.id)
      expect('hidden' in regions[i]).toBe(true)
    })
  })

  it('gives every question and answer a unique id', () => {
    const { doc } = render()
    const ids = [...doc.all('button'), ...doc.all('div')].map((a) => a.id).filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps collapsed answers in the markup for search engines', () => {
    const { html } = render()
    for (const { question, answer } of items) {
      expect(html).toContain(question)
      expect(html).toContain(answer)
    }
  })

  it('hides the decorative arrow from assistive technology', () => {
    const { doc } = render()
    const spans = doc.all('span').filter((a) => a['aria-hidden'] === 'true')
    expect(spans).toHaveLength(items.length)
  })
})
