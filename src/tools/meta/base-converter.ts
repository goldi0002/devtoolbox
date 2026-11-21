import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const BASE_CONVERTER_META: ToolMeta = {
  slug: 'base-converter',
  name: 'Number Base Converter',
  category: 'data-tools',
  tag: 'NUMBERS',
  description: 'Convert numbers across Decimal, Binary, Hexadecimal, Octal, and custom bases (Base 2-36) with two\'s complement details.',
  keywords: ['base converter', 'binary to hex', 'hex to decimal', 'octal converter', 'two\'s complement calculator', 'radix converter'],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/BaseConverter')),
  guide: {
    "steps": [
      {
        "name": "Enter a value",
        "text": "Type a number into Input Value, for example 255 or DEADBEEF."
      },
      {
        "name": "Pick the source base",
        "text": "Choose Decimal, Hexadecimal, Binary or Octal under Source Base. A hexadecimal value may start with 0x."
      },
      {
        "name": "Read the conversions",
        "text": "Decimal, hexadecimal, binary in 4-bit groups, octal and a custom base (set with Custom Base, from 2 to 36) update as you type."
      },
      {
        "name": "Check the bit patterns",
        "text": "The Low-Level Binary & Two's Complement section shows 8-, 16- and 32-bit patterns, the bits required and an ASCII preview."
      }
    ],
    "faqs": [
      {
        "question": "Are negative numbers supported?",
        "answer": "Yes. A minus sign is kept on the decimal, binary, hexadecimal, octal and custom results, and the two's complement views show the 8-, 16- and 32-bit patterns."
      },
      {
        "question": "Is there a size limit?",
        "answer": "There is no fixed limit. The converter uses BigInt, so integers of arbitrary size are supported."
      },
      {
        "question": "When does the ASCII preview show a character?",
        "answer": "Only for values from 32 to 126 (printable ASCII). Other values show N/A."
      },
      {
        "question": "Which digits does the custom base use?",
        "answer": "Digits 0 to 9 and letters A to Z, up to base 36. The custom result is written in uppercase."
      }
    ],
    "example": {
      "title": "Convert decimal 255 to hexadecimal.",
      "input": "255",
      "output": "0xFF (hexadecimal)",
      "inputLabel": "Input value (Decimal)",
      "outputLabel": "Result"
    }
  },
  seo: {
    title: 'Number Base Converter — Decimal, Binary, Hex & Octal Tool',
    description: 'Convert numbers between Decimal, Hexadecimal, Binary (with 4-bit nibbles), Octal, and custom bases (2 to 36) with two\'s complement binary representations.',
    extraKeywords: ['radix converter', 'hex converter', 'binary to decimal online', 'twos complement 8 16 32 bit', 'bigint base converter'],
  },
  about: {
    summary: 'The Number Base Converter provides simultaneous multi-radix conversions for integers of arbitrary size with low-level binary representations and two\'s complement formats.',
    useCases: [
      'Translating memory addresses and register values from Hex to Decimal or Binary',
      'Inspecting binary bit flags and byte offsets in low-level systems programming',
      'Converting colors and character codes into hex or octal representations',
      'Calculating two\'s complement bit patterns for negative integers'
    ],
    features: [
      'Simultaneous real-time conversion for Decimal, Hex, Binary, and Octal',
      'Custom Radix support from Base 2 up to Base 36',
      'Low-level 8-bit, 16-bit, and 32-bit Two\'s Complement representation',
      'Printable ASCII character inspection'
    ],
    notes: [
      'Handles arbitrary precision BigInt values for large integers',
      'Binary output is grouped into 4-bit nibbles for high readability'
    ],
    tip: 'Click presets like 255 (0xFF) or 0xDEADBEEF to quickly test common computer science numeric constants.'
  }
}
