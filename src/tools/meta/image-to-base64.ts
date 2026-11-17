import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const IMAGE_TO_BASE64_META: ToolMeta = {
  slug: 'image-to-base64',
  name: 'Image to Base64 / Data URI',
  description: 'Turn an image or small file into Base64, a Data URI, a CSS background-image rule or an HTML img tag, and decode a Data URI back to a preview and file.',
  category: 'encode-tools',
  tag: 'encode',
  icon: 'Image',
  keywords: [
    'image to base64',
    'image base64',
    'base64 image',
    'data uri',
    'data url',
    'image data uri',
    'png to base64',
    'jpg to base64',
    'base64 image converter',
    'css background image base64',
    'html img base64',
    'decode data uri',
    'data uri to image',
  ],
  toolComponent: lazy(() => import('../../components/tools/encode-tools/ImageToBase64')),
  about: {
    summary: 'Image to Base64 reads a file in your browser and encodes it as a Base64 string and as a full Data URI. It also writes ready-to-paste CSS background-image and HTML img snippets. Paste a Data URI in reverse mode to preview an image and download the decoded file. Nothing is uploaded.',
    useCases: [
      'Inlining a small icon or logo into CSS, HTML or an email template.',
      'Building a Data URI for a fixture, mock or test payload.',
      'Checking the MIME type and size a file will have once encoded.',
      'Recovering an image from a Data URI copied out of a page or JSON response.',
    ],
    features: [
      'Accepts images and any other small file; the MIME type comes from the file.',
      'Outputs raw Base64, a full Data URI, a CSS background-image rule and an HTML img tag, each with a copy button.',
      'Shows the MIME type, original size and encoded Base64 size.',
      'Warns when a file is over 256 KB, because Base64 grows the text by about a third.',
      'Reverse mode previews base64 image Data URIs and downloads the decoded file.',
    ],
    tip: 'Inline only small images. For anything over a few kilobytes, a separate file with caching is usually faster for the page than a Data URI.',
    notes: [
      'Only base64 Data URIs can be decoded. Percent-encoded URIs such as data:image/svg+xml,%3Csvg… are reported as unsupported.',
    ],
  },
  addedAt: '2026-11-17',
  complexity: 'simple',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Image to Base64 & Data URI converter online — Free',
    description: 'Convert an image to a Base64 string, Data URI, CSS background-image or HTML img tag, and decode Data URIs back to files. 100% client-side and private.',
    extraKeywords: [
      'image to data uri',
      'base64 image generator',
      'convert image to base64 online',
      'data uri generator',
      'decode base64 image',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Pick a file',
        text: 'Choose Encode file, then drop a file onto the area or use the file picker. The file is read in your browser and nothing is uploaded.',
      },
      {
        name: 'Check the size and MIME type',
        text: 'The panel shows the MIME type taken from the file, its original size and the size of the Base64 text. A warning appears above 256 KB.',
      },
      {
        name: 'Copy the output you need',
        text: 'Use Raw Base64 for a bare string, Data URI for a full src value, CSS background-image for a stylesheet rule, or HTML img tag for markup. Each block has its own copy button.',
      },
      {
        name: 'Decode a Data URI',
        text: 'Switch to Decode Data URI and paste a base64 Data URI. Image types show a preview, and Download saves the decoded file using an extension that matches its MIME type.',
      },
    ],
    faqs: [
      {
        question: 'Does the file get uploaded?',
        answer: 'No. The file is read with the browser FileReader API, encoded locally, and the output stays on the page.',
      },
      {
        question: 'Why is my Base64 longer than the file?',
        answer: 'Base64 stores every 3 bytes as 4 ASCII characters, so the text is about 33% larger than the binary. The Base64 size stat shows the exact length.',
      },
      {
        question: 'What MIME type does a file without an extension get?',
        answer: 'The browser reports the MIME type it knows for the file. When it reports none, the Data URI uses application/octet-stream.',
      },
      {
        question: 'Why does decoding reject my Data URI?',
        answer: 'The tool decodes only base64 Data URIs, which are marked with ";base64". It also rejects characters outside the Base64 alphabet and payloads with an impossible length. Percent-encoded URIs, such as many inline SVGs, are not supported.',
      },
    ],
    example: {
      title: 'Encode a two-byte text file.',
      input: 'hi.txt containing: Hi',
      output: 'data:text/plain;base64,SGk=',
      inputLabel: 'File',
      outputLabel: 'Data URI',
    },
  },
}
