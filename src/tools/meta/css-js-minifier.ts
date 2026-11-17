import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CSS_JS_MINIFIER_META: ToolMeta = {
  slug: 'css-js-minifier',
  name: 'CSS / JS Minifier',
  description: 'Minify JavaScript with Terser or CSS with csso, and see the original size, the minified size and the percentage saved. Runs entirely in your browser.',
  category: 'web-tools',
  tag: 'minify',
  icon: 'FileCode',
  keywords: [
    'minify css',
    'minify javascript',
    'css minifier',
    'js minifier',
    'javascript minifier',
    'compress css',
    'compress javascript',
    'terser',
    'csso',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/CssJsMinifier')),
  about: {
    summary: 'CSS / JS Minifier shrinks JavaScript and CSS by removing whitespace and comments and shortening names. JavaScript is minified with Terser and CSS with csso. Both libraries run in your browser, so your code is never uploaded.',
    useCases: [
      'Making a small inline script or stylesheet lighter before embedding it.',
      'Checking how much a file would shrink before shipping it.',
      'Removing console calls from a script before a production build.',
      'Finding a syntax error in a snippet by its line and column.',
    ],
    features: [
      'Switch between JavaScript and CSS with one click.',
      'Shows the original size, the minified size and the percentage saved, in bytes.',
      'JavaScript options: mangle local names and drop console.* calls.',
      'Syntax errors in JavaScript are shown with their line and column.',
      'Copy the result or download it as minified.js or minified.css.',
    ],
    tip: 'Minify is a size check, not a build step. Keep your source readable and minify only the output you ship, and always run the minified code once before you deploy it.',
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'CSS / JS Minifier — Shrink CSS and JavaScript online, privately',
    description: 'Minify JavaScript (Terser) or CSS (csso) in your browser. See the size saved, copy or download the result. Your code never leaves your device.',
    extraKeywords: [
      'minify css online',
      'minify javascript online',
      'css compressor',
      'js compressor',
      'remove console from javascript',
      'private css minifier',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Choose the language',
        text: 'Pick JavaScript or CSS at the top. Switching language keeps the text you typed unless it is still the sample for the old language.',
      },
      {
        name: 'Paste your code',
        text: 'Paste the source into the input. For JavaScript, tick Mangle names to shorten local variable and function names, and Drop console calls to remove console.* lines.',
      },
      {
        name: 'Press Minify',
        text: 'Minify runs the code through Terser (JavaScript) or csso (CSS). A syntax error appears under the input with its line and column.',
      },
      {
        name: 'Compare sizes and take the output',
        text: 'The cards show the original size, the minified size and the percentage saved. Copy the output or download it as minified.js or minified.css.',
      },
    ],
    faqs: [
      {
        question: 'Is my code uploaded anywhere?',
        answer: 'No. Terser and csso are loaded into your browser and the minifying happens there. Nothing you paste is sent to a server.',
      },
      {
        question: 'What does Mangle names do?',
        answer: 'It renames local variables and function parameters to short names such as a or t. Top-level names and properties are kept, so code that relies on them still works. Turn it off if other code reads a local name by string.',
      },
      {
        question: 'What does Drop console calls remove?',
        answer: 'Calls such as console.log(...), console.warn(...) and console.error(...). If the call has side effects inside its arguments, those are dropped with it, so check the result before shipping.',
      },
      {
        question: 'Why does a CSS mistake sometimes not show an error?',
        answer: 'CSS parsers are forgiving. They skip declarations they do not understand instead of stopping, so a typo in a property name usually shrinks without an error. Check the output if a style goes missing.',
      },
    ],
    example: {
      title: 'Minify a small CSS rule.',
      input: '.box {\n  margin: 0 auto;\n  color: #ffffff;\n}',
      output: '.box{margin:0 auto;color:#fff}',
      inputLabel: 'CSS input',
      outputLabel: 'Minified output',
    },
  },
}
