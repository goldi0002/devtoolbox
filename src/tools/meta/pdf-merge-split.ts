import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const PDF_MERGE_SPLIT_META: ToolMeta = {
  slug: 'pdf-merge-split',
  name: 'PDF Merge & Split',
  description: 'Merge several PDFs into one, or extract and reorder pages from a PDF. Files stay on your device; nothing is uploaded.',
  category: 'web-tools',
  tag: 'pdf',
  icon: 'FileText',
  keywords: [
    'merge pdf',
    'combine pdf',
    'split pdf',
    'extract pdf pages',
    'pdf page extractor',
    'join pdf files',
    'reorder pdf pages',
    'pdf merger',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/PdfMergeSplit')),
  about: {
    summary: 'PDF Merge & Split joins several PDF files into one document, or builds a new PDF from the pages you pick out of an existing one. The work is done by a PDF library running in your browser, so your documents are never uploaded to a server.',
    useCases: [
      'Combining a cover letter, CV and certificates into one PDF.',
      'Pulling a few pages out of a long report to share.',
      'Putting scanned pages in a different order.',
      'Merging invoices or receipts for one expense claim.',
    ],
    features: [
      'Merge two or more PDFs, with up and down buttons to set the order.',
      'Extract pages with a range such as 1-3, 5, 8- (8 to the last page).',
      'Pages come out in the order you type them, and a page can be repeated.',
      'Shows the page count of each file; download the result as a new PDF.',
    ],
    tip: 'To reverse or reorder pages, type them in the order you want, for example 3, 2, 1 for a three-page file.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'PDF Merge & Split — Combine and extract PDF pages in your browser',
    description: 'Merge PDFs into one file or extract pages from a PDF. Private: your files are processed in your browser and never uploaded.',
    extraKeywords: [
      'merge pdf online',
      'combine pdf files',
      'split pdf online',
      'extract pages from pdf',
      'private pdf merger',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Choose Merge or Extract pages',
        text: 'Use Merge to join several PDFs. Use Extract pages to make a new PDF from selected pages of one PDF.',
      },
      {
        name: 'Add your PDF files',
        text: 'Pick one or more PDFs. Each file shows its page count. Files that cannot be read, such as damaged or password-protected PDFs, show an error.',
      },
      {
        name: 'Set the order or the pages',
        text: 'When merging, use Move up and Move down to order the files, or Remove to drop one. When extracting, type the pages, for example 1-3, 5. Pages keep the order you write them in.',
      },
      {
        name: 'Create and download',
        text: 'Press Merge PDFs or Extract pages, then use the Download link. The new PDF is built in your browser.',
      },
    ],
    faqs: [
      {
        question: 'Are my PDFs uploaded?',
        answer: 'No. The files are read and combined in your browser and never leave your device.',
      },
      {
        question: 'What page range formats work?',
        answer: 'Single pages (5), ranges (1-3), an open-ended range (8- for page 8 to the end) and any mix separated by commas. Pages start at 1, and ranges must go upward, so write 2-4 rather than 4-2.',
      },
      {
        question: 'Can I extract pages in a different order or repeat a page?',
        answer: 'Yes. The new PDF follows the order you type, so 3, 1, 1 gives page 3, then page 1, then page 1 again.',
      },
      {
        question: 'Why can a PDF not be opened?',
        answer: 'Password-protected (encrypted) and damaged files cannot be read. Remove the password first, then add the file again.',
      },
    ],
    example: {
      title: 'Keep pages 1 to 3 and page 5 of an 8-page report.',
      input: 'report.pdf (8 pages)\nPages: 1-3, 5',
      output: 'report-pages.pdf: pages 1, 2, 3, 5',
      inputLabel: 'File and pages',
      outputLabel: 'Result',
    },
  },
}
