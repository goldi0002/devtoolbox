import { describe, it, expect } from 'vitest'
import { generateEventCodeSnippets, type KeyInfo } from '../utils/keyboardEvents'

const BASE: KeyInfo = {
  key: 'Enter',
  code: 'Enter',
  keyCode: 13,
  which: 13,
  location: 0,
  locationName: 'Standard',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  repeat: false,
  char: '',
}

// Matches a bare `e.` identifier (not `event.`, `.e.` property access, or words ending in e).
const STRAY_E = /(^|[^\w.])e\.\w/

describe('generateEventCodeSnippets', () => {
  it('never references a bare `e.` identifier in any snippet with every modifier held', () => {
    const snippets = generateEventCodeSnippets({
      ...BASE,
      ctrlKey: true,
      shiftKey: true,
      altKey: true,
      metaKey: true,
    })
    for (const [name, code] of Object.entries(snippets)) {
      expect(STRAY_E.test(code), `${name} snippet contains a stray e. reference`).toBe(false)
    }
  })

  it('never references a bare `e.` identifier for a single modifier', () => {
    const snippets = generateEventCodeSnippets({ ...BASE, ctrlKey: true })
    for (const [name, code] of Object.entries(snippets)) {
      expect(STRAY_E.test(code), `${name} snippet contains a stray e. reference`).toBe(false)
    }
  })

  it('uses event.* for modifier checks in the JavaScript snippet', () => {
    const { javascript } = generateEventCodeSnippets({ ...BASE, code: 'Enter', ctrlKey: true })
    expect(javascript).toContain("if (event.ctrlKey && event.code === 'Enter')")
    expect(javascript).toContain('(event) =>')
  })

  it('uses event.* for modifier checks in the React snippet', () => {
    const { react } = generateEventCodeSnippets({ ...BASE, code: 'Enter', ctrlKey: true })
    expect(react).toContain("if (event.ctrlKey && event.code === 'Enter')")
    expect(react).toContain('(event: KeyboardEvent)')
  })

  it('uses event.* for modifier checks in the Vue snippet and names its parameter event', () => {
    const { vue } = generateEventCodeSnippets({ ...BASE, code: 'Enter', ctrlKey: true, shiftKey: true })
    expect(vue).toContain('function onKeyDown(event) {')
    expect(vue).toContain("if (event.ctrlKey && event.shiftKey && event.code === 'Enter')")
    expect(vue).toContain('event.preventDefault()')
  })

  it('omits the modifier clause when no modifiers are held', () => {
    const { javascript } = generateEventCodeSnippets(BASE)
    expect(javascript).toContain("if (event.code === 'Enter')")
  })
})
