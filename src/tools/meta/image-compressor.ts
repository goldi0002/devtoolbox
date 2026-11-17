import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const IMAGE_COMPRESSOR_META: ToolMeta = {
  slug: 'image-compressor',
  name: 'Image Compressor & Converter',
  description: 'Compress and convert images to JPEG, WebP, PNG or AVIF with a quality slider and optional resize. Files never leave your device.',
  category: 'web-tools',
  tag: 'image',
  icon: 'Image',
  keywords: [
    'image compressor',
    'compress image',
    'png to webp',
    'jpg to webp',
    'image converter',
    'reduce image size',
    'resize image',
    'webp converter',
    'avif converter',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/ImageCompressor')),
  about: {
    summary: 'The Image Compressor & Converter re-encodes images in your browser to make them smaller. Pick an output format, set the quality, optionally limit the width and height, and download the result. Images are decoded and encoded with the browser\'s own canvas, so nothing is uploaded to any server.',
    useCases: [
      'Shrinking photos before attaching them to an email or ticket.',
      'Converting PNG or JPEG images to WebP for faster web pages.',
      'Resizing large screenshots to a maximum width.',
      'Compressing several images in one go without sending them to an online service.',
    ],
    features: [
      'Output as JPEG, WebP, PNG or AVIF (AVIF only where your browser can encode it).',
      'Quality slider for the lossy formats, plus optional maximum width and height that keep the aspect ratio.',
      'Several files at once, each with its before and after size and the percentage saved.',
      'Per-file download; everything is processed locally.',
    ],
    tip: 'WebP at quality 75-85 is usually a good balance for photos. PNG is lossless, so shrink PNG files by lowering the maximum width instead of the quality.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Image Compressor & Converter — Compress PNG, JPG, WebP, AVIF in your browser',
    description: 'Compress and convert images to JPEG, WebP, PNG or AVIF with a quality slider and optional resize. Private: files are processed in your browser and never uploaded.',
    extraKeywords: [
      'compress png online',
      'compress jpg online',
      'convert png to webp',
      'image size reducer',
      'private image compressor',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Add your images',
        text: 'Choose one or more images with the file picker. JPEG, PNG, WebP and other formats your browser can display are accepted.',
      },
      {
        name: 'Choose format and quality',
        text: 'Pick JPEG, WebP, PNG or AVIF. For the lossy formats, lower the quality slider for smaller files. PNG ignores the slider because it is lossless.',
      },
      {
        name: 'Limit the size if you want',
        text: 'Enter a maximum width and/or height in pixels. Images are scaled down to fit, keeping their proportions, and are never enlarged. Leave both at 0 to keep the original size.',
      },
      {
        name: 'Download the results',
        text: 'Each result shows its new size and the percentage saved. Use Download on the ones you want. A result can be larger than the original, so check the number before using it.',
      },
    ],
    faqs: [
      {
        question: 'Are my images uploaded?',
        answer: 'No. Decoding and re-encoding happen in your browser using a canvas, and the files never leave your device.',
      },
      {
        question: 'Why did AVIF come out as PNG?',
        answer: 'Not every browser can encode AVIF. When yours cannot, it silently produces PNG instead, and the tool tells you so on that result.',
      },
      {
        question: 'Why is my output bigger than the original?',
        answer: 'Re-encoding an already well-compressed image, or converting to PNG, can increase the size. The percentage shows a minus sign in that case. Try a lower quality, a smaller maximum width or a different format.',
      },
      {
        question: 'What happens to transparency and metadata?',
        answer: 'Transparent areas turn white when converting to JPEG, which has no transparency. EXIF and other metadata are not kept, and animated images become a single still frame.',
      },
    ],
    example: {
      title: 'Convert a large PNG to a smaller WebP.',
      input: 'photo.png, 4000 × 3000 px\nFormat: WebP, quality 80, max width 1600',
      output: 'photo-compressed.webp, 1600 × 1200 px',
      inputLabel: 'Image and settings',
      outputLabel: 'Result',
    },
  },
}
