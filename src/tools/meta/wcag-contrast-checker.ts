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
