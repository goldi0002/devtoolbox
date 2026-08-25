import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const QR_CODE_SCANNER_META: ToolMeta = {
  slug: 'qr-code-scanner',
  name: 'QR Code Scanner',
  category: 'analyze-tools',
  tag: 'QR CODE',
  description: 'Scan and decode QR codes from your webcam or by uploading image files (PNG, JPEG, WebP, SVG) completely offline and in-browser.',
  keywords: [
    'qr code scanner',
    'scan qr code',
    'decode qr code',
    'qr reader',
    'online qr code scanner',
    'camera qr scanner',
    'upload qr code',
    'offline qr reader'
  ],
  status: 'stable',
  complexity: 'moderate',
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/analyze-tools/QrCodeScanner')),
  seo: {
    title: 'QR Code Scanner — Free, Private Camera & File QR Decoder',
    description: 'Scan and decode QR codes instantly using your device camera or uploaded image files. 100% private, client-side decoding with zero tracking.',
    extraKeywords: ['qr code reader online', 'webcam qr scanner', 'decode qr from image', 'private qr code scanner'],
  },
  about: {
    summary: 'The QR Code Scanner provides instant, privacy-first Quick Response code decoding directly in your web browser. It supports dual modes: live camera streaming with high-speed pattern detection and instant drag-and-drop file analysis, operating fully client-side without sending your data to any remote server.',
    useCases: [
      'Scanning QR codes from printed documents, packaging, or digital screens using your webcam',
      'Decoding QR code images from your device, including screenshots, email attachments, and downloads',
      'Inspecting and copying encoded data, URLs, contact credentials, or Wi-Fi configurations safely',
      'Inspecting the raw payload of suspicious QR codes before opening them in a web browser'
    ],
    features: [
      'Dual-mode operation: Live video feed scanning and image file upload scanner',
      'Drag-and-drop file upload supporting PNG, JPG, JPEG, SVG, WebP, and GIF',
      'Real-time, continuous webcam decoding with customizable camera device selection',
      'Automatic classification of decoded contents (URL, Wi-Fi, vCard/Contact, Email, Phone, SMS, Geo, Plain Text)',
      'Instant action buttons: One-click "Copy to Clipboard", "Open URL" (with safety checks), or "Go to QR Code Generator"',
      '100% private in-browser decoding with zero tracking, external telemetry, or network traffic'
    ],
    notes: [
      'Camera access permissions are handled locally by your web browser and are never transmitted over the network',
      'Images processed for scanning are rendered onto a temporary hidden canvas in memory and are discarded immediately after decoding'
    ],
    tip: 'Ensure proper lighting and keep the QR code centered and flat for the fastest webcam decoding response.'
  }
}
