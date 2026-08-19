import { lazy } from "react"
import { ToolMeta } from "../tool-meta"

export const SEMVER_CALCULATOR_META: ToolMeta = {
  slug: 'semver-calculator',
  name: 'SemVer Calculator & Range Tester',
  category: 'data-tools',
  tag: 'SEMVER',
  description: 'Parse, validate, compare, sort, and calculate version increments according to SemVer 2.0.0 rules and NPM range expressions.',
  keywords: ['semver calculator', 'semantic versioning', 'semver range tester', 'version increment', 'npm semver', 'caret range', 'tilde range'],
  status: 'stable',
  isNew: true,
  toolComponent: lazy(() => import('../../components/tools/data-tools/SemverCalculator')),
  seo: {
    title: 'SemVer Calculator & Semantic Version Range Tester',
    description: 'Parse SemVer 2.0.0 version numbers, test compatibility ranges (^, ~, >=), calculate version bumps, and sort version tags in your browser.',
    extraKeywords: ['semver parser', 'version comparator', 'semver diff', 'bump major minor patch', 'semver satisfaction'],
  },
  about: {
    summary: 'The SemVer Calculator parses semantic versions into Major, Minor, Patch, Pre-release, and Build metadata. It tests package range expressions and calculates next version releases.',
    useCases: [
      'Testing NPM, Cargo, Pip, or Go package range compatibility (^, ~, >=, <)',
      'Calculating next release versions (Major, Minor, Patch, or Pre-release Alpha/Beta/RC)',
      'Sorting and ranking a list of Git tags according to strict SemVer precedence rules',
      'Understanding semantic versioning semantics for open source libraries'
    ],
    features: [
      'SemVer 2.0.0 specification compliant parser and validator',
      'Interactive range tester with plain-English rule explanations',
      '1-Click version bumper (Major, Minor, Patch, Pre-major, Pre-minor, Pre-patch)',
      'Batch version comparator and sorter (Ascending / Descending)'
    ],
    notes: [
      'Build metadata (e.g. +build.1) is ignored during precedence evaluation per SemVer 2.0.0 spec section 10',
      'A normal version always has greater precedence than a pre-release version with the same major, minor, and patch'
    ],
    tip: 'Click any sample preset to test caret (^), tilde (~), or pre-release version ranges instantly.'
  }
}
