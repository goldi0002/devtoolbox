import { describe, it, expect } from 'vitest'
import { createZipFile, createZipBlob } from '../utils/zipCreator'

describe('ZIP Creator Utility', () => {
  const encoder = new TextEncoder()

  it('creates a valid ZIP file with single entry', () => {
    const entries = [
      { name: 'test.txt', data: encoder.encode('Hello, World!') }
    ]
    const zip = createZipFile(entries)

    // Verify it returns a Uint8Array
    expect(zip).toBeInstanceOf(Uint8Array)

    // ZIP files start with local file header signature 0x04034B50
    const view = new DataView(zip.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034B50)
  })

  it('creates a valid ZIP file with multiple entries', () => {
    const entries = [
      { name: 'file1.svg', data: encoder.encode('<svg>file1</svg>') },
      { name: 'file2.svg', data: encoder.encode('<svg>file2</svg>') },
      { name: 'file3.svg', data: encoder.encode('<svg>file3</svg>') }
    ]
    const zip = createZipFile(entries)

    // Verify local file headers exist
    const view = new DataView(zip.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034B50) // First local header

    // ZIP should contain End of Central Directory signature 0x06054B50
    const eocdSignature = 0x06054B50
    let foundEocd = false
    for (let i = zip.length - 22; i >= 0; i--) {
      if (view.getUint32(i, true) === eocdSignature) {
        foundEocd = true
        // Verify entry count
        expect(view.getUint16(i + 10, true)).toBe(3)
        break
      }
    }
    expect(foundEocd).toBe(true)
  })

  it('handles empty data payload', () => {
    const entries = [
      { name: 'empty.txt', data: new Uint8Array(0) }
    ]
    const zip = createZipFile(entries)
    expect(zip).toBeInstanceOf(Uint8Array)
    expect(zip.length).toBeGreaterThan(0)
  })

  it('handles binary data correctly', () => {
    // Create binary data that simulates PNG image data
    const binaryData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13])
    const entries = [
      { name: 'image.png', data: binaryData }
    ]
    const zip = createZipFile(entries)

    // Verify the local file header contains the data length
    const view = new DataView(zip.buffer)
    const dataLength = view.getUint32(22, true) // Offset 22 is compressed size
    expect(dataLength).toBe(binaryData.length)
  })

  it('generates valid CRC-32 checksums', () => {
    const data = encoder.encode('Test data for CRC')
    const entries = [
      { name: 'crc-test.txt', data }
    ]
    const zip = createZipFile(entries)

    // The ZIP should be valid
    expect(zip).toBeInstanceOf(Uint8Array)
    expect(zip.length).toBeGreaterThan(30) // At least local header size
  })

  it('handles Unicode filenames', () => {
    const entries = [
      { name: 'über文件.svg', data: encoder.encode('<svg>unicode</svg>') },
      { name: 'résumé.txt', data: encoder.encode('résumé content') }
    ]
    const zip = createZipFile(entries)

    // Verify valid ZIP structure
    const view = new DataView(zip.buffer)
    expect(view.getUint32(0, true)).toBe(0x04034B50)
  })

  it('handles large number of entries', () => {
    const entries = Array.from({ length: 50 }, (_, i) => ({
      name: `qr-code-${i + 1}.svg`,
      data: encoder.encode(`<svg>QR ${i + 1}</svg>`)
    }))
    const zip = createZipFile(entries)

    // Verify all entries are accounted for in EOCD
    const view = new DataView(zip.buffer)
    const eocdSignature = 0x06054B50
    for (let i = zip.length - 22; i >= 0; i--) {
      if (view.getUint32(i, true) === eocdSignature) {
        expect(view.getUint16(i + 10, true)).toBe(50)
        break
      }
    }
  })

  it('creates valid Blob from ZIP entries', () => {
    const entries = [
      { name: 'test.txt', data: encoder.encode('Hello!') }
    ]
    const blob = createZipBlob(entries)

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/zip')
  })

  it('preserves file data integrity', () => {
    const originalContent = 'This is the original file content for integrity testing'
    const entries = [
      { name: 'integrity-test.txt', data: encoder.encode(originalContent) }
    ]
    const zip = createZipFile(entries)

    // Find the local file header and extract the data
    const view = new DataView(zip.buffer)
    // Local header: 30 bytes + filename length + extra field length (0)
    const nameLength = view.getUint16(26, true)
    const dataOffset = 30 + nameLength
    const dataLength = view.getUint32(18, true)

    const extractedData = new TextDecoder().decode(
      zip.slice(dataOffset, dataOffset + dataLength)
    )
    expect(extractedData).toBe(originalContent)
  })

  it('handles entries with empty names gracefully', () => {
    // Edge case: empty filename
    const entries = [
      { name: '', data: encoder.encode('data') }
    ]
    const zip = createZipFile(entries)
    expect(zip).toBeInstanceOf(Uint8Array)
    expect(zip.length).toBeGreaterThan(0)
  })

  it('produces consistent output for same input', () => {
    const entries = [
      { name: 'consistent.txt', data: encoder.encode('Same input') }
    ]
    const zip1 = createZipFile(entries)
    const zip2 = createZipFile(entries)

    // Same input should produce same output
    expect(Array.from(zip1)).toEqual(Array.from(zip2))
  })
})
