import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CUBIC_BEZIER_EDITOR_META: ToolMeta = {
  slug: 'cubic-bezier-editor',
  name: 'Cubic-Bezier Easing Editor',
  description: 'Shape a CSS cubic-bezier() timing function by dragging its two handles or typing values, preview the motion, and copy the CSS.',
  category: 'web-tools',
  tag: 'CSS',
  keywords: [
    'cubic bezier',
    'cubic-bezier editor',
    'cubic bezier generator',
    'easing editor',
    'easing function generator',
    'css easing',
    'css timing function',
    'transition timing function',
    'animation easing',
    'bezier curve css',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/CubicBezierEditor')),
  about: {
    summary: 'The Cubic-Bezier Easing Editor builds the cubic-bezier(x1, y1, x2, y2) timing function that CSS transitions and animations use. Drag the two control points on the curve or type their values, then watch a box move along the curve and copy the result. Everything runs in your browser.',
    useCases: [
      'Tuning a hover or modal transition until it feels right.',
      'Adding overshoot or anticipation to a UI animation with an easeOutBack style curve.',
      'Turning a curve from a design tool or a library into a CSS value.',
      'Checking what a pasted cubic-bezier() value looks like before shipping it.',
    ],
    features: [
      'Drag either control point, or type x1, y1, x2 and y2 with the keyboard.',
      'x is kept between 0 and 1, as CSS requires; y can go from -2 to 2 for overshoot.',
      'Preset buttons for linear, the CSS keywords and common easings such as easeInOutBack.',
      'Paste a cubic-bezier() value or a transition-timing-function declaration to load it.',
      'Animated preview with a Replay button. It is turned off when reduced motion is on.',
      'Copy the bare cubic-bezier() value or the full transition-timing-function line.',
    ],
    tip: 'Keep y between 0 and 1 for everyday UI motion. Values below 0 or above 1 make the element overshoot its target, which is a deliberate effect that can look wrong on small, frequent interactions.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Cubic-Bezier Easing Editor — CSS timing function generator',
    description: 'Visually build a CSS cubic-bezier() easing curve with draggable handles, presets and a live motion preview. Copy the value. 100% client-side.',
    extraKeywords: [
      'css cubic-bezier generator',
      'easing curve generator',
      'css easing function online',
      'easeInOutBack css',
      'transition-timing-function generator',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Start from a preset or paste a value',
        text: 'Click a preset such as ease-out or easeOutBack, or paste a cubic-bezier(...) value or a transition-timing-function line into the paste field. A pasted x value outside 0 to 1 is clamped and a note says so.',
      },
      {
        name: 'Shape the curve',
        text: 'Drag the two round handles on the graph, or type x1, y1, x2 and y2 under it. With a field focused, the Up and Down arrow keys change its value by 0.01, or by 0.1 with Shift.',
      },
      {
        name: 'Check the motion',
        text: 'The box in the preview moves from left to right using the same curve. Press Replay to run it again. When reduced motion is enabled in your system settings, the box stays at its end position and Replay is disabled.',
      },
      {
        name: 'Copy the CSS',
        text: 'Copy cubic-bezier() gives the bare timing function for a shorthand such as transition: left 300ms cubic-bezier(...). Copy the declaration gives the full transition-timing-function line.',
      },
    ],
    faqs: [
      {
        question: 'What do the four numbers mean?',
        answer: 'x1 and y1 are the first control point and x2 and y2 are the second. The curve always starts at (0, 0) and ends at (1, 1). x is elapsed time as a fraction of the duration, and y is how far the value has moved toward its target.',
      },
      {
        question: 'Why are x values limited to 0 to 1 but y is not?',
        answer: 'CSS requires x to stay between 0 and 1 because time cannot run backwards or past the end of the transition. y is the animated progress, so it may go below 0 or above 1 to overshoot or anticipate the motion. The editor allows y from -2 to 2.',
      },
      {
        question: 'Does the preview match what the browser does?',
        answer: 'Yes. The preview box is moved with a CSS transition that uses the same cubic-bezier() value, so the motion you see is the motion the browser applies. The graph and the preview both come from the values shown below them.',
      },
      {
        question: 'Is anything I enter sent to a server?',
        answer: 'No. The curve, the parser and the preview all run in your browser. Nothing you type or paste is uploaded.',
      },
    ],
    example: {
      title: 'Turn a pasted overshoot curve into a CSS declaration.',
      input: 'cubic-bezier(0.68,-0.6,0.32,1.6)',
      output: 'transition-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);',
      inputLabel: 'Pasted value',
      outputLabel: 'CSS',
    },
  },
}
