import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const FAVICON_GENERATOR_META: ToolMeta = {
  slug: 'favicon-generator',
  name: 'Favicon Generator',
  description: 'Turn one PNG, JPG or SVG into favicon PNGs, a multi-size favicon.ico, HTML link tags and a site.webmanifest. Files never leave your device.',
  category: 'web-tools',
  tag: 'image',
  icon: 'Image',
  keywords: [
    'favicon generator',
    'favicon maker',
    'favicon.ico generator',
    'apple touch icon generator',
    'png to ico',
    'svg to favicon',
    'site.webmanifest generator',
    'android chrome icon',
    'web app icons',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/FaviconGenerator')),
  about: {
    summary: 'The Favicon Generator takes one image and produces the icon set a website needs: PNG icons at 16, 32, 48, 180, 192 and 512 pixels, a favicon.ico that holds the 16, 32 and 48 pixel sizes, the HTML link tags and a site.webmanifest file. Resizing happens in your browser with a canvas, so the image is never uploaded.',
    useCases: [
      'Creating the favicon set for a new website from a logo.',
      'Adding an apple-touch-icon for iOS home screen shortcuts.',
      'Generating the Android icons referenced by a web app manifest.',
      'Getting every icon file and the matching HTML in one ZIP download.',
    ],
    features: [
      'Accepts PNG, JPEG and SVG. SVGs are drawn at each size, so they stay sharp.',
      'Previews of every PNG size, with a download for each file.',
      'A favicon.ico with 16, 32 and 48 pixel images stored inside it.',
      'One-click ZIP with all icon files and the manifest.',
      'Copy buttons for the link tags and the manifest, with a base path field for where the files will be hosted.',
    ],
    tip: 'Start from a square source of at least 512 × 512 pixels. Images that are not square are centred with transparent space around them.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Favicon Generator — Make favicon.ico, PNG icons and site.webmanifest',
    description: 'Create favicon PNGs (16 to 512 px), favicon.ico, apple-touch-icon and site.webmanifest from one image. Private: processed in your browser.',
    extraKeywords: [
      'favicon generator online',
      'create favicon from png',
      'favicon ico maker',
      'svg favicon generator',
      'private favicon generator',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Upload an image',
        text: 'Choose a PNG, JPEG or SVG file with the file picker. Use a square image if you can, because non-square images are centred with transparent space around them.',
      },
      {
        name: 'Set the site name and base path',
        text: 'The site name goes into the manifest. The base path is the folder the icons will be served from, such as / for the site root. The link tags use it in their href values.',
      },
      {
        name: 'Check the previews',
        text: 'Each PNG size is shown with its file name. The favicon.ico card lists the 16, 32 and 48 pixel images it contains.',
      },
      {
        name: 'Download the files',
        text: 'Download single files, or use Download all as ZIP to get every icon and the manifest together. Upload them to the folder you chose in the base path.',
      },
      {
        name: 'Paste the HTML and manifest',
        text: 'Copy the link tags into the head of your page, and save the site.webmanifest snippet as a file next to the icons.',
      },
    ],
    faqs: [
      {
        question: 'Are my images uploaded?',
        answer: 'No. The image is drawn onto canvases in your browser, and the PNG, ICO and ZIP files are built there too. Nothing is sent to a server.',
      },
      {
        question: 'Why does the SVG look different at small sizes?',
        answer: 'The SVG is drawn again at each size rather than scaled from one bitmap, so it stays sharp. Very thin lines and small details can still vanish at 16 pixels, so check the 16 pixel preview.',
      },
      {
        question: 'What is in favicon.ico?',
        answer: 'Three PNG images at 16, 32 and 48 pixels, stored in one ICO container. Modern browsers read the PNG-in-ICO format directly. The 180, 192 and 512 pixel sizes are separate PNG files.',
      },
      {
        question: 'Where do the link tags go?',
        answer: 'Inside the <head> element of every page. Change the base path if the icons are not in the site root.',
      },
    ],
    example: {
      title: 'Build the icon set from a 1024 × 1024 logo.',
      input: 'logo.png, 1024 × 1024 px\nSite name: My Site\nBase path: /',
      output: [
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-48x48.png',
        'apple-touch-icon.png (180 × 180)',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'favicon.ico (16, 32 and 48 px inside)',
        'site.webmanifest',
      ].join('\n'),
      inputLabel: 'Image and settings',
      outputLabel: 'Files in the ZIP',
    },
  },
}
