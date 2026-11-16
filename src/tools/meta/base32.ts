import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const BASE32_META: ToolMeta = {
  slug: 'base32',
  name: 'Base32 Encoder / Decoder',
  description: 'Encode text to RFC 4648 Base32 or decode Base32 back to text, with optional padding.',
  category: 'encode-tools',
  tag: 'encode',
  icon: 'Binary',
  keywords: [
    'base32 encoder',
    'base32 decoder',
    'base32 encode',
    'base32 decode',
    'rfc 4648 base32',
    'base32 converter',
    'base32 online',
    'totp secret base32',
  ],
  toolComponent: lazy(() => import('../../components/tools/encode-tools/Base32Tool')),
  about: {
    summary:
      'Base32 encodes bytes using the 32 characters A–Z and 2–7, defined in RFC 4648. It is case-insensitive and avoids characters that are easy to confuse, which is why it is used for TOTP secrets in authenticator apps and in some identifiers. This tool encodes UTF-8 text to Base32 and decodes Base32 back to text in your browser.',
    useCases: [
      'Reading the text behind a Base32 string from a config file or API',
      'Encoding a test value for code that expects RFC 4648 Base32',
      'Checking whether a string is valid Base32 before using it',
      'Comparing padded and unpadded Base32 output',
    ],
    features: [
      'Encode UTF-8 text to standard RFC 4648 Base32',
      'Decode Base32 back to UTF-8 text',
      'Optional "=" padding when encoding',
      'Decoding accepts lower case, spaces and missing padding',
      'Clear errors for invalid characters, misplaced padding and impossible lengths',
      'Swap the output back into the input to convert the other way',
    ],
    tip: 'Like Base64, Base32 is an encoding, not encryption. Anyone can decode it.',
  },
  addedAt: '2026-11-16',
  complexity: 'simple',
  featured: false,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Base32 Encoder & Decoder — RFC 4648 Base32 online',
    description: 'Encode text to RFC 4648 Base32 or decode Base32 back to text. Optional padding, clear validation errors. Free and 100% in your browser.',
    extraKeywords: ['base32 encoder', 'base32 decoder', 'rfc 4648 base32', 'base32 online'],
  },
  guide: {
    steps: [
      {
        name: 'Pick encode or decode',
        text: 'Choose Encode to turn text into Base32, or Decode to turn a Base32 string back into text.',
      },
      {
        name: 'Enter your input',
        text: 'Type or paste text or Base32. The result updates as you type. When decoding, lower case, spaces and missing "=" padding are accepted.',
      },
      {
        name: 'Choose padding',
        text: 'When encoding, untick "Add = padding" if the system you are feeding expects unpadded Base32.',
      },
      {
        name: 'Copy or swap',
        text: 'Copy the result, or press Swap to move it into the input and convert in the other direction.',
      },
    ],
    faqs: [
      {
        question: 'Which Base32 alphabet does this use?',
        answer: 'The standard RFC 4648 alphabet: A–Z followed by 2–7. It does not support the "base32hex", Crockford or z-base-32 variants.',
      },
      {
        question: 'Why does Base32 output end with =?',
        answer: 'Base32 encodes five bytes into eight characters. When the input is not a multiple of five bytes, "=" pads the last group to eight characters. Many systems, such as TOTP secrets, omit it.',
      },
      {
        question: 'Why do I get "not valid UTF-8 text" when decoding?',
        answer: 'The Base32 string is valid but its bytes are binary data rather than text, for example a raw TOTP secret key. This tool only shows decoded text.',
      },
      {
        question: 'How much larger is Base32 than the original?',
        answer: 'About 60% larger, because every five bytes become eight characters. Base64 is more compact at about 33%.',
      },
    ],
    example: {
      title: 'Encode a word to padded Base32.',
      input: 'foobar',
      output: 'MZXW6YTBOI======',
      inputLabel: 'Plain text',
      outputLabel: 'Base32',
    },
  },
}
