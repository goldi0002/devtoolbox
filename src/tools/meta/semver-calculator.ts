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
  },
  guide: {
    "steps": [
      {
        "name": "Enter a version",
        "text": "Type a version such as 1.4.2 or 2.0.0-rc.1. A leading v is accepted."
      },
      {
        "name": "Test a range",
        "text": "Enter a range such as ^1.2.0 or ~2.0.0, then read the SATISFIES or DOES NOT satisfy verdict and its explanation."
      },
      {
        "name": "Bump the version",
        "text": "Click Bump Major, Minor or Patch, or a pre-release bump, to fill the version field with the next value."
      },
      {
        "name": "Sort a list",
        "text": "Paste one version per line into the batch sorter to see them ordered by SemVer precedence."
      }
    ],
    "faqs": [
      {
        "question": "Which range syntax is supported?",
        "answer": "The range tester handles *, caret (^), tilde (~), || for alternatives, and exact versions. Comparison operators such as >= and < are not supported, so those ranges report that the version does not match."
      },
      {
        "question": "Does build metadata affect ordering?",
        "answer": "No. Build metadata after + is ignored when comparing versions, as SemVer 2.0.0 specifies."
      },
      {
        "question": "How do pre-releases sort?",
        "answer": "A normal version is greater than a pre-release with the same major, minor and patch. Pre-release parts are compared one by one, and numeric parts are compared as numbers."
      },
      {
        "question": "Do the bump buttons keep pre-release tags?",
        "answer": "No. They work from the major, minor and patch numbers and drop any pre-release or build suffix."
      }
    ],
    "example": {
      "title": "Check a version against a caret range.",
      "input": "Version: 1.4.2\nRange: ^1.2.0",
      "output": "Version 1.4.2 SATISFIES range ^1.2.0\nAllows changes that do not modify the left-most non-zero digit (>=1.2.0 <2.0.0)",
      "inputLabel": "Version and range",
      "outputLabel": "Result"
    }
  },
}
