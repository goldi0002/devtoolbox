import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { extractedFileName, mergedFileName, moveItem, parsePageRanges } from '../utils/pdfPages'
import { extractPages, mergePdfs, readPdfInfo } from '../utils/pdfTools'
import { PDF_MERGE_SPLIT_META } from '../tools/meta/pdf-merge-split'

async function makePdf(pageCount: number, width = 200): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  // Give each page a distinct width so tests can tell pages apart.
  for (let i = 0; i < pageCount; i++) doc.addPage([width + i, 300])
  return doc.save()
}

async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes)
  return doc.getPages().map(p => p.getWidth())
}

describe('parsePageRanges', () => {
  it('parses pages, ranges and open-ended ranges in order', () => {
    expect(parsePageRanges('1-3, 5', 10)).toEqual({ ok: true, pages: [0, 1, 2, 4] })
    expect(parsePageRanges('8-', 10)).toEqual({ ok: true, pages: [7, 8, 9] })
    expect(parsePageRanges('3,1', 5)).toEqual({ ok: true, pages: [2, 0] })
    expect(parsePageRanges(' 2 - 3 ,, 2', 5)).toEqual({ ok: true, pages: [1, 2, 1] })
  })
  it('rejects bad input with a helpful message', () => {
    expect(parsePageRanges('', 5)).toMatchObject({ ok: false })
    expect(parsePageRanges('a', 5)).toMatchObject({ ok: false, error: '"a" is not a page or range.' })
    expect(parsePageRanges('-3', 5).ok).toBe(false)
    expect(parsePageRanges('0', 5)).toMatchObject({ ok: false, error: 'Pages start at 1.' })
    expect(parsePageRanges('6', 5)).toMatchObject({ ok: false, error: '"6" is outside this PDF, which has 5 pages.' })
    expect(parsePageRanges('1-9', 5).ok).toBe(false)
    expect(parsePageRanges('4-2', 5)).toMatchObject({ ok: false, error: '"4-2" counts backwards. Write it as 2-4.' })
    expect(parsePageRanges('1', 0).ok).toBe(false)
  })
})

describe('moveItem and names', () => {
  it('moves items without changing the original array', () => {
    const items = ['a', 'b', 'c']
    expect(moveItem(items, 0, 1)).toEqual(['b', 'a', 'c'])
    expect(moveItem(items, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(moveItem(items, 1, 99)).toEqual(['a', 'c', 'b'])
    expect(moveItem(items, 5, 0)).toEqual(['a', 'b', 'c'])
    expect(items).toEqual(['a', 'b', 'c'])
  })
  it('names output files', () => {
    expect(mergedFileName()).toBe('merged.pdf')
    expect(extractedFileName('Report.PDF')).toBe('Report-pages.pdf')
    expect(extractedFileName('.pdf')).toBe('document-pages.pdf')
  })
})

describe('PDF operations', () => {
  it('merges documents in order', async () => {
    const a = await makePdf(2, 100) // widths 100, 101
    const b = await makePdf(1, 500) // width 500
    const merged = await mergePdfs([b, a])
    expect(await pageWidths(merged)).toEqual([500, 100, 101])
    expect((await readPdfInfo(merged)).pageCount).toBe(3)
  })
  it('extracts the chosen pages in the chosen order', async () => {
    const src = await makePdf(5, 100) // widths 100..104
    const out = await extractPages(src, [4, 0, 0])
    expect(await pageWidths(out)).toEqual([104, 100, 100])
  })
  it('rejects too few inputs and non-PDF data', async () => {
    const a = await makePdf(1)
    await expect(mergePdfs([a])).rejects.toThrow('at least two')
    await expect(extractPages(a, [])).rejects.toThrow('at least one page')
    await expect(readPdfInfo(new TextEncoder().encode('not a pdf'))).rejects.toThrow('could not be read as a PDF')
  })
})

describe('PDF Merge & Split guide', () => {
  it('example output matches the helpers', () => {
    const example = PDF_MERGE_SPLIT_META.guide?.example
    const result = parsePageRanges('1-3, 5', 8)
    expect(result.ok && result.pages.map(p => p + 1).join(', ')).toBe('1, 2, 3, 5')
    expect(example?.output).toBe(`${extractedFileName('report.pdf')}: pages 1, 2, 3, 5`)
  })
})
