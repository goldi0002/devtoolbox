import { PDFDocument } from 'pdf-lib'

export interface PdfInfo {
  pageCount: number
}

/** Loads a PDF just to read its page count. Throws a readable error for files that are not PDFs. */
export async function readPdfInfo(bytes: Uint8Array): Promise<PdfInfo> {
  const doc = await loadPdf(bytes)
  return { pageCount: doc.getPageCount() }
}

async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes)
  } catch {
    throw new Error('This file could not be read as a PDF. It may be damaged or password protected.')
  }
}

/** Joins the PDFs in the given order into one document. */
export async function mergePdfs(files: readonly Uint8Array[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error('Add at least two PDFs to merge.')
  const out = await PDFDocument.create()
  for (const bytes of files) {
    const doc = await loadPdf(bytes)
    const pages = await out.copyPages(doc, doc.getPageIndices())
    pages.forEach(page => out.addPage(page))
  }
  return out.save()
}

/** Builds a new PDF from the given 0-based pages of one PDF, in the given order. */
export async function extractPages(bytes: Uint8Array, pageIndexes: readonly number[]): Promise<Uint8Array> {
  if (pageIndexes.length === 0) throw new Error('Choose at least one page.')
  const doc = await loadPdf(bytes)
  const out = await PDFDocument.create()
  const pages = await out.copyPages(doc, [...pageIndexes])
  pages.forEach(page => out.addPage(page))
  return out.save()
}
