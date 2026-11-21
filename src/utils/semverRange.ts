import { ParsedSemVer, parseSemVer, compareSemVer } from './semver'

export interface RangeEvaluation {
  satisfies: boolean
  explanation: string
}

type ComparatorOperator = '>=' | '<=' | '>' | '<' | '='

interface Comparator {
  op: ComparatorOperator
  token: string
  target: ParsedSemVer
}

/** True when a range expression uses comparison operators (>, >=, <, <=, =). */
export function hasComparatorOperator(rangeStr: string): boolean {
  return /[<>=]/.test(rangeStr)
}

function sameTuple(a: ParsedSemVer, b: ParsedSemVer): boolean {
  return a.major === b.major && a.minor === b.minor && a.patch === b.patch
}

function matchesOperator(cmp: number, op: ComparatorOperator): boolean {
  switch (op) {
    case '>': return cmp > 0
    case '>=': return cmp >= 0
    case '<': return cmp < 0
    case '<=': return cmp <= 0
    case '=': return cmp === 0
  }
}

/**
 * Evaluates a comparator set such as ">=1.2.0 <2.0.0" (space-separated AND) or ">2.0.0".
 * Supported operators: >, >=, <, <=, = (a bare version means =). Every comparator must
 * hold. Precedence follows SemVer 2.0.0 via compareSemVer, and build metadata is ignored.
 *
 * Pre-release versions follow the npm/Cargo rule: a pre-release version only matches
 * when at least one comparator in the set is a pre-release on the same major.minor.patch.
 *
 * Returns null when the expression has no comparison operator, so callers can fall
 * back to their other range handling.
 */
export function evaluateComparatorRange(version: ParsedSemVer, rangeStr: string): RangeEvaluation | null {
  if (!hasComparatorOperator(rangeStr)) return null

  if (!version.isValid) {
    return { satisfies: false, explanation: 'Invalid version string' }
  }

  // Join an operator and its version when separated by spaces: ">= 1.2.0" -> ">=1.2.0"
  const normalized = rangeStr.trim().replace(/(>=|<=|>|<|=)\s+/g, '$1')
  const tokens = normalized.split(/\s+/).filter(Boolean)

  const comparators: Comparator[] = []
  for (const token of tokens) {
    const match = token.match(/^(>=|<=|>|<|=)?(.*)$/)
    const op = (match?.[1] || '=') as ComparatorOperator
    const target = parseSemVer(match?.[2] ?? '')
    if (!target.isValid) {
      return {
        satisfies: false,
        explanation: `Invalid comparator "${token}". Expected an operator followed by a full MAJOR.MINOR.PATCH version`,
      }
    }
    comparators.push({ op, token: `${op}${target.raw.trim().replace(/^[vV]/, '')}`, target })
  }

  if (comparators.length === 0) {
    return { satisfies: false, explanation: 'Empty comparator set' }
  }

  const label = comparators.map(c => c.token).join(' AND ')

  if (version.prerelease) {
    const allowsPrerelease = comparators.some(c => c.target.prerelease && sameTuple(c.target, version))
    if (!allowsPrerelease) {
      return {
        satisfies: false,
        explanation: `Pre-release ${version.raw} only matches when a comparator names a pre-release on ${version.major}.${version.minor}.${version.patch} (${label})`,
      }
    }
  }

  const failed = comparators.find(c => !matchesOperator(compareSemVer(version, c.target), c.op))
  if (failed) {
    return {
      satisfies: false,
      explanation: `Fails comparator ${failed.token} (all comparators must hold: ${label})`,
    }
  }

  return {
    satisfies: true,
    explanation: `All comparators hold: ${label}`,
  }
}
