import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const KEYCODE_INSPECTOR_META: ToolMeta = {
  slug: 'keycode-inspector',
  name: 'Keycode & Keyboard Event Inspector',
  category: 'web-tools',
  tag: 'EVENTS',
  description: 'Inspect JavaScript KeyboardEvent attributes (key, code, which, keyCode, modifiers) with live keypress capture and event handler code generator.',
  keywords: ['keycode', 'javascript keycode', 'keyboard event inspector', 'event.code', 'event.key', 'keyboard shortcuts generator'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/KeycodeInspector')),
  seo: {
    title: 'Keycode & Keyboard Event Inspector — JS Event Code Tool',
    description: 'Inspect JavaScript KeyboardEvent properties (event.key, event.code, which, keyCode, location) in real-time and generate React & JS event handler snippets.',
    extraKeywords: ['javascript keycode table', 'event key code lookup', 'react usekeydown hook', 'keyboard event listener generator', 'keycode lookup online'],
  },
  about: {
    summary: 'The Keycode & Keyboard Event Inspector detects real-time keypresses and outputs all standard W3C KeyboardEvent attributes alongside ready-to-use JavaScript, React, and Vue event listeners.',
    useCases: [
      'Finding the exact event.code and event.key values for custom keyboard shortcut listeners',
      'Debugging cross-browser keyboard layout inconsistencies (QWERTY, AZERTY, etc.)',
      'Generating React useEffect and onKeyDown event handler hooks',
      'Consulting the complete reference table of modern JS key codes'
    ],
    features: [
      'Live key capture detecting key, code, which, keyCode, and location',
      'Active modifier state indicators (Shift, Ctrl, Alt, Meta/Command, CapsLock)',
      'Instant code snippet generator for JavaScript, React hooks, and Vue',
      'Searchable reference table covering function keys, navigation, and numpad'
    ],
    notes: [
      'Modern web applications should prefer event.code and event.key over the deprecated event.keyCode property',
      'event.code represents the physical keyboard key position regardless of system layout'
    ],
    tip: 'Press any key combination (like Ctrl + Enter or Shift + Tab) to generate code snippets with modifier guards.'
  },
  guide: {
    "steps": [
      {
        "name": "Start listening",
        "text": "Click the Live Keypress Detector box, then press a key or combination."
      },
      {
        "name": "Read the key details",
        "text": "Check key, code, which, keyCode and location, plus the modifier indicators Shift, Control (Ctrl), Alt / Option, Meta / Command and Repeat."
      },
      {
        "name": "Copy a snippet",
        "text": "Switch between the javascript, react and vue tabs and copy the listener you need."
      },
      {
        "name": "Search the reference",
        "text": "Use Search keys, codes, categories in the Standard Key Codes Reference Table to look up a key."
      }
    ],
    "faqs": [
      {
        "question": "What is the difference between key and code?",
        "answer": "key is the character or action the keyboard layout produces, so it changes with the layout. code is the physical key position, so it stays the same across layouts."
      },
      {
        "question": "Why does the tool recommend key and code over keyCode?",
        "answer": "keyCode is deprecated. Current code should use event.key and event.code."
      },
      {
        "question": "Does typing in the search box get captured?",
        "answer": "No. Key presses inside text inputs are ignored by the detector."
      },
      {
        "question": "Do key presses leave the page?",
        "answer": "No. Listening happens in your browser, and key presses are not sent anywhere."
      }
    ],
    "example": {
      "title": "Generate a JavaScript listener for the Enter key.",
      "input": "Press Enter",
      "output": "window.addEventListener('keydown', (event) => {\n  if (event.code === 'Enter') {\n    event.preventDefault();\n    console.log('Enter pressed!');\n  }\n});",
      "inputLabel": "Key press",
      "outputLabel": "JavaScript snippet"
    }
  },
}
