import { describe, it, expect } from 'vitest'
import { MAX_TEXT_FILE_BYTES, decodeTextBytes, fileSizeError, readTextFile } from '../utils/textFile'

const bytes = (text: string) => new TextEncoder().encode(text)

describe('fileSizeError', () => {
  it('accepts files up to the limit', () => {
    expect(fileSizeError('a.txt', 0)).toBe('')
    expect(fileSizeError('a.txt', MAX_TEXT_FILE_BYTES)).toBe('')
  })

  it('names the file, its size and the limit when it is too large', () => {
    expect(fileSizeError('big.log', 5 * 1024 * 1024)).toBe(
      '"big.log" is 5.0 MB, which is over the 2.0 MB limit for dropped files.',
    )
    expect(fileSizeError('a.txt', 2048, 1024)).toContain('2.0 KB, which is over the 1.0 KB limit')
  })
})

describe('decodeTextBytes', () => {
  it('decodes UTF-8 text including multi-byte characters', () => {
    expect(decodeTextBytes(bytes('héllo ✓ 日本語\nline 2'), 'a.txt')).toEqual({ ok: true, text: 'héllo ✓ 日本語\nline 2' })
  })

  it('accepts an empty file', () => {
    expect(decodeTextBytes(new Uint8Array(), 'empty.txt')).toEqual({ ok: true, text: '' })
  })

  it('strips a UTF-8 byte order mark', () => {
    expect(decodeTextBytes(new Uint8Array([0xef, 0xbb, 0xbf, ...bytes('id,name')]), 'a.csv')).toEqual({ ok: true, text: 'id,name' })
  })

  it('rejects content with NUL bytes', () => {
    const result = decodeTextBytes(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]), 'archive.zip')
    expect(result).toEqual({ ok: false, error: '"archive.zip" does not look like a text file. Drop a UTF-8 text file instead.' })
  })

  it('rejects bytes that are not valid UTF-8', () => {
    expect(decodeTextBytes(new Uint8Array([0xff, 0xfe, 0xfd]), 'photo.jpg').ok).toBe(false)
  })
})

describe('readTextFile', () => {
  it('reads a small text file', async () => {
    expect(await readTextFile(new File(['SELECT 1;'], 'q.sql'))).toEqual({ ok: true, text: 'SELECT 1;' })
  })

  it('refuses an oversized file without reading it', async () => {
    const file = new File(['abcdef'], 'big.txt')
    const result = await readTextFile(file, 5)
    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ error: expect.stringContaining('"big.txt" is 6 B') })
  })

  it('reports binary content as an error instead of throwing', async () => {
    const result = await readTextFile(new File([new Uint8Array([0, 1, 2])], 'blob.bin'))
    expect(result.ok).toBe(false)
  })
})
