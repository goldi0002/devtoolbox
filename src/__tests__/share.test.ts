import { describe, it, expect } from 'vitest'
import { compress, decompress, buildShareUrl, readHashData } from '../lib/share'

describe('share utility', () => {
  it('compresses and decompresses JSON data correctly', () => {
    const data = { input: 'hello world', number: 42, active: true }
    const compressed = compress(data)
    expect(typeof compressed).toBe('string')
    expect(compressed.length).toBeGreaterThan(0)

    const decompressed = decompress(compressed)
    expect(decompressed).toEqual(data)
  })

  it('compresses and decompresses plain string data', () => {
    const str = 'just plain string'
    const compressed = compress(str)
    const decompressed = decompress<string>(compressed)
    expect(decompressed).toBe(str)
  })

  it('rejects oversized compressed hash payloads for security', () => {
    const hugePayload = 'a'.repeat(300000)
    const result = decompress(hugePayload)
    expect(result).toBeNull()
  })

  it('handles invalid compressed string gracefully', () => {
    const result = decompress('invalid-garbage-hash-$$$')
    expect(result).toBeNull()
  })

  it('handles SSG environment gracefully when window is undefined', () => {
    expect(buildShareUrl('test')).toBeDefined()
    expect(readHashData()).toBeNull()
  })
})
