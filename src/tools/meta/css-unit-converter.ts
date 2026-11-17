import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const CSS_UNIT_CONVERTER_META: ToolMeta = {
  slug: 'css-unit-converter',
  name: 'CSS Unit & Fluid clamp() Converter',
  category: 'web-tools',
  tag: 'CSS',
  description: 'Convert between PX, REM, EM, VW, VH, %, and PT with Tailwind CSS class matching and fluid clamp() generator.',
  keywords: ['css unit converter', 'px to rem', 'rem to px', 'css clamp generator', 'fluid typography generator', 'tailwind spacing converter'],
  status: 'stable',
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
  },
  guide: {
    steps: [
      {
        name: 'Enter a value and unit',
        text: 'Type a number and pick its unit: px, rem, em, vw, vh, % or pt. The result cards and Tailwind matches update as you type.'
      },
      {
        name: 'Set the base font size and viewport width',
        text: 'Base Font Size (16px by default) sets what 1rem and 1em equal. Viewport Width (1920px by default) is the width that 100vw stands for.'
      },
      {
        name: 'Read the results and Tailwind matches',
        text: 'The Pixels, Root EM, Viewport Width and Points cards show the same length in each unit. Tailwind Spacing and Tailwind Font Size show the nearest class, or an arbitrary value such as w-[18px] when no class is within 0.5px.'
      },
      {
        name: 'Generate a fluid clamp() value',
        text: 'Enter the minimum and maximum font size in px and the viewport widths they apply at. Copy the font-size line: it scales linearly between the two sizes with no media queries.'
      }
    ],
    faqs: [
      {
        question: 'Why does em give the same result as rem?',
        answer: 'The converter uses the same base font size for em and rem, so 2em with a 20px base is 40px. It does not know a parent element\'s font size, so for nested em values, enter the parent size as Base Font Size.'
      },
      {
        question: 'What if my site does not use a 16px root font size?',
        answer: 'Change Base Font Size to match the html font-size in your CSS. The rem and em results and the clamp() rem values are recalculated from that number.'
      },
      {
        question: 'Does the clamp() formula need media queries?',
        answer: 'No. The value stays at the minimum below the minimum viewport width, stays at the maximum above the maximum viewport width, and scales linearly in between.'
      },
      {
        question: 'What do arbitrary values like w-[18px] mean?',
        answer: 'When no Tailwind spacing or font size step is within 0.5px of the value, the tool shows an arbitrary value such as w-[18px] or text-[40px] that you can use directly as a Tailwind class.'
      }
    ],
    example: {
      title: 'Fluid heading that grows from 16px to 32px between 375px and 1440px viewports.',
      input: 'Min 16px at 375px\nMax 32px at 1440px',
      output: 'clamp(1.0000rem, 0.6479rem + 1.5023vw, 2.0000rem)',
      inputLabel: 'Clamp settings',
      outputLabel: 'Generated font-size value'
    }
  }
}
