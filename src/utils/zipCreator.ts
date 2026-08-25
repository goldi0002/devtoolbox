/**
 * Lightweight ZIP file creator for browser-side file bundling.
 * Creates valid ZIP files without external dependencies.
 */

interface ZipEntry {
  name: string
  data: Uint8Array
}

// CRC-32 lookup table
const crc32Table: Uint32Array = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  return table
})()

function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function uint16ToBytes(n: number): [number, number] {
  return [n & 0xFF, (n >> 8) & 0xFF]
}

function uint32ToBytes(n: number): [number, number, number, number] {
  return [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]
}

/**
 * Creates a valid ZIP file from an array of entries.
 * @param entries - Array of {name, data} objects
 * @returns Uint8Array containing the ZIP file
 */
export function createZipFile(entries: ZipEntry[]): Uint8Array {
  const localHeaders: Uint8Array[] = []
  const centralHeaders: Uint8Array[] = []
  const encodedNames: Uint8Array[] = []

  let offset = 0

  for (const entry of entries) {
    const nameBytes = stringToUint8Array(entry.name)
    const crc = crc32(entry.data)

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length + entry.data.length)
    const lv = new DataView(localHeader.buffer)

    // Signature
    lv.setUint32(0, 0x04034B50, true)
    // Version needed
    lv.setUint16(4, 20, true)
    // Flags
    lv.setUint16(6, 0, true)
    // Compression method (stored = 0)
    lv.setUint16(8, 0, true)
    // Last mod time/date
    lv.setUint16(10, 0, true)
    lv.setUint16(12, 0, true)
    // CRC-32
    lv.setUint32(14, crc, true)
    // Compressed size
    lv.setUint32(18, entry.data.length, true)
    // Uncompressed size
    lv.setUint32(22, entry.data.length, true)
    // Filename length
    lv.setUint16(26, nameBytes.length, true)
    // Extra field length
    lv.setUint16(28, 0, true)

    // Copy filename
    localHeader.set(nameBytes, 30)
    // Copy data
    localHeader.set(entry.data, 30 + nameBytes.length)

    localHeaders.push(localHeader)

    // Central directory header
    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(centralHeader.buffer)

    // Signature
    cv.setUint32(0, 0x02014B50, true)
    // Version made by
    cv.setUint16(4, 20, true)
    // Version needed
    cv.setUint16(6, 20, true)
    // Flags
    cv.setUint16(8, 0, true)
    // Compression method
    cv.setUint16(10, 0, true)
    // Last mod time/date
    cv.setUint16(12, 0, true)
    cv.setUint16(14, 0, true)
    // CRC-32
    cv.setUint32(16, crc, true)
    // Compressed size
    cv.setUint32(20, entry.data.length, true)
    // Uncompressed size
    cv.setUint32(24, entry.data.length, true)
    // Filename length
    cv.setUint16(28, nameBytes.length, true)
    // Extra field length
    cv.setUint16(30, 0, true)
    // File comment length
    cv.setUint16(32, 0, true)
    // Disk number start
    cv.setUint16(34, 0, true)
    // Internal file attributes
    cv.setUint16(36, 0, true)
    // External file attributes
    cv.setUint32(38, 0, true)
    // Local header offset
    cv.setUint32(42, offset, true)

    // Copy filename
    centralHeader.set(nameBytes, 46)

    centralHeaders.push(centralHeader)
    encodedNames.push(nameBytes)

    offset += 30 + nameBytes.length + entry.data.length
  }

  // Calculate total size
  const totalLocalHeaders = localHeaders.reduce((sum, h) => sum + h.length, 0)
  const totalCentralHeaders = centralHeaders.reduce((sum, h) => sum + h.length, 0)

  // End of central directory
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)

  // Signature
  ev.setUint32(0, 0x06054B50, true)
  // Disk number
  ev.setUint16(4, 0, true)
  // Central directory disk number
  ev.setUint16(6, 0, true)
  // Number of entries on this disk
  ev.setUint16(8, entries.length, true)
  // Total number of entries
  ev.setUint16(10, entries.length, true)
  // Central directory size
  ev.setUint32(12, totalCentralHeaders, true)
  // Central directory offset
  ev.setUint32(16, totalLocalHeaders, true)
  // Comment length
  ev.setUint16(20, 0, true)

  // Combine all parts
  const totalSize = totalLocalHeaders + totalCentralHeaders + 22
  const result = new Uint8Array(totalSize)
  let pos = 0

  for (const header of localHeaders) {
    result.set(header, pos)
    pos += header.length
  }

  for (const header of centralHeaders) {
    result.set(header, pos)
    pos += header.length
  }

  result.set(eocd, pos)

  return result
}

/**
 * Creates a Blob from ZIP data suitable for download
 */
export function createZipBlob(entries: ZipEntry[]): Blob {
  const zipData = createZipFile(entries)
  return new Blob([new Uint8Array(zipData)], { type: 'application/zip' })
}

/**
 * Triggers a download of a ZIP file
 */
export function downloadZip(entries: ZipEntry[], filename: string): void {
  const blob = createZipBlob(entries)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export type { ZipEntry }
