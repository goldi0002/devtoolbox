export interface KeyInfo {
  key: string
  code: string
  keyCode: number
  which: number
  location: number
  locationName: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
  repeat: boolean
  char: string
}

export const LOCATION_MAP: Record<number, string> = {
  0: 'Standard (DOM_KEY_LOCATION_STANDARD)',
  1: 'Left (DOM_KEY_LOCATION_LEFT)',
  2: 'Right (DOM_KEY_LOCATION_RIGHT)',
  3: 'Numpad (DOM_KEY_LOCATION_NUMPAD)',
  4: 'Mobile (DOM_KEY_LOCATION_MOBILE)',
  5: 'Joystick (DOM_KEY_LOCATION_JOYSTICK)',
}

export interface KeyReferenceItem {
  key: string
  code: string
  keyCode: number
  category: string
  description: string
}

export const COMMON_KEY_CODES: KeyReferenceItem[] = [
  // Alphanumeric
  { key: 'a', code: 'KeyA', keyCode: 65, category: 'Alphabet', description: 'Letter A' },
  { key: 'b', code: 'KeyB', keyCode: 66, category: 'Alphabet', description: 'Letter B' },
  { key: 'c', code: 'KeyC', keyCode: 67, category: 'Alphabet', description: 'Letter C' },
  { key: 'z', code: 'KeyZ', keyCode: 90, category: 'Alphabet', description: 'Letter Z' },
  { key: '0', code: 'Digit0', keyCode: 48, category: 'Digits', description: 'Digit 0' },
  { key: '1', code: 'Digit1', keyCode: 49, category: 'Digits', description: 'Digit 1' },
  { key: '9', code: 'Digit9', keyCode: 57, category: 'Digits', description: 'Digit 9' },

  // Navigation & Control
  { key: 'Enter', code: 'Enter', keyCode: 13, category: 'Control', description: 'Enter / Return key' },
  { key: 'Escape', code: 'Escape', keyCode: 27, category: 'Control', description: 'Escape key' },
  { key: 'Space', code: 'Space', keyCode: 32, category: 'Whitespace', description: 'Spacebar' },
  { key: 'Tab', code: 'Tab', keyCode: 9, category: 'Whitespace', description: 'Tab key' },
  { key: 'Backspace', code: 'Backspace', keyCode: 8, category: 'Editing', description: 'Backspace key' },
  { key: 'Delete', code: 'Delete', keyCode: 46, category: 'Editing', description: 'Delete key' },
  { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, category: 'Navigation', description: 'Up Arrow' },
  { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, category: 'Navigation', description: 'Down Arrow' },
  { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, category: 'Navigation', description: 'Left Arrow' },
  { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, category: 'Navigation', description: 'Right Arrow' },
  { key: 'Home', code: 'Home', keyCode: 36, category: 'Navigation', description: 'Home key' },
  { key: 'End', code: 'End', keyCode: 35, category: 'Navigation', description: 'End key' },
  { key: 'PageUp', code: 'PageUp', keyCode: 33, category: 'Navigation', description: 'Page Up' },
  { key: 'PageDown', code: 'PageDown', keyCode: 34, category: 'Navigation', description: 'Page Down' },

  // Modifiers
  { key: 'Shift', code: 'ShiftLeft', keyCode: 16, category: 'Modifier', description: 'Left Shift' },
  { key: 'Control', code: 'ControlLeft', keyCode: 17, category: 'Modifier', description: 'Left Control (Ctrl)' },
  { key: 'Alt', code: 'AltLeft', keyCode: 18, category: 'Modifier', description: 'Left Alt / Option' },
  { key: 'Meta', code: 'MetaLeft', keyCode: 91, category: 'Modifier', description: 'Left Meta / Command / Windows' },
  { key: 'CapsLock', code: 'CapsLock', keyCode: 20, category: 'Modifier', description: 'Caps Lock' },

  // Function Keys
  { key: 'F1', code: 'F1', keyCode: 112, category: 'Function', description: 'Function Key F1' },
  { key: 'F2', code: 'F2', keyCode: 113, category: 'Function', description: 'Function Key F2' },
  { key: 'F5', code: 'F5', keyCode: 116, category: 'Function', description: 'Function Key F5 (Reload)' },
  { key: 'F12', code: 'F12', keyCode: 123, category: 'Function', description: 'Function Key F12 (DevTools)' },
]

export function extractKeyInfo(e: KeyboardEvent): KeyInfo {
  return {
    key: e.key,
    code: e.code,
    keyCode: e.keyCode,
    which: e.which,
    location: e.location,
    locationName: LOCATION_MAP[e.location] || `Unknown (${e.location})`,
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
    repeat: e.repeat,
    char: e.key.length === 1 ? e.key : '',
  }
}

export function generateEventCodeSnippets(info: KeyInfo): {
  javascript: string
  react: string
  vue: string
} {
  const isKey = info.key
  const isCode = info.code
  const modifiers = []
  if (info.metaKey) modifiers.push('e.metaKey')
  if (info.ctrlKey) modifiers.push('e.ctrlKey')
  if (info.altKey) modifiers.push('e.altKey')
  if (info.shiftKey) modifiers.push('e.shiftKey')

  const modCheck = modifiers.length > 0 ? `${modifiers.join(' && ')} && ` : ''

  const javascript = `window.addEventListener('keydown', (event) => {
  if (${modCheck}event.code === '${isCode}') {
    event.preventDefault();
    console.log('${isKey} pressed!');
  }
});`

  const react = `import { useEffect } from 'react';

export function useKeyboardShortcut() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (${modCheck}event.code === '${isCode}') {
        event.preventDefault();
        console.log('Action triggered by ${isKey}');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}`

  const vue = `<!-- Vue 3 Template / Script -->
<script setup>
import { onMounted, onUnmounted } from 'vue'

function onKeyDown(e) {
  if (${modCheck}e.code === '${isCode}') {
    e.preventDefault()
    // Trigger custom action
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>`

  return { javascript, react, vue }
}
