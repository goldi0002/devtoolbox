import { describe, expect, it } from 'vitest'
import { minifyJavaScript } from '../utils/jsMinify'

const OFF = { mangle: false, dropConsole: false }

describe('minifyJavaScript', () => {
  it('removes whitespace and comments', async () => {
    const outcome = await minifyJavaScript('// note\nconst a = 1;\n', OFF)
    expect(outcome.ok).toBe(true)
    if (!outcome.ok) return
    expect(outcome.code).toContain('const a=1')
    expect(outcome.code).not.toContain('note')
  })

  it('shortens local names only when mangle is on', async () => {
    const source = 'function double(alphaValue) { return alphaValue * 2 }\nconsole.log(double(4))'
    const kept = await minifyJavaScript(source, OFF)
    const mangled = await minifyJavaScript(source, { mangle: true, dropConsole: false })
    if (!kept.ok || !mangled.ok) throw new Error('expected valid JavaScript')
    expect(kept.code).toContain('alphaValue')
    expect(mangled.code).not.toContain('alphaValue')
  })

  it('removes console calls only when dropConsole is on', async () => {
    const source = 'console.log("hi");\nlet n = 2;'
    const kept = await minifyJavaScript(source, OFF)
    const dropped = await minifyJavaScript(source, { mangle: false, dropConsole: true })
    if (!kept.ok || !dropped.ok) throw new Error('expected valid JavaScript')
    expect(kept.code).toContain('console.log')
    expect(dropped.code).not.toContain('console')
    expect(dropped.code).toContain('2')
  })

  it('reports a syntax error with its line', async () => {
    const outcome = await minifyJavaScript('const a = 1;\nconst b = ;', OFF)
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.line).toBe(2)
    expect(outcome.error.message.length).toBeGreaterThan(0)
  })

  it('returns an empty string for empty input', async () => {
    const outcome = await minifyJavaScript('', OFF)
    expect(outcome).toEqual({ ok: true, code: '' })
  })
})
