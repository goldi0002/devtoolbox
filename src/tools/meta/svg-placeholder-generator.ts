import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const SVG_PLACEHOLDER_GENERATOR_META: ToolMeta = {
    slug: 'svg-placeholder-generator',
    name: 'SVG Placeholder',
    description: 'Generate fast, customizable SVG placeholder images for your projects.',
    category: 'generate-tools',
    tag: 'generate',
    toolComponent: lazy(() => import('../../components/tools/generate-tools/SvgPlaceholderGenerator')),
    keywords: [
        'svg placeholder',
        'placeholder image generator',
        'dummy image',
        'mock image',
        'svg generator'
    ],
    about: {
        summary: 'Quickly create SVG placeholder images with customizable dimensions, colors, and text.',
        useCases: ['Mocking up UI layouts', 'Placeholder avatars and thumbnails'],
        features: ['Custom width and height', 'Customizable colors', 'Live preview', 'Copyable SVG code']
    },
    isNew: true,
    status: 'stable',
    guide: {
      "steps": [
        {
          "name": "Set the size",
          "text": "Enter the Width (px) and Height (px) of the placeholder."
        },
        {
          "name": "Choose colors",
          "text": "Set the Background Color and Text Color with the swatch or by typing a hex value."
        },
        {
          "name": "Set the label",
          "text": "Type Custom Text, and set the Font Size."
        },
        {
          "name": "Copy the SVG",
          "text": "Copy the SVG Code from the output panel and paste it into your HTML or design file."
        }
      ],
      "faqs": [
        {
          "question": "What label is shown if Custom Text is empty?",
          "answer": "The placeholder shows its dimensions, such as 800 x 600."
        },
        {
          "question": "What happens if a number is empty or zero?",
          "answer": "Width, height and font size fall back to 800, 600 and 48 when the value is empty, zero or not a number."
        },
        {
          "question": "Are the colors checked?",
          "answer": "The colors are written into the SVG as you type them. Use a valid color such as #cccccc to get the color you expect."
        },
        {
          "question": "Is anything sent to a server?",
          "answer": "No. The SVG code is generated in your browser."
        }
      ],
      "example": {
        "title": "Create a 300 × 200 placeholder labelled Hero with the default colors.",
        "input": "Width 300, height 200, Custom Text Hero, default colors, Font Size 48",
        "output": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"200\" viewBox=\"0 0 300 200\">\n  <rect fill=\"#cccccc\" width=\"300\" height=\"200\"/>\n  <text fill=\"#666666\" font-family=\"sans-serif\" font-size=\"48\" dy=\"0.35em\" font-weight=\"bold\" x=\"50%\" y=\"50%\" text-anchor=\"middle\">Hero</text>\n</svg>",
        "inputLabel": "Settings",
        "outputLabel": "SVG Code"
      }
    },
    seo: {
        title: 'SVG Placeholder Image Generator — Custom Size, Color & Text',
        description: 'Generate lightweight SVG placeholder images with custom dimensions, colors and label text. Copy the SVG markup straight into your mockups.',
    },
}
