export interface CssConversionResult {
  px: number
  rem: number
  em: number
  vw: number
  vh: number
  percent: number
  pt: number
  tailwindWidth: string
  tailwindText: string
}

export const TAILWIND_SPACING_MAP: Record<number, string> = {
  0: '0',
  1: 'px',
  2: '0.5',
  4: '1',
  6: '1.5',
  8: '2',
  10: '2.5',
  12: '3',
  14: '3.5',
  16: '4',
  20: '5',
  24: '6',
  28: '7',
  32: '8',
  36: '9',
  40: '10',
  44: '11',
  48: '12',
  56: '14',
  64: '16',
  80: '20',
  96: '24',
  112: '28',
  128: '32',
}

export const TAILWIND_FONT_SIZE_MAP: Record<number, string> = {
  12: 'text-xs (12px / 0.75rem)',
  14: 'text-sm (14px / 0.875rem)',
  16: 'text-base (16px / 1rem)',
  18: 'text-lg (18px / 1.125rem)',
  20: 'text-xl (20px / 1.25rem)',
  24: 'text-2xl (24px / 1.5rem)',
  30: 'text-3xl (30px / 1.875rem)',
  36: 'text-4xl (36px / 2.25rem)',
  48: 'text-5xl (48px / 3rem)',
  60: 'text-6xl (60px / 3.75rem)',
  72: 'text-7xl (72px / 4.5rem)',
  96: 'text-8xl (96px / 6rem)',
  128: 'text-9xl (128px / 8rem)',
}

export function convertCssUnit(
  val: number,
  unit: 'px' | 'rem' | 'em' | 'vw' | 'vh' | 'percent' | 'pt',
  baseFontSize = 16,
  viewportWidth = 1920,
  viewportHeight = 1080
): CssConversionResult {
  let pxValue = 0

  switch (unit) {
    case 'px':
      pxValue = val
      break
    case 'rem':
    case 'em':
      pxValue = val * baseFontSize
      break
    case 'vw':
      pxValue = (val * viewportWidth) / 100
      break
    case 'vh':
      pxValue = (val * viewportHeight) / 100
      break
    case 'percent':
      pxValue = (val * baseFontSize) / 100
      break
    case 'pt':
      pxValue = val * (96 / 72)
      break
  }

  const rem = pxValue / baseFontSize
  const em = rem
  const vw = (pxValue / viewportWidth) * 100
  const vh = (pxValue / viewportHeight) * 100
  const percent = (pxValue / baseFontSize) * 100
  const pt = pxValue * (72 / 96)

  // Find nearest tailwind spacing
  const nearestSpacingKey = Object.keys(TAILWIND_SPACING_MAP)
    .map(Number)
    .find(k => Math.abs(k - pxValue) < 0.5)

  const tailwindWidth = nearestSpacingKey !== undefined 
    ? `w-${TAILWIND_SPACING_MAP[nearestSpacingKey]} / p-${TAILWIND_SPACING_MAP[nearestSpacingKey]}`
    : `w-[${pxValue}px]`

  // Find nearest tailwind text
  const nearestTextKey = Object.keys(TAILWIND_FONT_SIZE_MAP)
    .map(Number)
    .find(k => Math.abs(k - pxValue) < 0.5)

  const tailwindText = nearestTextKey !== undefined
    ? TAILWIND_FONT_SIZE_MAP[nearestTextKey]
    : `text-[${pxValue}px]`

  return {
    px: Number(pxValue.toFixed(4)),
    rem: Number(rem.toFixed(4)),
    em: Number(em.toFixed(4)),
    vw: Number(vw.toFixed(4)),
    vh: Number(vh.toFixed(4)),
    percent: Number(percent.toFixed(2)),
    pt: Number(pt.toFixed(4)),
    tailwindWidth,
    tailwindText,
  }
}

export function generateClampCss(
  minPx: number,
  maxPx: number,
  minViewportPx = 375,
  maxViewportPx = 1440,
  baseFontSize = 16
): string {
  const minRem = (minPx / baseFontSize).toFixed(4)
  const maxRem = (maxPx / baseFontSize).toFixed(4)

  const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx)
  const yIntersection = -minViewportPx * slope + minPx

  const slopeVw = (slope * 100).toFixed(4)
  const yIntersectionRem = (yIntersection / baseFontSize).toFixed(4)

  return `clamp(${minRem}rem, ${yIntersectionRem}rem + ${slopeVw}vw, ${maxRem}rem)`
}
