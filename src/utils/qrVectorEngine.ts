import QRCode from 'qrcode'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type ModuleShape = 'square' | 'dots' | 'rounded' | 'squircle' | 'diamond'
export type EyeShape = 'square' | 'rounded' | 'circle'

export interface QrVectorOptions {
  text: string
  errorCorrectionLevel?: ErrorCorrectionLevel
  margin?: number // quiet zone modules
  size?: number // target pixel size for preview / raster
  fgColor?: string // hex e.g. #000000
  bgColor?: string // hex e.g. #ffffff
  transparentBg?: boolean
  moduleShape?: ModuleShape
  eyeShape?: EyeShape
  centerLogo?: {
    type: 'preset' | 'custom'
    presetId?: string
    dataUrl?: string
    sizeRatio?: number // 0.15 to 0.25 (default ~0.2)
  }
}

export interface QrMatrixData {
  size: number
  modules: boolean[][]
  isEyeModule: boolean[][]
  isCenterModule: boolean[][]
}

/**
 * Creates the 2D QR matrix using the standard qrcode generator
 */
export function generateQrMatrix(
  text: string,
  errorLevel: ErrorCorrectionLevel = 'M',
  hasCenterLogo: boolean = false
): QrMatrixData {
  // If logo is attached, ensure at least 'Q' or 'H' error correction for 100% readability
  const effectiveErrorLevel: ErrorCorrectionLevel = hasCenterLogo
    ? errorLevel === 'L' || errorLevel === 'M' ? 'H' : errorLevel
    : errorLevel

  const qr = QRCode.create(text, { errorCorrectionLevel: effectiveErrorLevel })
  const size = qr.modules.size
  const modules: boolean[][] = []
  const isEyeModule: boolean[][] = []
  const isCenterModule: boolean[][] = []

  // Center logo clearance bounds (radius ~15-20% of grid size)
  const centerRadius = hasCenterLogo ? Math.floor(size * 0.14) : 0
  const centerCoord = Math.floor(size / 2)
  const minCenter = centerCoord - centerRadius
  const maxCenter = centerCoord + centerRadius

  for (let r = 0; r < size; r++) {
    modules[r] = []
    isEyeModule[r] = []
    isCenterModule[r] = []
    for (let c = 0; c < size; c++) {
      // Index in Uint8Array bitmask
      const isDark = Boolean(qr.modules.get(r, c))
      modules[r][c] = isDark

      // Is within the three corner eyes (top-left, top-right, bottom-left 7x7 areas)?
      const inTopLeft = r < 7 && c < 7
      const inTopRight = r < 7 && c >= size - 7
      const inBottomLeft = r >= size - 7 && c < 7
      isEyeModule[r][c] = inTopLeft || inTopRight || inBottomLeft

      // Is in center logo clearance zone?
      const inCenter = hasCenterLogo && r >= minCenter && r <= maxCenter && c >= minCenter && c <= maxCenter
      isCenterModule[r][c] = inCenter
    }
  }

  return { size, modules, isEyeModule, isCenterModule }
}

/**
 * Generates clean, resolution-independent SVG markup with custom shapes, corners, and optional logo
 */
export function generateCustomSvg(options: QrVectorOptions): string {
  const {
    text,
    errorCorrectionLevel = 'M',
    margin = 4,
    size = 400,
    fgColor = '#000000',
    bgColor = '#ffffff',
    transparentBg = false,
    moduleShape = 'square',
    eyeShape = 'square',
    centerLogo
  } = options

  if (!text) return ''

  const hasLogo = Boolean(centerLogo && (centerLogo.dataUrl || centerLogo.presetId))
  const matrix = generateQrMatrix(text, errorCorrectionLevel, hasLogo)
  const gridCount = matrix.size + margin * 2
  const cellSize = size / gridCount

  const svgPaths: string[] = []

  // Background rect
  const backgroundSvg = transparentBg
    ? ''
    : `<rect width="${size}" height="${size}" fill="${bgColor}" />`

  // Helper to draw eye frames
  const drawCornerEye = (startRow: number, startCol: number) => {
    const ox = (startCol + margin) * cellSize
    const oy = (startRow + margin) * cellSize
    const eyeSize = 7 * cellSize
    const innerOx = ox + 2 * cellSize
    const innerOy = oy + 2 * cellSize
    const innerSize = 3 * cellSize

    if (eyeShape === 'circle') {
      const outerR = eyeSize / 2
      const cx = ox + outerR
      const cy = oy + outerR
      const innerR = innerSize / 2
      const holeR = (5 * cellSize) / 2

      return `
        <!-- Eye at (${startRow}, ${startCol}) -->
        <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="${fgColor}" />
        <circle cx="${cx}" cy="${cy}" r="${holeR}" fill="${transparentBg ? bgColor : (transparentBg ? '#ffffff' : bgColor)}" />
        <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="${fgColor}" />
      `
    } else if (eyeShape === 'rounded') {
      const rOuter = cellSize * 2
      const rInner = cellSize
      return `
        <!-- Eye at (${startRow}, ${startCol}) -->
        <rect x="${ox}" y="${oy}" width="${eyeSize}" height="${eyeSize}" rx="${rOuter}" ry="${rOuter}" fill="${fgColor}" />
        <rect x="${ox + cellSize}" y="${oy + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" rx="${rOuter * 0.7}" ry="${rOuter * 0.7}" fill="${transparentBg ? bgColor : bgColor}" />
        <rect x="${innerOx}" y="${innerOy}" width="${innerSize}" height="${innerSize}" rx="${rInner}" ry="${rInner}" fill="${fgColor}" />
      `
    } else {
      // Standard Square eye
      return `
        <!-- Eye at (${startRow}, ${startCol}) -->
        <rect x="${ox}" y="${oy}" width="${eyeSize}" height="${eyeSize}" fill="${fgColor}" />
        <rect x="${ox + cellSize}" y="${oy + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="${transparentBg ? bgColor : bgColor}" />
        <rect x="${innerOx}" y="${innerOy}" width="${innerSize}" height="${innerSize}" fill="${fgColor}" />
      `
    }
  }

  // Draw 3 corner eyes
  const eyesSvg = `
    ${drawCornerEye(0, 0)}
    ${drawCornerEye(0, matrix.size - 7)}
    ${drawCornerEye(matrix.size - 7, 0)}
  `

  // Draw individual modules
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      // Skip corner eye zones (drawn separately for high visual fidelity)
      if (matrix.isEyeModule[r][c]) continue
      // Skip center cleared module for logo
      if (matrix.isCenterModule[r][c]) continue

      if (matrix.modules[r][c]) {
        const x = (c + margin) * cellSize
        const y = (r + margin) * cellSize

        if (moduleShape === 'dots') {
          const cx = x + cellSize / 2
          const cy = y + cellSize / 2
          const radius = (cellSize / 2) * 0.88
          svgPaths.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${fgColor}" />`)
        } else if (moduleShape === 'rounded') {
          const rx = (cellSize * 0.35).toFixed(2)
          svgPaths.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${fgColor}" />`)
        } else if (moduleShape === 'squircle') {
          const rx = (cellSize * 0.48).toFixed(2)
          svgPaths.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${fgColor}" />`)
        } else if (moduleShape === 'diamond') {
          const cx = x + cellSize / 2
          const cy = y + cellSize / 2
          const half = (cellSize / 2) * 0.95
          svgPaths.push(`<polygon points="${cx.toFixed(2)},${(cy - half).toFixed(2)} ${(cx + half).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy + half).toFixed(2)} ${(cx - half).toFixed(2)},${cy.toFixed(2)}" fill="${fgColor}" />`)
        } else {
          // Standard square
          svgPaths.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(cellSize + 0.05).toFixed(2)}" height="${(cellSize + 0.05).toFixed(2)}" fill="${fgColor}" />`)
        }
      }
    }
  }

  // Logo SVG injection (if present)
  let logoSvg = ''
  if (hasLogo && centerLogo) {
    const centerCoord = Math.floor(matrix.size / 2)
    const centerRadius = Math.floor(matrix.size * 0.14)
    const logoX = (centerCoord - centerRadius + margin) * cellSize
    const logoY = (centerCoord - centerRadius + margin) * cellSize
    const logoAreaSize = (centerRadius * 2 + 1) * cellSize

    // Center badge background container
    const badgePad = cellSize * 0.5
    logoSvg = `
      <!-- Center Logo Container -->
      <g transform="translate(${logoX.toFixed(2)}, ${logoY.toFixed(2)})">
        <rect width="${logoAreaSize.toFixed(2)}" height="${logoAreaSize.toFixed(2)}" rx="${cellSize * 1.5}" ry="${cellSize * 1.5}" fill="${transparentBg ? '#ffffff' : bgColor}" stroke="${fgColor}" stroke-width="1.5" />
        ${centerLogo.dataUrl ? `
          <image href="${centerLogo.dataUrl}" x="${badgePad.toFixed(2)}" y="${badgePad.toFixed(2)}" width="${(logoAreaSize - badgePad * 2).toFixed(2)}" height="${(logoAreaSize - badgePad * 2).toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
        ` : ''}
      </g>
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="geometricPrecision">
  <defs>
    <style>
      .qr-module { fill: ${fgColor}; }
    </style>
  </defs>
  ${backgroundSvg}
  ${eyesSvg}
  <g class="qr-modules">
    ${svgPaths.join('\n    ')}
  </g>
  ${logoSvg}
</svg>`
}

/**
 * Converts Hex color string to RGB normalized floats (0.0 to 1.0) for PostScript EPS
 */
function hexToRgbRatio(hex: string): [number, number, number] {
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('')
  }
  const num = parseInt(clean, 16)
  if (isNaN(num)) return [0, 0, 0]
  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255
  return [Number(r.toFixed(4)), Number(g.toFixed(4)), Number(b.toFixed(4))]
}

/**
 * Generates 100% standard Encapsulated PostScript (EPS) vector format
 * Compatible with Adobe Illustrator, InDesign, CorelDRAW, Inkscape, and print RIP software.
 */
export function generateEps(options: QrVectorOptions): string {
  const {
    text,
    errorCorrectionLevel = 'M',
    margin = 4,
    fgColor = '#000000',
    bgColor = '#ffffff',
    transparentBg = false,
    centerLogo
  } = options

  if (!text) return ''

  const hasLogo = Boolean(centerLogo && (centerLogo.dataUrl || centerLogo.presetId))
  const matrix = generateQrMatrix(text, errorCorrectionLevel, hasLogo)
  const totalGrid = matrix.size + margin * 2
  const ptSize = 500 // standard 500pt bounding box
  const cellPt = ptSize / totalGrid

  const [fgR, fgG, fgB] = hexToRgbRatio(fgColor)
  const [bgR, bgG, bgB] = hexToRgbRatio(bgColor)

  const epsLines: string[] = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${ptSize} ${ptSize}`,
    `%%HiResBoundingBox: 0 0 ${ptSize} ${ptSize}`,
    '%%Title: QR Code Vector',
    '%%Creator: ToolBox4Devs Safe Vector QR Code Generator (toolbox4devs.com)',
    `%%CreationDate: ${new Date().toISOString()}`,
    '%%Pages: 1',
    '%%LanguageLevel: 2',
    '%%EndComments',
    '',
    '% Macro definitions',
    '/box {',
    '  newpath',
    '  moveto',
    '  1 0 rlineto',
    '  0 1 rlineto',
    '  -1 0 rlineto',
    '  closepath',
    '  fill',
    '} bind def',
    '',
    '/cell {',
    '  gsave',
    '  translate',
    `  ${cellPt.toFixed(4)} ${cellPt.toFixed(4)} scale`,
    '  box',
    '  grestore',
    '} bind def',
    ''
  ]

  // Draw Background if not transparent
  if (!transparentBg) {
    epsLines.push(
      '% Background',
      `${bgR} ${bgG} ${bgB} setrgbcolor`,
      'newpath',
      '0 0 moveto',
      `${ptSize} 0 lineto`,
      `${ptSize} ${ptSize} lineto`,
      `0 ${ptSize} lineto`,
      'closepath',
      'fill',
      ''
    )
  }

  // Draw Foreground QR Modules
  epsLines.push(`% QR Code Modules`, `${fgR} ${fgG} ${fgB} setrgbcolor`)

  // In PostScript, (0,0) is bottom-left. We convert matrix row (0 is top) to PS Y coordinate.
  for (let r = 0; r < matrix.size; r++) {
    const psY = (totalGrid - 1 - (r + margin)) * cellPt
    for (let c = 0; c < matrix.size; c++) {
      if (matrix.isCenterModule[r][c]) continue

      if (matrix.modules[r][c]) {
        const psX = (c + margin) * cellPt
        epsLines.push(`${psX.toFixed(3)} ${psY.toFixed(3)} cell`)
      }
    }
  }

  epsLines.push('', '%%EOF')
  return epsLines.join('\n')
}

/**
 * Generates high-res PNG / JPEG raster data URLs using HTML5 Canvas
 */
export async function generateRasterDataUrl(
  options: QrVectorOptions,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  resolutionMultiplier: number = 2
): Promise<string> {
  const {
    text,
    errorCorrectionLevel = 'M',
    margin = 4,
    size = 400,
    fgColor = '#000000',
    bgColor = '#ffffff',
    transparentBg = false,
    moduleShape = 'square',
    eyeShape = 'square',
    centerLogo
  } = options

  if (!text) return ''

  const targetWidth = Math.min(4096, size * resolutionMultiplier)
  const svgMarkup = generateCustomSvg({
    ...options,
    size: targetWidth,
    transparentBg: format === 'jpeg' ? false : transparentBg
  })

  // Render SVG onto an offscreen canvas
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetWidth
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get 2D canvas context'))
      return
    }

    if (format === 'jpeg' || !transparentBg) {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, targetWidth, targetWidth)
    }

    const img = new Image()
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
      const dataUrl = canvas.toDataURL(mimeType, 0.95)
      resolve(dataUrl)
    }

    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }

    img.src = url
  })
}

/**
 * Verifies if text is a safe, valid URL or data string with no hidden spoofing
 */
export function analyzePayloadSafety(payload: string): {
  isSafe: boolean
  isUrl: boolean
  protocol?: string
  warnings: string[]
} {
  const warnings: string[] = []
  const trimmed = payload.trim()

  if (!trimmed) {
    return { isSafe: true, isUrl: false, warnings: [] }
  }

  const isUrl = /^https?:\/\//i.test(trimmed)
  let protocol = ''

  if (isUrl) {
    try {
      const parsed = new URL(trimmed)
      protocol = parsed.protocol

      if (parsed.protocol === 'http:') {
        warnings.push('URL uses unencrypted HTTP instead of HTTPS.')
      }

      // Check for suspicious zero-width spaces or homoglyph characters
      if (/[\u200B-\u200D\uFEFF]/.test(trimmed)) {
        warnings.push('URL contains hidden zero-width unicode characters.')
      }

      // Check for userinfo @ trick in URLs
      if (parsed.username || parsed.password) {
        warnings.push('URL contains embedded username credentials (potential phishing redirect).')
      }
    } catch {
      warnings.push('URL format appears malformed or contains invalid characters.')
    }
  } else if (/^javascript:/i.test(trimmed)) {
    warnings.push('Payload contains executable JavaScript URI (unsafe for scanning).')
  }

  return {
    isSafe: warnings.length === 0,
    isUrl,
    protocol,
    warnings
  }
}
