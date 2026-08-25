import { describe, it, expect } from 'vitest'
import { calculateCidr, ipToNumber, numberToIp } from '../utils/cidr'
import { escapeString, unescapeString } from '../utils/stringEscape'
import { convertNumberBase } from '../utils/baseConverter'
import { convertCssUnit, generateClampCss } from '../utils/cssUnits'

describe('CIDR & Subnet Calculator', () => {
  it('correctly converts IPv4 to number and back', () => {
    const ip = '192.168.1.1'
    const num = ipToNumber(ip)
    expect(numberToIp(num)).toBe(ip)
  })

  it('calculates standard /24 CIDR block', () => {
    const res = calculateCidr('192.168.1.0/24')
    expect(res.networkAddress).toBe('192.168.1.0')
    expect(res.broadcastAddress).toBe('192.168.1.255')
    expect(res.netmask).toBe('255.255.255.0')
    expect(res.wildcard).toBe('0.0.0.255')
    expect(res.firstUsableIp).toBe('192.168.1.1')
    expect(res.lastUsableIp).toBe('192.168.1.254')
    expect(res.totalHosts).toBe(256)
    expect(res.usableHosts).toBe(254)
    expect(res.ipClass).toBe('Class C')
    expect(res.ipType).toBe('Private')
  })

  it('calculates /16 and /32 blocks accurately', () => {
    const res16 = calculateCidr('10.0.0.0/16')
    expect(res16.usableHosts).toBe(65534)
    expect(res16.ipType).toBe('Private')

    const res32 = calculateCidr('8.8.8.8/32')
    expect(res32.usableHosts).toBe(1)
    expect(res32.networkAddress).toBe('8.8.8.8')
    expect(res32.ipType).toBe('Public')
  })
})

describe('String Escape & Unescape', () => {
  it('escapes and unescapes JSON strings', () => {
    const raw = 'Hello "World"\nNew line & backslash: \\'
    const escaped = escapeString(raw, 'json')
    expect(escaped).toContain('\\"')
    expect(escaped).toContain('\\n')
    expect(escaped).toContain('\\\\')

    const unescaped = unescapeString(escaped, 'json')
    expect(unescaped).toBe(raw)
  })

  it('escapes SQL quotes properly by doubling', () => {
    const sql = "SELECT * FROM users WHERE name = 'O''Reilly';"
    const raw = "O'Reilly"
    const escaped = escapeString(raw, 'sql')
    expect(escaped).toBe("O''Reilly")
    expect(unescapeString(escaped, 'sql')).toBe(raw)
  })

  it('escapes HTML entities', () => {
    const html = '<h1>"Hello & Welcome"</h1>'
    const escaped = escapeString(html, 'html')
    expect(escaped).toBe('&lt;h1&gt;&quot;Hello &amp; Welcome&quot;&lt;/h1&gt;')
    expect(unescapeString(escaped, 'html')).toBe(html)
  })

  it('escapes shell commands safely', () => {
    const str = "hello 'world'"
    const escaped = escapeString(str, 'shell')
    expect(escaped.startsWith("'")).toBe(true)
    expect(escaped.endsWith("'")).toBe(true)
  })
})

describe('Number Base Converter', () => {
  it('converts decimal 255 to hex, binary, and octal', () => {
    const res = convertNumberBase('255', 10)
    expect(res.hex).toBe('FF')
    expect(res.binary).toBe('11111111')
    expect(res.octal).toBe('377')
    expect(res.bitsRequired).toBe(8)
  })

  it('converts hexadecimal 0xDEADBEEF to decimal', () => {
    const res = convertNumberBase('DEADBEEF', 16)
    expect(res.decimal).toBe('3735928559')
    expect(res.hex).toBe('DEADBEEF')
  })

  it('supports custom base 36 conversion', () => {
    const res = convertNumberBase('12345', 10, 36)
    expect(res.customBase).toBe('9IX')
  })
})

describe('CSS Unit & Fluid Typography Converter', () => {
  it('converts px to rem and vw correctly', () => {
    const res = convertCssUnit(16, 'px', 16, 1920, 1080)
    expect(res.px).toBe(16)
    expect(res.rem).toBe(1)
    expect(res.tailwindWidth).toBe('w-4 / p-4')
  })

  it('converts rem to px correctly', () => {
    const res = convertCssUnit(2, 'rem', 16)
    expect(res.px).toBe(32)
    expect(res.rem).toBe(2)
  })

  it('generates fluid clamp() formula string', () => {
    const clamp = generateClampCss(16, 32, 375, 1440, 16)
    expect(clamp.startsWith('clamp(')).toBe(true)
    expect(clamp.includes('rem')).toBe(true)
    expect(clamp.includes('vw')).toBe(true)
  })
})
