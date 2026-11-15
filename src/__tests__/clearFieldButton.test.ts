import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TextAreaField from '../components/ui/TextAreaField'
import TextInputField from '../components/ui/TextInputField'

const noop = () => {}

function buttons(html: string): Record<string, string>[] {
  return [...html.matchAll(/<button\b([^>]*)>/g)].map((m) => {
    const attrs: Record<string, string> = {}
    for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? ''
    return attrs
  })
}

const fields = [
  { name: 'TextAreaField', component: TextAreaField, tag: 'textarea' },
  { name: 'TextInputField', component: TextInputField, tag: 'input' },
] as const

describe.each(fields)('$name clear button', ({ component, tag }) => {
  const render = (props: Record<string, unknown>) =>
    renderToStaticMarkup(createElement(component as any, { label: 'Input Text', onChange: noop, ...props }))

  it('is not rendered while the field is empty', () => {
    expect(buttons(render({ value: '' }))).toHaveLength(0)
  })

  it('is a native, labelled button once the field has text', () => {
    const found = buttons(render({ value: 'hello' }))
    expect(found).toHaveLength(1)
    expect(found[0].type).toBe('button')
    expect(found[0]['aria-label']).toBe('Clear Input Text')
  })

  it('comes after the field so it follows it in the tab order', () => {
    const html = render({ value: 'hello' })
    expect(html.indexOf('<button')).toBeGreaterThan(html.indexOf(`<${tag}`))
  })

  it('can be turned off with showClearButton={false}', () => {
    expect(buttons(render({ value: 'hello', showClearButton: false }))).toHaveLength(0)
  })
})

describe('TextInputField clear button', () => {
  it.each(['disabled', 'readOnly'])('is hidden when the input is %s', (flag) => {
    const html = renderToStaticMarkup(
      createElement(TextInputField, { label: 'Input Text', value: 'hello', onChange: noop, [flag]: true }),
    )
    expect(buttons(html)).toHaveLength(0)
  })
})
