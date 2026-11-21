import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const WCAG_CONTRAST_CHECKER_META: ToolMeta = {
  slug: 'wcag-contrast-checker',
  name: 'WCAG 2.1 Color Contrast Checker',
  category: 'web-tools',
  tag: 'CONTRAST',
  description: 'Test foreground and background color combinations against WCAG 2.1 AA and AAA accessibility standards with live preview and color blindness simulation.',
  keywords: ['color contrast checker', 'wcag contrast', 'accessibility checker', 'color blindness simulator', 'color ratio', 'a11y contrast', 'wcag 2.1'],
  status: 'stable',
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/web-tools/WcagContrastChecker')),
  guide: {
    "steps": [
      {
        "name": "Enter the colors",
        "text": "Set the Foreground Color (Text / Icon) and Background Color, or click a preset."
      },
      {
        "name": "Read the ratio",
        "text": "The Contrast Ratio shows a value such as 15.09 : 1 with a rating label."
      },
      {
        "name": "Check each test",
        "text": "Review the Pass or Fail rows for normal text, large text and UI Components / Icons."
      },
      {
        "name": "Fix a failing pair",
        "text": "If a pair fails, use the suggested Fix for AA or Fix for AAA color to adjust the foreground."
      }
    ],
    "faqs": [
      {
        "question": "What are the contrast thresholds?",
        "answer": "Normal text needs 4.5:1 for AA and 7.0:1 for AAA. Large text needs 3.0:1 for AA and 4.5:1 for AAA. UI components and icons need 3.0:1."
      },
      {
        "question": "How is the ratio calculated?",
        "answer": "Each color's relative luminance is calculated with the WCAG formula, and the ratio is (lighter + 0.05) / (darker + 0.05)."
      },
      {
        "question": "What do the vision options show?",
        "answer": "The vision options, such as Protanopia or Achromatopsia, preview how the pair looks with that type of color vision. They do not change the ratio."
      },
      {
        "question": "Is anything uploaded?",
        "answer": "No. All calculations run in your browser."
      }
    ],
    "example": {
      "title": "Check the default dark theme pair.",
      "input": "Foreground #E4E4E7 on background #0F0F11",
      "output": "Contrast Ratio 15.09 : 1 — AAA Very High\nNormal Text AA (≥ 4.5:1) — Pass\nNormal Text AAA (≥ 7.0:1) — Pass\nLarge Text AA (≥ 3.0:1) — Pass\nLarge Text AAA (≥ 4.5:1) — Pass\nUI Components / Icons (≥ 3.0:1) — Pass",
      "inputLabel": "Colors",
      "outputLabel": "Results"
    }
  },
  seo: {
    title: 'WCAG 2.1 Color Contrast Checker & Accessibility Tester',
    description: 'Verify WCAG 2.1 AA and AAA color contrast ratios for normal text, large text, and UI components with color blindness simulation in your browser.',
    extraKeywords: ['wcag aa ratio', 'wcag aaa ratio', 'deuteranopia simulation', 'protanopia simulation', 'color a11y', 'accessible palette'],
  },
  about: {
    summary: 'The WCAG 2.1 Color Contrast Checker evaluates foreground and background color pairings using the official W3C relative luminance formula to ensure digital accessibility for all users.',
    useCases: [
      'Validating UI design system color combinations for WCAG 2.1 AA and AAA compliance',
      'Testing web typography and button contrast ratios before deployment',
      'Simulating color blindness modes (Protanopia, Deuteranopia, Tritanopia, Achromatopsia)',
      'Finding accessible alternative colors with 1-click auto-fix suggestions'
    ],
    features: [
      'Accurate WCAG 2.1 relative luminance and contrast ratio calculations',
      'Clear compliance badges for Normal Text (4.5:1 / 7:1), Large Text (3:1 / 4.5:1), and UI Components (3:1)',
      'Live interactive components preview (headings, paragraphs, buttons, pills)',
      'Built-in color blindness matrix simulator and 1-click accessible tone suggestions'
    ],
    notes: [
      'Large text is defined by WCAG as at least 18pt (24px) or 14pt (18.66px) bold',
      'All calculations run entirely in browser memory'
    ],
    tip: 'Click any palette preset to quickly test high-contrast dark, light, or theme combinations.'
  }
}
