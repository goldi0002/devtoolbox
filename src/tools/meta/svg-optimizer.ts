import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const SVG_OPTIMIZER_META: ToolMeta = {
  slug: 'svg-optimizer',
  name: 'SVG Optimizer',
  description: 'Shrink SVG files by removing comments and metadata, rewriting paths and rounding numbers. Compare the original and optimized previews, then copy or download. Runs in your browser.',
  category: 'web-tools',
  tag: 'svg',
  icon: 'FileCode',
  keywords: [
    'svg optimizer',
    'svg optimize',
    'svg minifier',
    'minify svg',
    'compress svg',
    'svg compressor',
    'reduce svg size',
    'svgo online',
    'clean svg',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/SvgOptimizer')),
  about: {
    summary: 'SVG Optimizer shrinks an SVG file without changing how it looks. It runs the svgo optimizer in your browser: comments and editor metadata are removed, path data is rewritten in a shorter form, and numbers are rounded to the precision you choose. The original and optimized versions are rendered side by side so you can confirm nothing broke before you copy or download the result.',
    useCases: [
      'Cutting the weight of icons exported from Figma, Illustrator or Inkscape.',
      'Removing editor metadata and comments before committing SVG assets.',
      'Reducing the size of inline SVG in HTML or JSX.',
      'Checking that an optimized logo still renders the same as the original.',
    ],
    features: [
      'Shows original and optimized sizes in bytes with the percentage saved.',
      'Toggles for removing comments, removing metadata, and minifying path data and numbers.',
      'Precision control for how many decimal places numbers keep.',
      'Side-by-side preview of both SVGs, rendered as images so scripts inside them never run.',
      'Copy the output or download it as a .min.svg file.',
    ],
    tip: 'Start with the defaults, then compare the two previews. If a shape looks slightly off, raise the precision by one or two places; if it still differs, turn off "Minify paths and numbers".',
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'SVG Optimizer — Minify and compress SVG files online',
    description: 'Optimize SVG files online: remove comments and metadata, minify paths, and compare before and after previews. Shows size saved. 100% client-side and private.',
    extraKeywords: [
      'svg optimizer online',
      'svg minifier online',
      'compress svg file',
      'reduce svg file size',
      'svgo browser',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Paste or upload the SVG',
        text: 'Paste SVG markup into the input, or choose a .svg file. The output updates as you type or change an option.',
      },
      {
        name: 'Choose what to remove and minify',
        text: 'Tick Remove comments and Remove metadata to strip those blocks. Tick Minify paths and numbers to rewrite path data and round numbers to the Precision you set.',
      },
      {
        name: 'Check the preview',
        text: 'The original and optimized SVGs are shown side by side as images. Confirm the shapes match before you use the output.',
      },
      {
        name: 'Copy or download',
        text: 'Copy the optimized markup to the clipboard, or download it as a file named after your original with .min added before .svg.',
      },
    ],
    faqs: [
      {
        question: 'Will optimizing change how the SVG looks?',
        answer: 'It can, slightly, when numbers are rounded. Lower precision gives smaller files and more rounding. Compare the two previews after each change.',
      },
      {
        question: 'What does "Minify paths and numbers" do?',
        answer: 'It rewrites path data into shorter equivalent commands and rounds coordinates and other numeric values to the chosen number of decimal places. Turn it off if the output looks wrong.',
      },
      {
        question: 'Does removing metadata delete anything I need?',
        answer: 'Metadata blocks hold editor and license information. They do not affect rendering, but remove them only if you do not need that information.',
      },
      {
        question: 'Is my SVG uploaded anywhere?',
        answer: 'No. The optimizer and the previews run in your browser, and the SVG is never sent to a server.',
      },
    ],
    example: {
      title: 'Optimize a 310-byte icon exported with a comment and metadata.',
      input: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Exported from a drawing app -->\n<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n  <metadata>Icon v2</metadata>\n  <path d="M12.000000 2.000000 L22.000000 12.000000 L12.000000 22.000000 L2.000000 12.000000 Z" fill="#000000"/>\n</svg>',
      output: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 2 10 10-10 10L2 12Z"/></svg>',
      inputLabel: 'Original SVG',
      outputLabel: 'Optimized SVG (124 bytes, 60% saved)',
    },
  },
}
