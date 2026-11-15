import { readStorage, writeStorage } from '../lib/storage'
import { reportError } from '../utils/errors'

export type SansFontId = 'dm-sans' | 'inter' | 'geist' | 'plus-jakarta' | 'space-grotesk' | 'system'
export type MonoFontId = 'jetbrains-mono' | 'fira-code' | 'geist-mono' | 'monospace'

export interface FontOption<T extends string = string> {
  id: T
  label: string
  sample: string
  family: string
  /** Google Fonts `family=` value. Set only for fonts index.html does not already load. */
  googleFamily?: string
}

export const SANS_FONTS: FontOption<SansFontId>[] = [
  {
    id: 'dm-sans',
    label: 'DM Sans',
    sample: 'Clean geometric modern',
    family: '"DM Sans", system-ui, -apple-system, sans-serif'
  },
  {
    id: 'inter',
    label: 'Inter',
    sample: 'Ultra legible UI standard',
    family: '"Inter", system-ui, -apple-system, sans-serif',
    googleFamily: 'Inter:wght@400;500;600'
  },
  {
    id: 'geist',
    label: 'Geist',
    sample: 'Precision technical typeface',
    family: '"Geist", system-ui, -apple-system, sans-serif',
    googleFamily: 'Geist:wght@400;500;600'
  },
  {
    id: 'plus-jakarta',
    label: 'Plus Jakarta',
    sample: 'Refined contemporary sans',
    family: '"Plus Jakarta Sans", system-ui, sans-serif',
    googleFamily: 'Plus+Jakarta+Sans:wght@400;500;600'
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    sample: 'Expressive tech monospace feel',
    family: '"Space Grotesk", system-ui, sans-serif',
    googleFamily: 'Space+Grotesk:wght@400;500;600'
  },
  {
    id: 'system',
    label: 'System Native',
    sample: 'Native OS system font',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
]

export const MONO_FONTS: FontOption<MonoFontId>[] = [
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    sample: 'const code = 0x4F;',
    family: '"JetBrains Mono", "Fira Code", monospace'
  },
  {
    id: 'fira-code',
    label: 'Fira Code',
    sample: 'fn() => value != null',
    family: '"Fira Code", "JetBrains Mono", monospace',
    googleFamily: 'Fira+Code:wght@400;500'
  },
  {
    id: 'geist-mono',
    label: 'Geist Mono',
    sample: 'import { hash } from "crypto"',
    family: '"Geist Mono", monospace',
    googleFamily: 'Geist+Mono:wght@400;500'
  },
  {
    id: 'monospace',
    label: 'System Monospace',
    sample: 'printf("hello\\n");',
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  }
]

/**
 * index.html only loads the default fonts (DM Sans, JetBrains Mono, Bebas Neue).
 * The optional ones are fetched the first time they are needed, so visitors who
 * never change the font do not pay for six extra families.
 */
export function loadFontStylesheet(font: FontOption) {
  if (!font.googleFamily || typeof document === 'undefined') return
  const id = `font-css-${font.id}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFamily}&display=swap`
  document.head.appendChild(link)
}

export function getInitialSansFont(): SansFontId {
  if (typeof window === 'undefined') return 'dm-sans'
  const stored = readStorage('localStorage', 'font_sans') as SansFontId | null
  if (stored && SANS_FONTS.some(f => f.id === stored)) return stored
  return 'dm-sans'
}

export function getInitialMonoFont(): MonoFontId {
  if (typeof window === 'undefined') return 'jetbrains-mono'
  const stored = readStorage('localStorage', 'font_mono') as MonoFontId | null
  if (stored && MONO_FONTS.some(f => f.id === stored)) return stored
  return 'jetbrains-mono'
}

export function applySansFont(fontId: SansFontId) {
  const font = SANS_FONTS.find(f => f.id === fontId) || SANS_FONTS[0]
  loadFontStylesheet(font)
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-sans', font.family)
    document.documentElement.setAttribute('data-font-sans', fontId)
  }
  writeStorage('localStorage', 'font_sans', fontId)
}

export function applyMonoFont(fontId: MonoFontId) {
  const font = MONO_FONTS.find(f => f.id === fontId) || MONO_FONTS[0]
  loadFontStylesheet(font)
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-mono', font.family)
    document.documentElement.setAttribute('data-font-mono', fontId)
  }
  writeStorage('localStorage', 'font_mono', fontId)
}

export function initCustomFonts() {
  try {
    const sans = getInitialSansFont()
    const mono = getInitialMonoFont()
    applySansFont(sans)
    applyMonoFont(mono)
  } catch (error) {
    reportError('Failed to initialize custom fonts', error)
  }
}
