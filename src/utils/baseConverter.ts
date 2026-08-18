export interface BaseConversionResult {
  decimal: string
  binary: string
  binaryFormatted: string
  hex: string
  octal: string
  customBase: string
  customBaseValue: number
  ascii: string
  bitsRequired: number
  twoComplement8: string
  twoComplement16: string
  twoComplement32: string
}

export function formatBinary(bin: string, groupSize = 4): string {
  if (!bin) return ''
  const clean = bin.replace(/\s+/g, '')
  const remainder = clean.length % groupSize
  const padded = remainder === 0 ? clean : '0'.repeat(groupSize - remainder) + clean
  const groups: string[] = []
  for (let i = 0; i < padded.length; i += groupSize) {
    groups.push(padded.slice(i, i + groupSize))
  }
  return groups.join(' ')
}

export function convertNumberBase(
  inputValue: string,
  fromBase: number,
  customTargetBase = 36
): BaseConversionResult {
  const clean = inputValue.trim()
  if (!clean) {
    return {
      decimal: '',
      binary: '',
      binaryFormatted: '',
      hex: '',
      octal: '',
      customBase: '',
      customBaseValue: customTargetBase,
      ascii: '',
      bitsRequired: 0,
      twoComplement8: '',
      twoComplement16: '',
      twoComplement32: '',
    }
  }

  let bigVal: bigint
  try {
    if (fromBase === 10) {
      bigVal = BigInt(clean)
    } else if (fromBase === 16) {
      const hexClean = clean.startsWith('0x') || clean.startsWith('0X') || clean.startsWith('#')
        ? clean.replace(/^(0x|0X|#)/, '')
        : clean
      bigVal = BigInt(`0x${hexClean}`)
    } else if (fromBase === 2) {
      const binClean = clean.replace(/\s+/g, '')
      bigVal = BigInt(`0b${binClean}`)
    } else if (fromBase === 8) {
      bigVal = BigInt(`0o${clean}`)
    } else {
      // General base parsing using parseInt or custom algorithm for BigInt
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
      let acc = 0n
      const lower = clean.toLowerCase()
      for (const char of lower) {
        const digit = chars.indexOf(char)
        if (digit === -1 || digit >= fromBase) {
          throw new Error(`Invalid digit '${char}' for base ${fromBase}`)
        }
        acc = acc * BigInt(fromBase) + BigInt(digit)
      }
      bigVal = acc
    }
  } catch (err: any) {
    throw new Error(err?.message || `Invalid number for base ${fromBase}`)
  }

  const isNegative = bigVal < 0n
  const absBigVal = isNegative ? -bigVal : bigVal

  const decStr = bigVal.toString(10)
  const binStr = (isNegative ? '-' : '') + absBigVal.toString(2)
  const hexStr = (isNegative ? '-' : '') + absBigVal.toString(16).toUpperCase()
  const octStr = (isNegative ? '-' : '') + absBigVal.toString(8)

  let customStr = ''
  if (customTargetBase >= 2 && customTargetBase <= 36) {
    customStr = (isNegative ? '-' : '') + absBigVal.toString(customTargetBase).toUpperCase()
  }

  // ASCII preview (if within printable range 32-126)
  let asciiChar = ''
  if (bigVal >= 32n && bigVal <= 126n) {
    asciiChar = String.fromCharCode(Number(bigVal))
  }

  const bitLength = absBigVal === 0n ? 1 : absBigVal.toString(2).length

  // Two's complement representations (for 8, 16, 32 bit)
  const num32 = Number(BigInt.asIntN(32, bigVal))
  const tc8 = (Number(BigInt.asUintN(8, bigVal))).toString(2).padStart(8, '0')
  const tc16 = (Number(BigInt.asUintN(16, bigVal))).toString(2).padStart(16, '0')
  const tc32 = (Number(BigInt.asUintN(32, bigVal))).toString(2).padStart(32, '0')

  return {
    decimal: decStr,
    binary: binStr,
    binaryFormatted: formatBinary(binStr.replace('-', '')),
    hex: hexStr,
    octal: octStr,
    customBase: customStr,
    customBaseValue: customTargetBase,
    ascii: asciiChar ? `'${asciiChar}'` : 'N/A',
    bitsRequired: bitLength,
    twoComplement8: formatBinary(tc8, 4),
    twoComplement16: formatBinary(tc16, 4),
    twoComplement32: formatBinary(tc32, 4),
  }
}
