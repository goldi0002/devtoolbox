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
      'Complementary, analogous and triadic harmony swatches; click one to convert it',
    ],
    tip: 'HSL is often the easiest format for tweaking hue or lightness during UI exploration, then you can convert back to HEX for production tokens.',
  },
  addedAt: '2026-03-18',
  complexity: 'simple',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Color Converter — HEX to RGB, HSL & Back with Live Preview',
    description: 'Convert colors between HEX, RGB and HSL instantly with a live preview. Free, fast and fully client-side.',
  },
  guide: {
    "steps": [
      {
        "name": "Enter a color",
        "text": "Type or paste a HEX, RGB or HSL value, for example #7c3aed, or click \"Load sample\"."
      },
      {
        "name": "Check the preview",
        "text": "A swatch shows the color so you can confirm it is the one you meant."
      },
      {
        "name": "Read all three formats",
        "text": "The same color is shown as normalized HEX, RGB and HSL."
      },
      {
        "name": "Copy the format you need",
        "text": "Each format has its own copy button for pasting into CSS or design tokens."
      },
      {
        "name": "Explore harmonies",
        "text": "Under Color harmonies, complementary, analogous and triadic swatches are generated from your color. Click a swatch to make it the active color."
      }
    ],
    "faqs": [
      {
        "question": "How is HEX converted to RGB?",
        "answer": "A HEX color is three pairs of hexadecimal digits for red, green and blue. Convert each pair to decimal: #7C3AED is 7C = 124, 3A = 58, ED = 237, giving rgb(124, 58, 237)."
      },
      {
        "question": "When should I use HSL instead of HEX?",
        "answer": "HSL separates hue, saturation and lightness, which makes it easier to create lighter, darker or muted variants of a color. HEX is more compact and remains the most common format in design tools."
      },
      {
        "question": "Are 3-digit HEX codes the same as 6-digit ones?",
        "answer": "A 3-digit code is shorthand in which each digit is doubled. #abc is identical to #aabbcc."
      },
      {
        "question": "How are the harmony colors calculated?",
        "answer": "The color's hue is rotated in HSL while saturation and lightness stay the same: +180° for complementary, −30° and +30° for analogous, and +120° and +240° for triadic."
      },
      {
        "question": "Why does converting to HSL and back sometimes change the HEX value?",
        "answer": "HSL values are rounded to whole numbers, so a round trip can shift a channel by one. The difference is not visible."
      }
    ],
    "example": {
      "title": "Convert a HEX color to RGB and HSL.",
      "input": "#7c3aed",
      "output": "HEX: #7C3AED\nRGB: rgb(124, 58, 237)\nHSL: hsl(262, 83%, 58%)",
      "inputLabel": "HEX",
      "outputLabel": "All formats"
    }
  },
}
