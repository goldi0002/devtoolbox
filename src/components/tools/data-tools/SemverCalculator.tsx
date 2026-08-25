import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import { tools } from '../../../tools/registry'
import { Check, X, ArrowUpRight, GitCommit, Filter, ArrowUpDown, Sparkles, AlertCircle } from 'lucide-react'
import CopyButton from '../../CopyButton'

// Regex for SemVer 2.0.0 (https://semver.org/)
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

interface ParsedSemVer {
  raw: string
  major: number
  minor: number
  patch: number
  prerelease: string
  build: string
  isValid: boolean
}

function parseSemVer(versionStr: string): ParsedSemVer {
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
function compareSemVer(a: ParsedSemVer, b: ParsedSemVer): number {
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

// Range satisfier implementation for common NPM / SemVer ranges
function satisfiesRange(version: ParsedSemVer, rangeStr: string): { satisfies: boolean; explanation: string } {
  if (!version.isValid) {
    return { satisfies: false, explanation: 'Invalid version string' }
  }

  const range = rangeStr.trim()
  if (!range || range === '*' || range === 'x' || range === 'X') {
    return { satisfies: true, explanation: 'Matches any version (*)' }
  }

  // Handle OR clauses: "1.2.3 || >=2.0.0"
  if (range.includes('||')) {
    const clauses = range.split('||').map(c => c.trim())
    const results = clauses.map(c => satisfiesRange(version, c))
    const matched = results.some(r => r.satisfies)
    return {
      satisfies: matched,
      explanation: `Evaluated against multiple clauses (${clauses.join(' OR ')})`,
    }
  }

  // Caret ranges: ^1.2.3
  if (range.startsWith('^')) {
    const target = parseSemVer(range.slice(1))
    if (!target.isValid) return { satisfies: false, explanation: 'Invalid target in caret range' }

    if (target.major !== 0) {
      // ^1.2.3 := >=1.2.3 <2.0.0
      const satisfies = compareSemVer(version, target) >= 0 && version.major === target.major
      return {
        satisfies,
        explanation: `Allows changes that do not modify the left-most non-zero digit (>=${target.raw.replace('^','')} <${target.major + 1}.0.0)`,
      }
    } else if (target.minor !== 0) {
      // ^0.2.3 := >=0.2.3 <0.3.0
      const satisfies = compareSemVer(version, target) >= 0 && version.major === 0 && version.minor === target.minor
      return {
        satisfies,
        explanation: `Allows patch-level updates only (>=${target.raw.replace('^','')} <0.${target.minor + 1}.0)`,
      }
    } else {
      // ^0.0.3 := =0.0.3
      const satisfies = compareSemVer(version, target) === 0
      return {
        satisfies,
        explanation: `Exact match required for 0.0.x versions (=${target.raw.replace('^','')})`,
      }
    }
  }

  // Tilde ranges: ~1.2.3 or ~1.2
  if (range.startsWith('~')) {
    const target = parseSemVer(range.slice(1))
    if (!target.isValid) return { satisfies: false, explanation: 'Invalid target in tilde range' }

    // ~1.2.3 := >=1.2.3 <1.3.0
    const satisfies = compareSemVer(version, target) >= 0 && version.major === target.major && version.minor === target.minor
    return {
      satisfies,
      explanation: `Allows patch-level changes if minor is specified (>=${target.raw.replace('~','')} <${target.major}.${target.minor + 1}.0)`,
    }
  }

  // Simple equality
  const target = parseSemVer(range)
  if (target.isValid) {
    const satisfies = compareSemVer(version, target) === 0
    return {
      satisfies,
      explanation: `Exact equality check (${version.raw} == ${target.raw})`,
    }
  }

  return { satisfies: false, explanation: 'Unsupported or unparsed range expression' }
}

const PRESETS = [
  { version: '1.4.2', range: '^1.2.0', label: 'Caret Range (^1.2.0)' },
  { version: '2.0.0-rc.1', range: '>=2.0.0-alpha', label: 'Prerelease RC' },
  { version: '0.3.5', range: '~0.3.0', label: 'Tilde Range (~0.3.0)' },
  { version: '3.1.0', range: '^3.0.0', label: 'Major Compatibility (^3.0.0)' },
]

export default function SemverCalculator() {
  const [versionInput, setVersionInput] = useState('1.4.2')
  const [rangeInput, setRangeInput] = useState('^1.2.0')
  const [batchInput, setBatchInput] = useState('2.1.0\n1.0.0-beta.2\n1.0.0\n1.0.0-alpha.1\n0.9.4\n3.0.0-rc.1\n1.0.1')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const meta = tools.find(t => t.slug === 'semver-calculator')

  const parsed = useMemo(() => parseSemVer(versionInput), [versionInput])
  const rangeResult = useMemo(() => satisfiesRange(parsed, rangeInput), [parsed, rangeInput])

  // Bumping helpers
  const bumpMajor = parsed.isValid ? `${parsed.major + 1}.0.0` : ''
  const bumpMinor = parsed.isValid ? `${parsed.major}.${parsed.minor + 1}.0` : ''
  const bumpPatch = parsed.isValid ? `${parsed.major}.${parsed.minor}.${parsed.patch + 1}` : ''
  const bumpPreMajor = parsed.isValid ? `${parsed.major + 1}.0.0-alpha.0` : ''
  const bumpPreMinor = parsed.isValid ? `${parsed.major}.${parsed.minor + 1}.0-alpha.0` : ''
  const bumpPrePatch = parsed.isValid ? `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-alpha.0` : ''

  // Batch sorted versions
  const sortedBatch = useMemo(() => {
    const lines = batchInput.split('\n').map(l => l.trim()).filter(Boolean)
    const list = lines.map(parseSemVer)
    return list.sort((a, b) => {
      if (!a.isValid && b.isValid) return 1
      if (a.isValid && !b.isValid) return -1
      const cmp = compareSemVer(a, b)
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [batchInput, sortOrder])

  return (
    <ToolLayout
      title={meta?.name || 'Semantic Versioning (SemVer) Calculator'}
      description={meta?.description || 'Parse, test ranges, compare, sort, and calculate version increments according to SemVer 2.0.0 specification.'}
      tag="SEMVER"
    >
      <div className="space-y-6">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-surface border border-border rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-dim mr-2">
            <Sparkles size={14} className="text-accent" />
            <span>Sample Presets:</span>
          </div>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setVersionInput(preset.version)
                setRangeInput(preset.range)
              }}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Top Split: Version Inspector & Range Satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Version Breakdown Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-mono text-dim mb-1.5 font-medium">
                  SemVer Version String
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={versionInput}
                    onChange={(e) => setVersionInput(e.target.value)}
                    placeholder="e.g. 1.4.2 or 2.0.0-rc.1"
                    className="flex-1 px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
                  />
                  <CopyButton text={versionInput} />
                </div>
              </div>

              {parsed.isValid ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                      <span className="eyebrow block mb-1">MAJOR</span>
                      <span className="text-lg font-mono font-bold text-indigo-400">{parsed.major}</span>
                      <span className="text-[10px] block text-dim">Breaking Changes</span>
                    </div>
                    <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                      <span className="eyebrow block mb-1">MINOR</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">{parsed.minor}</span>
                      <span className="text-[10px] block text-dim">New Features</span>
                    </div>
                    <div className="p-2.5 bg-bg border border-border/70 rounded-lg">
                      <span className="eyebrow block mb-1">PATCH</span>
                      <span className="text-lg font-mono font-bold text-amber-400">{parsed.patch}</span>
                      <span className="text-[10px] block text-dim">Bug Fixes</span>
                    </div>
                  </div>

                  {(parsed.prerelease || parsed.build) && (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {parsed.prerelease && (
                        <div className="p-2 bg-bg border border-border/70 rounded-lg">
                          <span className="text-dim block text-[10px]">Pre-release:</span>
                          <span className="text-purple-400 font-semibold">{parsed.prerelease}</span>
                        </div>
                      )}
                      {parsed.build && (
                        <div className="p-2 bg-bg border border-border/70 rounded-lg">
                          <span className="text-dim block text-[10px]">Build Metadata:</span>
                          <span className="text-cyan-400 font-semibold">{parsed.build}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-mono text-rose-400 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Invalid SemVer format. Expected format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]</span>
                </div>
              )}
            </div>

            {/* Version Bumping Shortcuts */}
            {parsed.isValid && (
              <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <span className="eyebrow block">Calculate Next Version Increment</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpMajor)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Bump Major</span>
                    <span className="text-xs font-mono font-bold text-bright">{bumpMajor}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpMinor)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Bump Minor</span>
                    <span className="text-xs font-mono font-bold text-bright">{bumpMinor}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpPatch)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Bump Patch</span>
                    <span className="text-xs font-mono font-bold text-bright">{bumpPatch}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpPreMajor)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Pre-Major Alpha</span>
                    <span className="text-xs font-mono text-purple-400">{bumpPreMajor}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpPreMinor)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Pre-Minor Alpha</span>
                    <span className="text-xs font-mono text-purple-400">{bumpPreMinor}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersionInput(bumpPrePatch)}
                    className="p-2 bg-bg hover:bg-muted border border-border rounded-lg text-left transition-colors"
                  >
                    <span className="text-[10px] font-mono text-dim block">Pre-Patch Alpha</span>
                    <span className="text-xs font-mono text-purple-400">{bumpPrePatch}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Range Tester & Rules Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-mono text-dim mb-1.5 font-medium">
                  SemVer Range Expression (NPM / Cargo / Pip format)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. ^1.2.0 or ~2.0.0"
                    className="flex-1 px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
                  />
                  <CopyButton text={rangeInput} />
                </div>
              </div>

              {/* Range Match Result Badge */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  rangeResult.satisfies
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {rangeResult.satisfies ? (
                  <Check size={20} className="shrink-0 mt-0.5" />
                ) : (
                  <X size={20} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-mono text-sm font-bold">
                    {rangeResult.satisfies
                      ? `Version ${versionInput} SATISFIES range ${rangeInput}`
                      : `Version ${versionInput} DOES NOT satisfy range ${rangeInput}`}
                  </div>
                  <p className="text-xs text-dim mt-1 font-mono">
                    {rangeResult.explanation}
                  </p>
                </div>
              </div>

              {/* Range Rules Quick Reference */}
              <div className="p-3 bg-bg border border-border/70 rounded-lg space-y-2 text-xs font-mono">
                <span className="text-[11px] font-semibold text-bright block">Range Rules Cheat Sheet:</span>
                <div className="grid grid-cols-1 gap-1.5 text-dim">
                  <div className="flex justify-between">
                    <code className="text-indigo-400">^1.2.3</code>
                    <span>Compatible with 1.2.3 through &lt;2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-emerald-400">~1.2.3</code>
                    <span>Allows patches (1.2.3 through &lt;1.3.0)</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-amber-400">1.2.x</code>
                    <span>Matches any patch version in 1.2</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-purple-400">* or x</code>
                    <span>Matches any major.minor.patch release</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Version Sorter and Comparator */}
        <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-mono font-semibold text-bright">Batch SemVer Sorter & Precedence Comparator</h2>
              <p className="text-xs text-dim">Sort version tags according to strict SemVer 2.0 precedence rules</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border transition-colors"
              >
                <ArrowUpDown size={13} />
                <span>Order: {sortOrder === 'desc' ? 'Highest First (Desc)' : 'Lowest First (Asc)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-dim mb-1 font-medium">Input Versions (One per line)</label>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={6}
                className="w-full p-3 font-mono text-xs bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-dim font-medium">Sorted Version List</label>
                <CopyButton text={sortedBatch.map(s => s.raw).join('\n')} />
              </div>
              <div className="p-3 bg-bg border border-border rounded-lg h-[138px] overflow-auto font-mono text-xs space-y-1">
                {sortedBatch.map((ver, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5 border-b border-border/30 last:border-none">
                    <span className={ver.isValid ? (idx === 0 ? 'text-emerald-400 font-bold' : 'text-bright') : 'text-rose-400 line-through'}>
                      {ver.raw}
                    </span>
                    <span className="text-[10px] text-dim">
                      {ver.isValid ? `#${idx + 1}` : 'invalid'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
