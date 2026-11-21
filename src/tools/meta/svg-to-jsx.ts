import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const SVG_TO_JSX_META: ToolMeta = {
  slug: 'svg-to-jsx',
  name: 'SVG to JSX / React Converter',
  category: 'web-tools',
  tag: 'REACT',
  description: 'Transform raw SVG markup into clean, optimized React JSX / TSX icon components with TypeScript types, custom props, and currentColor support.',
  keywords: ['svg to jsx', 'svg to react', 'svg to tsx', 'convert svg to react component', 'svg optimizer jsx', 'react svg icon generator'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/Web/SvgToJsx')),
  guide: {
    "steps": [
      {
        "name": "Paste SVG markup",
        "text": "Paste the <svg> code into Input SVG Code, or start from one of the sample SVGs."
      },
      {
        "name": "Set the component options",
        "text": "Set the component name, choose TypeScript (TSX), and toggle forwardRef, React.memo, Replace colors with currentColor and Remove w/h."
      },
      {
        "name": "Review the preview",
        "text": "The rendered SVG shows in the preview. Use the contrast button to switch the background."
      },
      {
        "name": "Copy the component",
        "text": "Copy the code from React Component."
      }
    ],
    "faqs": [
      {
        "question": "How are attributes converted?",
        "answer": "Hyphenated SVG attributes become camelCase (stroke-width becomes strokeWidth, class becomes className). Inline style strings become style objects. XML declarations, doctypes and comments are removed."
      },
      {
        "question": "What does Replace colors with currentColor change?",
        "answer": "Stroke and fill values other than none are set to currentColor. A fill that uses url(...) is left alone."
      },
      {
        "question": "Is the markup uploaded?",
        "answer": "No. The SVG is parsed in your browser."
      }
    ],
    "example": {
      "title": "Convert a check icon with the default options.",
      "input": "<svg viewBox=\"0 0 24 24\" stroke-width=\"2\"><path d=\"M5 12l5 5L20 7\" stroke=\"#000\"/></svg>",
      "output": "import { forwardRef, type SVGProps, type Ref } from 'react'\n\nexport interface ShieldCheckIconProps extends SVGProps<SVGSVGElement> {\n  size?: number | string\n}\n\nconst ShieldCheckIcon = forwardRef<SVGSVGElement, ShieldCheckIconProps>(function ShieldCheckIcon(props, ref) {\n  return (\n    <svg ref={ref} {...props} viewBox=\"0 0 24 24\" strokeWidth=\"2\">\n      <path d=\"M5 12l5 5L20 7\" stroke=\"#000\" />\n    </svg>\n  )\n})\n\nexport default ShieldCheckIcon",
      "inputLabel": "Input SVG Code",
      "outputLabel": "React Component (TSX)"
    }
  },
  seo: {
    title: 'SVG to JSX / React Component Converter — Online TSX Icon Generator',
    description: 'Convert raw SVG code into production-ready React JSX or TypeScript TSX components with customizable props, forwardRef, memo, and SVG optimization.',
    extraKeywords: ['svg to react online', 'svg to jsx converter', 'svg react icon generator', 'svg to tsx component', 'svg currentColor optimizer'],
  },
  about: {
    summary: 'The SVG to JSX Converter takes standard SVG markup and produces modern, production-ready React / TSX components with proper camelCase attribute formatting, TypeScript interfaces, and customizable wrapper options.',
    useCases: [
      'Converting designer-exported SVGs (from Figma, Illustrator, Sketch) into reusable React components',
      'Creating scalable icon libraries with TypeScript prop types and currentColor theming',
      'Sanitizing raw SVG markup by removing XML doctypes, metadata tags, and inline comments'
    ],
    features: [
      'Automatic attribute transformation (stroke-width → strokeWidth, class → className, tabindex → tabIndex, clip-path → clipPath, etc.)',
      'Inline style string to React style object converter',
      'TypeScript interface generation (SVGProps<SVGSVGElement> or custom icon interface)',
      'Optional forwardRef, React.memo, currentColor replace, and component name customization',
      'Live interactive SVG rendering preview with dark/light background toggles'
    ],
    notes: [
      'HTML/XML attributes with hyphens are converted strictly to React camelCase standard',
      'SVG parsing executes 100% in client memory using native DOMParser and AST string transformers'
    ],
    tip: 'Enable the "Replace colors with currentColor" option to make your SVG icon dynamically inherit CSS text colors.'
  }
}
