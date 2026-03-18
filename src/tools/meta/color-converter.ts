import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const COLOR_CONVERTER_META: ToolMeta = {
  slug: 'color-converter',
  name: 'Color Converter',
  description: 'Convert HEX, RGB, and HSL values instantly with a live color preview. Free and fully client-side.',
  category: 'web-tools',
  tag: 'web',
  toolComponent: lazy(() => import('../../components/tools/web-tools/ColorConverter')),
  keywords: [
    'color converter',
    'hex to rgb',
    'rgb to hex',
    'hsl converter',
    'web color tool',
    'css color converter',
  ],
  about: {
    summary:
      'Color Converter helps you move between the most common CSS color formats without leaving the browser. Paste a HEX, RGB, or HSL value and instantly get normalized equivalents plus a visual swatch for quick UI work.',
    useCases: [
      'Translating design tokens into CSS-ready HEX, RGB, or HSL values',
      'Checking whether two colors are actually the same across different formats',
      'Copying a normalized color value into a stylesheet or design system',
    ],
    features: [
      'Accepts HEX, RGB, and HSL input formats',
      'Outputs normalized HEX, RGB, and HSL values',
      'Live color preview for quick visual verification',
      'One-click copy for every format',
    ],
    tip: 'HSL is often the easiest format for tweaking hue or lightness during UI exploration, then you can convert back to HEX for production tokens.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
}
