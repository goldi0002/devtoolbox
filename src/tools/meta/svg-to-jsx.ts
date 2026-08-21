import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const SVG_TO_JSX_META: ToolMeta = {
  slug: 'svg-to-jsx',
  name: 'SVG to JSX / React Converter',
  category: 'web-tools',
  tag: 'REACT',
  description: 'Transform raw SVG markup into clean, optimized React JSX / TSX icon components with TypeScript types, custom props, and currentColor support.',
  keywords: ['svg to jsx', 'svg to react', 'svg to tsx', 'convert svg to react component', 'svg optimizer jsx', 'react svg icon generator'],
  status: 'available',
  toolComponent: lazy(() => import('../../components/tools/Web/SvgToJsx')),
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
