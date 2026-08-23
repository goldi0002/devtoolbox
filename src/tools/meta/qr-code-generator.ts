import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const QR_CODE_GENERATOR_META: ToolMeta = {
  slug: 'qr-code-generator',
  name: 'QR Code Generator',
  category: 'generate-tools',
  tag: 'QR CODE',
  description: 'Create customizable, high-resolution QR codes from text, URLs, Wi-Fi credentials, emails, and phone numbers with instant PNG, SVG, and JPEG download.',
  keywords: [
    'qr code generator',
    'create qr code',
    'url to qr code',
    'wifi qr code',
    'svg qr code generator',
    'png qr code',
    'free qr code maker',
    'offline qr code generator'
  ],
  status: 'stable',
  toolComponent: lazy(() => import('../../components/tools/generate-tools/QrCodeGenerator')),
  seo: {
    title: 'QR Code Generator — Free, Private & High-Resolution Vector SVG / PNG Maker',
    description: 'Generate high-resolution QR codes from URLs, text, Wi-Fi logins, and contact details with customizable colors, error correction, and instant SVG/PNG download.',
    extraKeywords: ['qr code maker online', 'vector qr code generator', 'high resolution qr code', 'client side qr code generator'],
  },
  about: {
    summary: 'The QR Code Generator creates standards-compliant 2D Quick Response barcodes entirely in your browser memory with zero tracking, custom color palettes, and lossless vector SVG exports.',
    useCases: [
      'Generating high-resolution vector QR codes for print media, posters, flyers, and packaging',
      'Creating one-tap Wi-Fi login codes for guests, offices, and coffee shops',
      'Encoding website URLs, product links, app store downloads, and portfolio links',
      'Generating vCard, email mailto, and telephone shortcuts'
    ],
    features: [
      'URL, plain text, Wi-Fi network, email, phone, and SMS presets',
      'Reed-Solomon Error Correction Level selection (L: 7%, M: 15%, Q: 25%, H: 30%)',
      'Custom foreground pattern, background color, and transparent background modes',
      'Lossless vector SVG and high-resolution PNG / JPEG exports (up to 1200x1200px)',
      '100% private in-browser generation with zero telemetry or network calls',
      'One-click Base64 Data URL and raw SVG code copying'
    ],
    notes: [
      'Static QR codes contain your data directly and will never expire',
      'All image and vector rendering is done strictly in client-side memory'
    ],
    tip: 'Use SVG export for physical print and signage to ensure perfectly crisp edges at any print size.'
  }
}
