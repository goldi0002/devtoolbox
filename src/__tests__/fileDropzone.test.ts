import { describe, it, expect } from 'vitest'
import { checkFiles, formatLimit, matchesAccept, parseAccept } from '../utils/fileDropzone'

// The helpers only read name, type and size, so a plain object stands in for File in node.
function fakeFile(name: string, type = '', size = 10): File {
  return { name, type, size } as unknown as File
}

describe('parseAccept', () => {
  it('splits, trims and lowercases tokens and drops empties', () => {
    expect(parseAccept(' .PNG , image/* ,, application/pdf ')).toEqual(['.png', 'image/*', 'application/pdf'])
  })

  it('returns an empty list for a missing or blank accept', () => {
    expect(parseAccept(undefined)).toEqual([])
    expect(parseAccept('  ')).toEqual([])
  })
})

describe('matchesAccept', () => {
  it('matches extensions case-insensitively', () => {
    expect(matchesAccept(fakeFile('Logo.SVG', ''), '.svg')).toBe(true)
    expect(matchesAccept(fakeFile('notes.txt', ''), '.svg')).toBe(false)
  })

  it('matches exact MIME types', () => {
    expect(matchesAccept(fakeFile('a.bin', 'application/pdf'), 'application/pdf')).toBe(true)
    expect(matchesAccept(fakeFile('a.bin', 'application/zip'), 'application/pdf')).toBe(false)
  })

  it('matches wildcard MIME types such as image/*', () => {
    expect(matchesAccept(fakeFile('photo', 'image/jpeg'), 'image/*')).toBe(true)
    expect(matchesAccept(fakeFile('photo', 'video/mp4'), 'image/*')).toBe(false)
    expect(matchesAccept(fakeFile('photo', ''), 'image/*')).toBe(false)
  })

  it('accepts a file when any token matches, so extension and MIME can be mixed', () => {
    const accept = '.svg,image/svg+xml'
    expect(matchesAccept(fakeFile('icon.svg', ''), accept)).toBe(true)
    expect(matchesAccept(fakeFile('icon', 'image/svg+xml'), accept)).toBe(true)
    expect(matchesAccept(fakeFile('icon.png', 'image/png'), accept)).toBe(false)
  })

  it('accepts everything when no accept list is given', () => {
    expect(matchesAccept(fakeFile('anything.xyz', ''), undefined)).toBe(true)
    expect(matchesAccept(fakeFile('anything.xyz', ''), '')).toBe(true)
  })
})

describe('formatLimit', () => {
  it('formats megabytes and kilobytes', () => {
    expect(formatLimit(5 * 1024 * 1024)).toBe('5 MB')
    expect(formatLimit(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatLimit(512 * 1024)).toBe('512 KB')
  })
})

describe('checkFiles', () => {
  it('accepts matching files that are within the size limit', () => {
    const files = [fakeFile('a.png', 'image/png', 100), fakeFile('b.png', 'image/png', 200)]
    const result = checkFiles(files, { accept: 'image/*', multiple: true, maxBytes: 1000 })
    expect(result.accepted).toEqual(files)
    expect(result.errors).toEqual([])
  })

  it('rejects a file whose type does not match with a clear message', () => {
    const result = checkFiles([fakeFile('notes.txt', 'text/plain', 10)], { accept: 'image/*' })
    expect(result.accepted).toEqual([])
    expect(result.errors).toEqual(['notes.txt is not a supported file type.'])
  })

  it('rejects a file over maxBytes with the default message naming the limit', () => {
    const result = checkFiles([fakeFile('big.png', 'image/png', 6 * 1024 * 1024)], { accept: 'image/*', maxBytes: 5 * 1024 * 1024 })
    expect(result.accepted).toEqual([])
    expect(result.errors).toEqual(['big.png is larger than 5 MB. Choose a smaller file.'])
  })

  it('uses a custom tooLargeMessage when given', () => {
    const result = checkFiles([fakeFile('big.svg', '', 6 * 1024 * 1024)], {
      maxBytes: 5 * 1024 * 1024,
      tooLargeMessage: 'This file is larger than 5 MB. Choose a smaller SVG.',
    })
    expect(result.errors).toEqual(['This file is larger than 5 MB. Choose a smaller SVG.'])
  })

  it('keeps the valid files and reports only the invalid ones', () => {
    const good = fakeFile('ok.png', 'image/png', 10)
    const result = checkFiles([good, fakeFile('bad.txt', 'text/plain', 10)], { accept: 'image/*', multiple: true })
    expect(result.accepted).toEqual([good])
    expect(result.errors).toHaveLength(1)
  })

  it('ignores extra files when multiple is false', () => {
    const first = fakeFile('first.pdf', 'application/pdf', 10)
    const result = checkFiles([first, fakeFile('second.pdf', 'application/pdf', 10)], {
      accept: 'application/pdf',
      multiple: false,
    })
    expect(result.accepted).toEqual([first])
    expect(result.errors).toEqual([])
  })

  it('reports an invalid first file without falling through to a later file when multiple is false', () => {
    const result = checkFiles([fakeFile('bad.txt', 'text/plain', 10), fakeFile('good.png', 'image/png', 10)], {
      accept: 'image/*',
      multiple: false,
    })
    expect(result.accepted).toEqual([])
    expect(result.errors).toEqual(['bad.txt is not a supported file type.'])
  })

  it('reports an identical message only once', () => {
    const result = checkFiles([fakeFile('a.txt', '', 1), fakeFile('a.txt', '', 1)], { accept: '.png', multiple: true })
    expect(result.errors).toHaveLength(1)
  })
})
