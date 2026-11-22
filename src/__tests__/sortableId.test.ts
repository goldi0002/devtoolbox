import { describe, it, expect } from 'vitest'
import {
  decodeUlidBytes,
  encodeBytesToUlid,
  generateUlid,
  generateUlids,
  generateUuidV7,
  generateUuidV7s,
  inspectId,
} from '../utils/sortableId'
import { ULID_UUIDV7_GENERATOR_META } from '../tools/meta/ulid-uuidv7-generator'

const deterministicBytes = (fill: number) => (size: number) => new Uint8Array(size).fill(fill)

describe('ULID & UUID v7 generator and inspector', () => {
  it('generates valid 26-char Crockford Base32 ULIDs and decodes exact timestamp', () => {
    const ts = 1714753938220
    const ulid = generateUlid(ts, deterministicBytes(0x12))
    expect(ulid).toMatch(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/)

    const inspected = inspectId(ulid)
    expect(inspected.valid).toBe(true)
    expect(inspected.kind).toBe('ulid')
    expect(inspected.timestampMs).toBe(ts)
    expect(inspected.isoDate).toBe(new Date(ts).toISOString())
  })

  it('maintains strict monotonic sort order for ULIDs in the same millisecond', () => {
    const ts = 1714753938220
    const batch = generateUlids(10, {
      timestampMs: ts,
      monotonic: true,
      randomBytes: deterministicBytes(0x01),
    })
    expect(batch).toHaveLength(10)
    for (let i = 1; i < batch.length; i++) {
      expect(batch[i] > batch[i - 1]).toBe(true)
    }
  })

  it('generates RFC 9562 UUID v7 with version 7 and variant 10xx and monotonic order', () => {
    const ts = 1714753938220
    const single = generateUuidV7(ts, deterministicBytes(0xff))
    expect(single).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)

    const batch = generateUuidV7s(8, {
      timestampMs: ts,
      monotonic: true,
      randomBytes: deterministicBytes(0x05),
    })
    for (let i = 1; i < batch.length; i++) {
      expect(batch[i] > batch[i - 1]).toBe(true)
      expect(inspectId(batch[i]).timestampMs).toBe(ts)
    }
  })

  it('round-trips 128-bit bytes between ULID and UUID', () => {
    const uuid = '018f3f4a-1b2c-7000-8000-000000000001'
    const inspectedUuid = inspectId(uuid)
    expect(inspectedUuid.valid).toBe(true)
    expect(inspectedUuid.timestampMs).toBe(1714753772332)
    expect(inspectedUuid.isoDate).toBe('2024-05-03T16:29:32.332Z')

    // Verify worked example in meta matches real decoder output
    const example = ULID_UUIDV7_GENERATOR_META.guide!.example!
    expect(example.output).toBe(
      `Type: ${inspectedUuid.versionLabel}\nTimestamp (ms): ${inspectedUuid.timestampMs}\nUTC Date: ${inspectedUuid.isoDate}`
    )

    const bytes = decodeUlidBytes(inspectedUuid.alternateForm)
    expect(encodeBytesToUlid(bytes)).toBe(inspectedUuid.alternateForm)
  })

  it('rejects invalid ULID characters (I, L, O, U) and overflow', () => {
    expect(inspectId('01BX5ZZKBKACTAV9WEVGEMMVRI').valid).toBe(false)
    expect(inspectId('8ZZZZZZZZZZZZZZZZZZZZZZZZZ').valid).toBe(false)
  })
})
