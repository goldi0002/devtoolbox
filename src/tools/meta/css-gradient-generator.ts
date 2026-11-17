import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const CSS_GRADIENT_GENERATOR_META: ToolMeta = {
  slug: 'css-gradient-generator',
  name: 'CSS Gradient Generator',
  description: 'Build linear, radial and conic CSS gradients with editable color stops, a live preview and a copy-ready background declaration.',
  category: 'web-tools',
  tag: 'web',
  icon: 'Palette',
  keywords: [
    'css gradient generator',
    'linear gradient generator',
    'radial gradient generator',
    'conic gradient generator',
    'css background gradient',
    'gradient color stops',
    'css gradient builder',
    'gradient css',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/CssGradientGenerator')),
  about: {
    summary: 'The CSS Gradient Generator builds linear, radial and conic gradients for the CSS background property. Choose a gradient type, adjust the angle or center, and edit the color stops. A live preview shows the result, and the output is a single background declaration you can copy. Everything runs in your browser.',
    useCases: [
      'Creating a hero banner background that fades from one brand color to another.',
      'Making a radial spotlight behind a heading by moving the center point.',
      'Drawing a conic color wheel for a chart or decorative element.',
      'Checking where each color stop lands before copying the CSS into a stylesheet.',
    ],
    features: [
      'Linear, radial (circle or ellipse) and conic gradients.',
      'Angle control for linear and conic gradients, as a number input and a slider.',
      'Center position for radial and conic gradients.',
      'Add, remove and edit color stops, each with a color picker, a hex text field and a percentage position.',
      'Enforces at least two stops and up to eight.',
      'Sorts stops by position in the output, so the order you type them does not matter.',
      'Five presets to start from, and a live preview.',
      'Copy the background declaration with one click.',
    ],
    tip: 'Place the first stop at 0% and the last at 100% so the gradient fills the whole element. Add a middle stop when you want a color to hold its place partway along the gradient.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'CSS Gradient Generator — Linear, radial and conic gradients',
    description: 'Create linear, radial and conic CSS gradients with color stops, live preview and copy-ready CSS. Private, runs in your browser.',
    extraKeywords: [
      'css gradient maker',
      'linear-gradient generator',
      'radial-gradient generator',
      'conic-gradient generator',
      'css gradient color picker',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Choose a gradient type',
        text: 'Pick Linear, Radial or Conic. Linear fades along a direction, radial fades out from a center point, and conic sweeps around a center point.',
      },
      {
        name: 'Set the angle, shape or center',
        text: 'Linear and conic gradients use the angle, either typed in the number box or dragged with the slider. Radial gradients use a circle or ellipse shape. Radial and conic gradients also take a center position as X and Y percentages.',
      },
      {
        name: 'Edit the color stops',
        text: 'Each stop has a color picker, a hex text field and a position in percent. Use Add color stop to insert a stop in the widest gap, and Remove to delete one. A gradient always keeps at least two stops.',
      },
      {
        name: 'Fix any invalid hex values',
        text: 'Hex colors must be #rgb or #rrggbb. A stop with an invalid value is marked, and it is left out of the CSS until it is valid.',
      },
      {
        name: 'Copy the CSS',
        text: 'The output is a background declaration. Copy it and paste it into a rule for the element, or into a style attribute.',
      },
    ],
    faqs: [
      {
        question: 'What does the generated CSS look like?',
        answer: 'It is one background declaration, for example background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);. Stops are written as a color followed by a percentage, and they are sorted by position.',
      },
      {
        question: 'What happens if I type a position outside 0 to 100, or an angle outside 0 to 360?',
        answer: 'The value is clamped into range when it is set, so the field and the CSS both show the limit. A position of 120 becomes 100%, and an angle of 400 becomes 360deg.',
      },
      {
        question: 'Why does the output skip one of my colors?',
        answer: 'A stop whose hex text is not a valid 3- or 6-digit hex value is not written, because CSS would reject it. The stop is marked in the form. If fewer than two valid stops remain, no CSS is produced until you fix them.',
      },
      {
        question: 'Does the order of the stops matter?',
        answer: 'Not for the output. Stops are written sorted by position, so a stop at 80% that you added first still appears after a stop at 20%.',
      },
      {
        question: 'Is anything I enter sent to a server?',
        answer: 'No. The gradient and its CSS are computed in your browser, and nothing you type is sent anywhere.',
      },
    ],
    example: {
      title: 'Build a two-stop diagonal sunset gradient.',
      input: '{"type":"linear","angle":135,"stops":[{"color":"#ff7e5f","position":0},{"color":"#feb47b","position":100}]}',
      output: 'background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);',
      inputLabel: 'Gradient settings (JSON)',
      outputLabel: 'CSS output',
    },
  },
}
