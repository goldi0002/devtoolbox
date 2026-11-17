import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const BOX_SHADOW_GENERATOR_META: ToolMeta = {
  slug: 'box-shadow-generator',
  name: 'Box Shadow Generator',
  description: 'Build CSS box-shadow values with multiple layers, offsets, blur, spread, colour opacity and inset, with a live preview.',
  category: 'generate-tools',
  tag: 'css',
  keywords: [
    'box shadow generator',
    'css box shadow',
    'box-shadow css',
    'css shadow generator',
    'inset shadow css',
    'multiple box shadows',
    'css drop shadow',
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/BoxShadowGenerator')),
  about: {
    summary: 'Box Shadow Generator builds a CSS box-shadow declaration visually. Stack as many shadow layers as you need, set each layer\'s x and y offset, blur, spread, colour and opacity, toggle inset, and watch the result on a live preview. The output is plain CSS you can paste into a stylesheet. Everything runs in your browser; nothing is uploaded.',
    useCases: [
      'Adding a card or modal elevation without guessing values.',
      'Building a layered shadow that looks smooth rather than a single hard edge.',
      'Creating inset shadows for pressed buttons, wells and input fields.',
      'Matching a shadow from a design file by trying values live.',
    ],
    features: [
      'Add, remove and reorder shadow layers; the first layer is drawn on top.',
      'Every value has a slider and a number box, and all controls work from the keyboard.',
      'Colour picker plus hex field, with the opacity converted to rgba() in the output.',
      'Inset toggle per layer and four starter presets: Subtle, Elevated, Inset and Layered.',
      'Adjustable preview canvas and box colours, and a one-click copy of the CSS.',
    ],
    tip: 'Stack two or three layers with a small blur and a larger, fainter blur below it. This reads as a natural shadow; a single large blur tends to look flat.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Box Shadow Generator — Build CSS box-shadow online',
    description: 'Create CSS box-shadow values with multiple layers, blur, spread, opacity and inset, and see a live preview. Copy the CSS. 100% client-side.',
    extraKeywords: [
      'css box shadow generator online',
      'multi layer box shadow',
      'css inset box shadow',
      'box shadow css code',
      'shadow css generator',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Pick a starting preset',
        text: 'Choose Subtle, Elevated, Inset or Layered to load a ready-made shadow. Presets replace the current layers, so start from one only when you want a fresh shape.',
      },
      {
        name: 'Adjust each layer',
        text: 'Set X and Y offset, Blur, Spread, Opacity and Colour for a layer. Use the slider for quick changes or type an exact value in the number box.',
      },
      {
        name: 'Add, reorder or remove layers',
        text: 'Add layer appends a new layer (up to 8). Use the arrow buttons to change the stacking order, where the first layer is on top, and Remove to delete a layer.',
      },
      {
        name: 'Check the preview and copy the CSS',
        text: 'The preview box updates as you change values. Copy to clipboard puts the box-shadow declaration on your clipboard, ready to paste into a stylesheet.',
      },
    ],
    faqs: [
      {
        question: 'What does the first layer do when there are several?',
        answer: 'In CSS the first shadow in the list is drawn on top of the others. Move a layer up or down to change which one sits above the rest.',
      },
      {
        question: 'Why does a zero value appear without px?',
        answer: 'CSS accepts a bare 0 for any length, so the generator writes 0 instead of 0px to keep the output short. Both values are equivalent.',
      },
      {
        question: 'How is opacity written in the output?',
        answer: 'The colour and opacity are combined into rgba(r, g, b, a). An opacity of 20% becomes an alpha of 0.2.',
      },
      {
        question: 'What is the difference between blur and spread?',
        answer: 'Blur softens the edge of the shadow. Spread grows the shadow outward when positive or shrinks it when negative, before the blur is applied.',
      },
      {
        question: 'Is my data uploaded anywhere?',
        answer: 'No. The CSS is built in your browser and nothing is sent to a server.',
      },
    ],
    example: {
      title: 'Two layers: a soft drop shadow and a faint inner edge.',
      input: '[{"x":0,"y":4,"blur":8,"spread":-2,"color":"#000000","opacity":20,"inset":false},\n{"x":0,"y":1,"blur":2,"spread":0,"color":"#1f2937","opacity":10,"inset":true}]',
      output: 'box-shadow:\n  0 4px 8px -2px rgba(0, 0, 0, 0.2),\n  inset 0 1px 2px 0 rgba(31, 41, 55, 0.1);',
      inputLabel: 'Layers (x, y, blur, spread, color, opacity, inset)',
      outputLabel: 'CSS',
    },
  },
}
