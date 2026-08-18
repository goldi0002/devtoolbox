import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const CSS_UNIT_CONVERTER_META: ToolMeta = {
  slug: 'css-unit-converter',
  name: 'CSS Unit & Fluid clamp() Converter',
  category: 'web-tools',
  tag: 'CSS',
  description: 'Convert between PX, REM, EM, VW, VH, %, and PT with Tailwind CSS class matching and fluid clamp() generator.',
  keywords: ['css unit converter', 'px to rem', 'rem to px', 'css clamp generator', 'fluid typography generator', 'tailwind spacing converter'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/CssUnitConverter')),
  seo: {
    title: 'CSS Unit Converter — PX to REM, Viewport Units & Fluid clamp()',
    description: 'Convert CSS units (px, rem, em, vw, vh, pt, %) with customizable base font size and generate fluid clamp() typography formulas.',
    extraKeywords: ['px to rem converter', 'fluid font size clamp generator', 'tailwind rem to px', 'responsive typography calculator', 'css viewport converter'],
  },
  about: {
    summary: 'The CSS Unit & Fluid clamp() Converter converts length units across CSS ecosystems and generates responsive fluid typography formulas without media queries.',
    useCases: [
      'Converting design mockup pixels (px) into accessible relative units (rem)',
      'Generating fluid CSS clamp(min, val, max) for responsive headings and containers',
      'Matching pixel measurements to standard Tailwind CSS spacing and text size classes',
      'Calculating viewport-relative widths (vw) and heights (vh)'
    ],
    features: [
      'Multi-unit bidirectional converter (px, rem, em, vw, vh, %, pt)',
      'Customizable root font size (default 16px) and viewport dimensions',
      'Tailwind CSS spacing and font class matcher',
      'Fluid CSS clamp() formula generator with live CSS code snippet'
    ],
    notes: [
      '1rem equals the root html element font-size (typically 16px)',
      'Fluid clamp formulas scale linearly between the defined min and max viewports'
    ],
    tip: 'Copy the generated clamp() formula directly into your CSS or Tailwind arbitrary value: `text-[clamp(...)]`.'
  }
}
