import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const HEX_CONVERTER_META: ToolMeta = {
    slug: 'hex-converter',
    name: 'Hex Converter',
    description: 'Convert text to hexadecimal and hexadecimal back to text.',
    category: 'encode-tools',
    tag: 'encode',
    toolComponent: lazy(() => import('../../components/tools/encode-tools/HexConverter')),
    keywords: [
        'hex converter',
        'text to hex',
        'hex to text',
        'hexadecimal converter',
        'string to hex'
    ],
    about: {
        summary: 'Convert regular text strings to hexadecimal representation and vice-versa.',
        useCases: ['Encoding payloads', 'Decoding hex strings from logs'],
        features: ['Text to Hex', 'Hex to Text', 'Client-side processing']
    },
    isNew: true,
    status: 'stable',
    seo: {
        title: 'Hex to Text Converter — Encode & Decode Hexadecimal Online',
        description: 'Convert text to hexadecimal and hex back to readable text instantly. Free hex encoder and decoder that runs entirely in your browser.',
    },
    guide: {
      "steps": [
        {
          "name": "Enter your input",
          "text": "Type or paste plain text, or a hex string such as 48 69 21. Spaces and line breaks in hex input are ignored."
        },
        {
          "name": "Pick a direction",
          "text": "Click Text to Hex to encode the text as UTF-8 bytes, or Hex to Text to decode hex back into text."
        },
        {
          "name": "Copy the result",
          "text": "The output appears below the input. Text to Hex writes each byte as two lowercase digits separated by spaces."
        }
      ],
      "faqs": [
        {
          "question": "How are non-English characters converted?",
          "answer": "Text is encoded as UTF-8 first, so characters outside ASCII become several bytes. For example ✓ becomes e2 9c 93."
        },
        {
          "question": "Why do I get \"length must be even\"?",
          "answer": "Every byte is two hex digits, so after spaces are removed the hex must have an even number of characters. A missing or extra digit causes this error."
        },
        {
          "question": "What does a � in the decoded text mean?",
          "answer": "The bytes are not valid UTF-8 text, for example binary data. Each invalid sequence is shown as the replacement character �."
        },
        {
          "question": "Can I use a 0x prefix?",
          "answer": "No. Only the digits 0–9 and a–f (either case) and whitespace are accepted, so remove 0x prefixes and commas first."
        }
      ],
      "example": {
        "title": "Encode text containing a non-ASCII character.",
        "input": "Hi ✓",
        "output": "48 69 20 e2 9c 93",
        "inputLabel": "Text",
        "outputLabel": "Hex (UTF-8 bytes)"
      }
    },
}
