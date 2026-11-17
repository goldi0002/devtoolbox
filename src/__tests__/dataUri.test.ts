import { describe, expect, it } from 'vitest'
import {
  LARGE_FILE_THRESHOLD_BYTES,
  base64FromDataUrl,
  base64Length,
  buildDataUri,
  cssBackgroundImage,
  decodeBase64ToBytes,
  decodedLength,
  extensionForMime,
  htmlImgTag,
  isImageMime,
  isLargeFile,
  normalizeMime,
  parseDataUri,
} from '../utils/dataUri'

describe('base64Length and decodedLength', () => {
  it('computes the padded Base64 length for each remainder', () => {
    expect(base64Length(0)).toBe(0)
    expect(base64Length(1)).toBe(4)
    expect(base64Length(2)).toBe(4)
    expect(base64Length(3)).toBe(4)
    expect(base64Length(4)).toBe(8)
    expect(base64Length(-5)).toBe(0)
    expect(base64Length(Number.NaN)).toBe(0)
  })

  it('matches the real Base64 length of sample bytes', () => {
    for (const size of [1, 2, 3, 10, 100, 1001]) {
      const text = btoa(String.fromCharCode(...new Array(size).fill(65)))
      expect(text.length).toBe(base64Length(size))
    }
  })

  it('recovers the decoded byte count, with and without padding', () => {
    expect(decodedLength('SGk=')).toBe(2)
    expect(decodedLength('SGVsbG8=')).toBe(5)
    expect(decodedLength('SGVsbG8h')).toBe(6)
    expect(decodedLength('QQ')).toBe(1)
    expect(decodedLength('')).toBe(0)
  })
})

describe('isLargeFile threshold', () => {
  it('is 256 KB and warns only above it', () => {
    expect(LARGE_FILE_THRESHOLD_BYTES).toBe(256 * 1024)
    expect(isLargeFile(LARGE_FILE_THRESHOLD_BYTES)).toBe(false)
    expect(isLargeFile(LARGE_FILE_THRESHOLD_BYTES + 1)).toBe(true)
    expect(isLargeFile(0)).toBe(false)
  })
})

describe('MIME helpers', () => {
  it('lower-cases valid types and falls back to octet-stream for empty or malformed ones', () => {
    expect(normalizeMime(' Image/PNG ')).toBe('image/png')
    expect(normalizeMime('')).toBe('application/octet-stream')
    expect(normalizeMime('not a mime')).toBe('application/octet-stream')
    expect(normalizeMime('image/')).toBe('application/octet-stream')
  })

  it('detects image types only', () => {
    expect(isImageMime('image/png')).toBe(true)
    expect(isImageMime('image/svg+xml')).toBe(true)
    expect(isImageMime('text/plain')).toBe(false)
    expect(isImageMime('application/pdf')).toBe(false)
    expect(isImageMime('')).toBe(false)
  })

  it('maps known MIME types to extensions and unknown ones to bin', () => {
    expect(extensionForMime('image/jpeg')).toBe('jpg')
    expect(extensionForMime('image/svg+xml')).toBe('svg')
    expect(extensionForMime('text/plain')).toBe('txt')
    expect(extensionForMime('application/x-unknown')).toBe('bin')
  })
})

describe('buildDataUri and base64FromDataUrl', () => {
  it('builds a base64 Data URI with a normalised MIME type', () => {
    expect(buildDataUri('image/png', 'AAAA')).toBe('data:image/png;base64,AAAA')
    expect(buildDataUri('', 'AAAA')).toBe('data:application/octet-stream;base64,AAAA')
  })

  it('takes the payload after the first comma of a FileReader result', () => {
    expect(base64FromDataUrl('data:text/plain;base64,SGk=')).toBe('SGk=')
    expect(base64FromDataUrl('data:application/octet-stream;base64,')).toBe('')
    expect(base64FromDataUrl('no comma here')).toBe('')
  })
})

describe('parseDataUri', () => {
  it('parses a valid base64 image Data URI', () => {
    const result = parseDataUri('data:image/png;base64,iVBORw0KGgo=')
    expect(result).toEqual({
      ok: true,
      mime: 'image/png',
      base64: 'iVBORw0KGgo=',
      dataUri: 'data:image/png;base64,iVBORw0KGgo=',
    })
  })

  it('accepts surrounding whitespace, an upper-case scheme and extra parameters', () => {
    const result = parseDataUri('  DATA:Text/Plain;charset=utf-8;BASE64,SGk=  ')
    expect(result).toMatchObject({ ok: true, mime: 'text/plain', base64: 'SGk=' })
  })

  it('removes line breaks inside the Base64 payload', () => {
    const result = parseDataUri('data:text/plain;base64,SGVs\nbG8=')
    expect(result).toMatchObject({ ok: true, base64: 'SGVsbG8=' })
  })

  it('round-trips with buildDataUri', () => {
    const uri = buildDataUri('image/gif', 'R0lGODlhAQABAA==')
    expect(parseDataUri(uri)).toMatchObject({ ok: true, mime: 'image/gif', dataUri: uri })
  })

  it('rejects empty input', () => {
    expect(parseDataUri('   ')).toEqual({ ok: false, error: 'Paste a Data URI, for example data:image/png;base64,…' })
  })

  it('rejects text that is not a Data URI', () => {
    expect(parseDataUri('https://example.com/a.png')).toEqual({ ok: false, error: 'A Data URI starts with "data:".' })
  })

  it('rejects a Data URI with no comma', () => {
    expect(parseDataUri('data:image/png;base64')).toMatchObject({ ok: false })
  })

  it('rejects non-base64 Data URIs, such as percent-encoded SVG', () => {
    const result = parseDataUri('data:image/svg+xml,%3Csvg%3E%3C%2Fsvg%3E')
    expect(result).toEqual({
      ok: false,
      error: 'Only base64 Data URIs can be decoded. This one is not marked ";base64".',
    })
  })

  it('rejects a Data URI with no MIME type and no base64 marker', () => {
    expect(parseDataUri('data:,hello')).toMatchObject({ ok: false })
  })

  it('rejects an invalid MIME type', () => {
    expect(parseDataUri('data:not valid/type;base64,SGk=')).toEqual({
      ok: false,
      error: 'The MIME type "not valid/type" is not valid.',
    })
  })

  it('rejects an empty payload', () => {
    expect(parseDataUri('data:image/png;base64,')).toEqual({
      ok: false,
      error: 'The Data URI has no data after the comma.',
    })
  })

  it('rejects characters that are not Base64', () => {
    expect(parseDataUri('data:text/plain;base64,SG$k=')).toMatchObject({ ok: false })
    expect(parseDataUri('data:text/plain;base64,SGk=A')).toMatchObject({ ok: false })
    expect(parseDataUri('data:text/plain;base64,SG k=%')).toMatchObject({ ok: false })
  })

  it('rejects a Base64 payload whose length can never be valid', () => {
    expect(parseDataUri('data:text/plain;base64,A')).toEqual({
      ok: false,
      error: 'The Base64 data has an invalid length.',
    })
  })
})

describe('decodeBase64ToBytes', () => {
  it('decodes Base64 to the original bytes', () => {
    expect(Array.from(decodeBase64ToBytes('SGk=') ?? [])).toEqual([72, 105])
  })

  it('round-trips every byte value', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i)
    const text = btoa(String.fromCharCode(...bytes))
    expect(Array.from(decodeBase64ToBytes(text) ?? [])).toEqual(Array.from(bytes))
  })

  it('returns null for text that is not valid Base64', () => {
    expect(decodeBase64ToBytes('SG$k')).toBeNull()
    expect(decodeBase64ToBytes('A')).toBeNull()
  })
})

describe('snippet builders', () => {
  it('builds a CSS background-image rule', () => {
    expect(cssBackgroundImage('data:image/png;base64,AAAA')).toBe('background-image: url("data:image/png;base64,AAAA");')
  })

  it('builds an <img> tag and escapes the alt text', () => {
    expect(htmlImgTag('data:image/png;base64,AAAA', 'a "quoted" <b> & c')).toBe(
      '<img src="data:image/png;base64,AAAA" alt="a &quot;quoted&quot; &lt;b&gt; &amp; c">'
    )
    expect(htmlImgTag('data:image/png;base64,AAAA')).toBe('<img src="data:image/png;base64,AAAA" alt="">')
  })
})
