// SemVer 2.0.0 parsing and precedence comparison, shared by the SemVer Calculator.

// Regex for SemVer 2.0.0 (https://semver.org/)
export const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export interface ParsedSemVer {
  raw: string
  major: number
  minor: number
  patch: number
  prerelease: string
  build: string
  isValid: boolean
}

export function parseSemVer(versionStr: string): ParsedSemVer {
  const clean = versionStr.trim().replace(/^[vV]/, '')
  const match = clean.match(SEMVER_REGEX)
  if (!match) {
    return {
      raw: versionStr,
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: '',
      build: '',
      isValid: false,
    }
  }
  return {
    raw: versionStr,
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || '',
    build: match[5] || '',
    isValid: true,
  }
}

// Compare two semver objects according to SemVer 2.0.0 spec
export function compareSemVer(a: ParsedSemVer, b: ParsedSemVer): number {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  if (a.patch !== b.patch) return a.patch - b.patch

  // When major, minor, and patch are equal, a normal version has greater precedence than a pre-release version
  if (!a.prerelease && b.prerelease) return 1
  if (a.prerelease && !b.prerelease) return -1
  if (!a.prerelease && !b.prerelease) return 0

  // Pre-release comparison
  const aParts = a.prerelease.split('.')
  const bParts = b.prerelease.split('.')
  const maxLen = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < maxLen; i++) {
    const aP = aParts[i]
    const bP = bParts[i]
    if (aP === undefined) return -1
    if (bP === undefined) return 1
    if (aP === bP) continue

    const aNum = parseInt(aP, 10)
    const bNum = parseInt(bP, 10)
    const aIsNum = !isNaN(aNum) && String(aNum) === aP
    const bIsNum = !isNaN(bNum) && String(bNum) === bP

    if (aIsNum && bIsNum) return aNum - bNum
    if (aIsNum && !bIsNum) return -1
    if (!aIsNum && bIsNum) return 1
    return aP.localeCompare(bP)
  }

  return 0
}
