/**
 * Convert a number (integer or decimal, positive or negative) into English words.
 * Supports magnitudes up to trillions.
 */

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
]

const TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
]

const GROUPS = ['', 'thousand', 'million', 'billion', 'trillion']

function threeDigitsToWords(num: number): string {
  const parts: string[] = []
  const hundreds = Math.floor(num / 100)
  const rest = num % 100

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`)
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest])
    } else {
      const ten = Math.floor(rest / 10)
      const one = rest % 10
      parts.push(one === 0 ? TENS[ten] : `${TENS[ten]}-${ONES[one]}`)
    }
  }

  return parts.join(' ')
}

function integerToWords(num: number): string {
  if (num === 0) return 'zero'

  const groups: string[] = []
  let value = num
  let groupIndex = 0

  while (value > 0) {
    const groupValue = value % 1000
    if (groupValue > 0) {
      const groupWords = threeDigitsToWords(groupValue)
      const suffix = GROUPS[groupIndex]
      groups.unshift(suffix ? `${groupWords} ${suffix}` : groupWords)
    }
    value = Math.floor(value / 1000)
    groupIndex++
  }

  return groups.join(' ')
}

/**
 * Convert a numeric string into English words.
 * @throws Error when the input is not a valid finite number or is out of range.
 */
export function numberToWords(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('Please enter a valid number (digits with an optional decimal point).')
  }

  const isNegative = trimmed.startsWith('-')
  const absolute = isNegative ? trimmed.slice(1) : trimmed
  const [integerPart, decimalPart] = absolute.split('.')

  const integerNum = parseInt(integerPart, 10)
  if (!Number.isSafeInteger(integerNum) || integerNum > 999_999_999_999_999) {
    throw new Error('Number is out of range (supports up to 999 trillion).')
  }

  const parts: string[] = []

  if (isNegative) parts.push('negative')

  const integerWords = integerToWords(integerNum)
  if (integerWords) parts.push(integerWords)

  if (decimalPart !== undefined && decimalPart.length > 0) {
    const digits = decimalPart
      .split('')
      .map(d => ONES[parseInt(d, 10)])
      .join(' ')
    parts.push(`point ${digits}`)
  }

  return parts.join(' ')
}
