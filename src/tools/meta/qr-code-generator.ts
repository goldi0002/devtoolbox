import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const QR_CODE_GENERATOR_META: ToolMeta = {
  slug: 'qr-code-generator',
  name: 'QR Code Generator',
  category: 'generate-tools',
  tag: 'QR CODE',
  description: '100% Safe & Secure QR Code Generator. Create infinite vector QR codes (SVG, EPS) and high-res PNGs with transparent background, custom shapes, and zero tracking.',
  keywords: [
    'safe qr code generator',
    'secure qr code generator',
    'qr code vector generator',
    'eps qr code generator',
    'qr code generator eps vector',
    'vectorize qr code',
    'create vector qr code',
    'qr code svg generator',
    'qr code generator svg download',
    'qr generator svg',
    'qr code generator transparent',
    'transparent qr code generator',
    'qr code generator svg free',
    'qr code generator svg free download',
    'qr code generator png',
    'generate qr code png',
    'free qr code generator vector',
    'cod qr generator',
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
    title: 'Safe QR Code Generator — Free Vector (SVG, EPS) & Transparent PNG Maker',
    description: 'Safe & private QR code generator. Export infinite vector SVG & EPS for Adobe Illustrator / print, transparent PNGs, and custom shapes. 100% static, never expires, zero tracking.',
    extraKeywords: [
      'safe qr code generator',
      'secure qr code generator',
      'eps qr code generator',
      'qr code vector generator',
      'vectorize qr code',
      'create vector qr code',
      'qr code generator transparent',
      'transparent qr code generator',
      'qr code svg generator',
      'qr code generator svg download',
      'qr code generator eps vector',
      'generate qr code png',
      'qr code generator png',
      'free qr code generator vector',
      'cod qr generator',
      'vector qr code maker',
      'high resolution qr code',
      'client side qr code generator'
    ],
  },
  about: {
    summary: 'The Safe QR Code Generator creates 100% private, standards-compliant 2D Quick Response barcodes directly in your browser memory. Unlike shady QR services that redirect via tracked middleman links, ToolBox4Devs creates permanent, static QR codes that never expire. Export infinite vector SVG & EPS for print, high-resolution PNG with transparent background, and custom module shapes.',
    useCases: [
      'Exporting pure vector EPS & SVG files for Adobe Illustrator, InDesign, packaging, signage, and billboards',
      'Generating transparent background QR codes for dark UI themes, overlay flyers, and graphic templates',
      'Creating safe, static QR codes that encode your raw link directly without third-party redirect middleman tracking',
      'Generating instant one-tap Wi-Fi network login QR codes for offices, shops, and smart homes',
      'Creating digital vCard contact cards, email mailto, telephone shortcuts, and crypto wallet payment codes',
      'Exporting 4K (4096px) ultra-sharp PNG and JPEG rasters for physical merchandise and printing'
    ],
    features: [
      '100% Safe, private, and offline — runs exclusively in browser memory with zero tracking or redirects',
      'Lossless Vector exports: SVG and Encapsulated PostScript (EPS) compatible with Illustrator and CorelDRAW',
      'Transparent background support with live checkerboard preview for seamless graphic design placement',
      'Custom module shapes: Squares, Smooth Dots / Circles, Rounded Smooth, Squircles, and Diamonds',
      'Corner Eye Frame customization: Square, Rounded Smooth, and Circular Target eyes',
      'High-resolution PNG / JPEG raster exports from 512px up to 4096px 4K print-ready resolution',
      'ISO/IEC 18004 standards-compliant Reed-Solomon Error Correction Levels (L: 7%, M: 15%, Q: 25%, H: 30%)',
      'Preset payload builders: URL, Plain Text, Wi-Fi (WPA3/WPA2/Open), vCard Contact, Email, Phone, SMS, Crypto, Geo',
      'Direct one-click copy for Raw SVG markup, EPS vector code, and Base64 Data URL'
    ],
    notes: [
      'Static QR codes contain your data directly and will never expire or require subscriptions',
      'All vector and raster rendering is performed strictly in client-side memory'
    ],
    tip: 'Choose SVG or EPS export when sending files to a print shop or professional designer. Vector formats can be scaled to billboard size with zero loss in sharpness.'
  }
}
