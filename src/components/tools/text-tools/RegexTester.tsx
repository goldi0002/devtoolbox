import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import { getErrorMessage } from '../../../utils/errors'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Match {
  value:  string
  index:  number
  end:    number
  groups: Record<string, string> | null
}

interface Flag {
  key:   string
  label: string
  desc:  string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FLAGS: Flag[] = [
  { key: 'g', label: 'global',      desc: 'Find all matches'        },
  { key: 'i', label: 'insensitive', desc: 'Case insensitive'        },
  { key: 'm', label: 'multiline',   desc: '^ and $ match each line' },
  { key: 's', label: 'dotAll',      desc: '. matches newlines'      },
]

const EXAMPLES = [
  { label: 'Email',      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',  flags: 'g',  test: 'Contact us at hello@example.com or support@dev.io for help.' },
  { label: 'URL',        pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',   flags: 'g',  test: 'Visit https://example.com or http://dev.io/docs for more info.' },
  { label: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',                  flags: 'g',  test: 'Server IPs: 192.168.1.1 and 10.0.0.255 are both valid.' },
  { label: 'Hex Color',  pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',              flags: 'g',  test: 'Colors used: #fff, #1a2b3c, #FF5733 and #abc.' },
  { label: 'Date',       pattern: '\\d{4}-\\d{2}-\\d{2}',                               flags: 'g',  test: 'Created on 2024-01-15, updated 2024-03-22, expires 2025-01-01.' },
]

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog.
Contact us at hello@example.com for support.
Visit https://toolbox4devs.com for more tools.
Server IP: 192.168.1.100`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRegex(pattern: string, flags: string): { regex: RegExp | null; error: string } {
  if (!pattern) return { regex: null, error: '' }
  try {
    return { regex: new RegExp(pattern, flags), error: '' }
  } catch (e) {
    return { regex: null, error: getErrorMessage(e, 'Invalid regular expression') }
  }
}

function getMatches(regex: RegExp | null, text: string): { matches: Match[]; error: string } {
  if (!regex || !text) return { matches: [], error: '' }
  const matches: Match[] = []
  try {
    if (regex.flags.includes('g')) {
      let m: RegExpExecArray | null
      const r = new RegExp(regex.source, regex.flags)
      while ((m = r.exec(text)) !== null) {
        matches.push({
          value:  m[0],
          index:  m.index,
          end:    m.index + m[0].length,
          groups: m.groups ?? null,
        })
        if (m[0].length === 0) r.lastIndex++
        if (matches.length > 500) break
      }
    } else {
      const m = regex.exec(text)
      if (m) {
        matches.push({
          value:  m[0],
          index:  m.index,
          end:    m.index + m[0].length,
          groups: m.groups ?? null,
        })
      }
    }
  } catch (e) {
    // Partial results are still useful, but the failure must be visible.
    return { matches, error: getErrorMessage(e, 'Matching failed on this input') }
  }
  return { matches, error: '' }
}

// ─── Highlighted text renderer ───────────────────────────────────────────────

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (!matches.length) {
    return (
      <pre className="font-mono text-sm text-dim whitespace-pre-wrap break-all leading-relaxed p-4">
        {text}
      </pre>
    )
  }

  const parts: { str: string; highlighted: boolean }[] = []
  let last = 0

  for (const m of matches) {
    if (m.index > last) {
      parts.push({ str: text.slice(last, m.index), highlighted: false })
    }
    parts.push({ str: m.value, highlighted: true })
    last = m.end
  }

  if (last < text.length) {
    parts.push({ str: text.slice(last), highlighted: false })
  }

  return (
    <pre className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed p-4">
      {parts.map((p, i) =>
        p.highlighted ? (
          <mark
            key={i}
            className="bg-bright text-bg rounded-sm px-0.5 not-italic font-medium"
          >
            {p.str}
          </mark>
        ) : (
          <span key={i} className="text-dim">{p.str}</span>
        )
      )}
    </pre>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags]     = useState('g')
  const [testStr, setTestStr] = useState(SAMPLE_TEXT)

  const { regex, error: patternError } = useMemo(() => buildRegex(pattern, flags), [pattern, flags])
  const { matches, error: matchError }  = useMemo(() => getMatches(regex, testStr), [regex, testStr])
  const error = patternError || matchError

  const toggleFlag = (f: string) => {
    setFlags(prev =>
      prev.includes(f) ? prev.replace(f, '') : prev + f
    )
  }

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setPattern(ex.pattern)
    setFlags(ex.flags)
    setTestStr(ex.test)
  }

  const fullRegex = pattern ? `/${pattern}/${flags}` : ''

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with live match highlighting"
      tag="text"
    >
      <div className="space-y-4">

        {/* Quick examples */}
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex)}
              className="text-xs font-mono px-2.5 py-1 rounded border border-border
                         text-subtle hover:border-subtle hover:text-dim transition-all duration-150"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Pattern input */}
        <div>
          <label className="block text-xs font-mono text-dim mb-1.5">Pattern</label>
          <div className="flex items-stretch border border-border rounded overflow-hidden
                          focus-within:border-subtle transition-colors">
            <span className="flex items-center px-3 bg-surface text-subtle font-mono text-sm border-r border-border select-none">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="[a-z]+"
              className="flex-1 bg-bg px-3 py-2 text-sm font-mono text-bright
                         focus:outline-none placeholder:text-muted"
              spellCheck={false}
            />
            <span className="flex items-center px-3 bg-surface text-subtle font-mono text-sm border-l border-border select-none">
              /{flags}
            </span>
            {fullRegex && (
              <div className="flex items-center px-2 bg-surface border-l border-border">
                <CopyButton text={fullRegex} />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-1.5 text-xs font-mono text-subtle bg-surface border border-border rounded px-3 py-1.5">
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Flags */}
        <div>
          <label className="block text-xs font-mono text-dim mb-1.5">Flags</label>
          <div className="flex flex-wrap gap-2">
            {FLAGS.map(f => (
              <button
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                title={f.desc}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
                            transition-all duration-150
                            ${flags.includes(f.key)
                              ? 'bg-bright text-bg border-bright'
                              : 'text-dim border-border hover:border-subtle hover:text-light'
                            }`}
              >
                <span className="font-bold">{f.key}</span>
                <span className={flags.includes(f.key) ? 'opacity-70' : 'opacity-50'}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Match count bar */}
        {pattern && !error && (
          <div className={`flex items-center justify-between px-3 py-2 rounded border text-xs font-mono
            ${matches.length > 0 ? 'bg-surface border-border' : 'bg-surface border-border'}`}>
            <span className="text-dim">
              {matches.length > 0
                ? <><span className="text-bright font-medium">{matches.length}</span> match{matches.length !== 1 ? 'es' : ''} found</>
                : 'No matches'
              }
            </span>
            {matches.length > 0 && (
              <span className="text-subtle">
                {[...new Set(matches.map(m => m.value))].length} unique
              </span>
            )}
          </div>
        )}

        {/* Test string with highlights */}
        <div>
          <label className="block text-xs font-mono text-dim mb-1.5">Test String</label>
          <div className="border border-border rounded overflow-hidden">
            <div className="relative">
              {/* Highlighted overlay — shown when there are matches */}
              {matches.length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-auto">
                  <HighlightedText text={testStr} matches={matches} />
                </div>
              )}
              <textarea
                value={testStr}
                onChange={e => setTestStr(e.target.value)}
                className={`w-full bg-bg px-4 py-4 text-sm font-mono leading-relaxed
                            focus:outline-none resize-none h-40
                            ${matches.length > 0 ? 'text-transparent caret-bright' : 'text-dim'}`}
                spellCheck={false}
                placeholder="Enter test string..."
              />
            </div>
          </div>
        </div>

        {/* Match details */}
        {matches.length > 0 && (
          <div>
            <label className="block text-xs font-mono text-dim mb-1.5">
              Matches
              <span className="ml-2 text-muted">({matches.length})</span>
            </label>
            <div className="border border-border rounded overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-3 py-2 text-subtle font-normal">#</th>
                    <th className="text-left px-3 py-2 text-subtle font-normal">Match</th>
                    <th className="text-left px-3 py-2 text-subtle font-normal">Index</th>
                    <th className="text-left px-3 py-2 text-subtle font-normal">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 100).map((m, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                      <td className="px-3 py-2 text-muted">{i + 1}</td>
                      <td className="px-3 py-2 text-bright max-w-[200px] truncate">
                        <span className="bg-bright/10 rounded px-1">{m.value}</span>
                      </td>
                      <td className="px-3 py-2 text-dim">{m.index}</td>
                      <td className="px-3 py-2 text-dim">{m.value.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 100 && (
                <p className="text-center text-xs font-mono text-subtle py-2 border-t border-border">
                  Showing first 100 of {matches.length} matches
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  )
}