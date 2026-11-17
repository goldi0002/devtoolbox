import { describe, expect, it } from 'vitest'
import { minifyCss } from '../utils/cssMinify'
import { CSS_JS_MINIFIER_META } from '../tools/meta/css-js-minifier'

describe('minifyCss', () => {
  it('removes whitespace and shortens colours', async () => {
    const outcome = await minifyCss('.a {\n  color: #ffffff;\n}\n')
    expect(outcome).toEqual({ ok: true, code: '.a{color:#fff}' })
  })

  it('removes comments', async () => {
    const outcome = await minifyCss('/* header */\n.a { margin: 0 }')
    if (!outcome.ok) throw new Error('expected valid CSS')
    expect(outcome.code).not.toContain('header')
    expect(outcome.code).toContain('.a')
  })

  it('returns an empty string for empty input', async () => {
    expect(await minifyCss('')).toEqual({ ok: true, code: '' })
  })
})

describe('CSS / JS Minifier guide example', () => {
  it('matches what the minifier produces', async () => {
    const example = CSS_JS_MINIFIER_META.guide?.example
    expect(example).toBeDefined()
    const outcome = await minifyCss(example?.input ?? '')
    if (!outcome.ok) throw new Error('guide example must be valid CSS')
    expect(outcome.code).toBe(example?.output)
  })
})
