import { useEffect, useRef, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import { formatBytes } from '../../../utils/imageCompress'
import { describeSyntaxError, byteLength, savingsPercent, type MinifyOutcome } from '../../../utils/minifyStats'
import { minifyJavaScript } from '../../../utils/jsMinify'
import { minifyCss } from '../../../utils/cssMinify'

type Language = 'javascript' | 'css'

interface Result {
  code: string
  originalBytes: number
  minifiedBytes: number
  savedPercent: number
  url: string
  fileName: string
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'css', label: 'CSS' },
]

const SAMPLES: Record<Language, string> = {
  javascript: `// Adds two numbers and logs the result
function addNumbers(firstValue, secondValue) {
  const total = firstValue + secondValue;
  console.log('total is', total);
  return total;
}

export const result = addNumbers(2, 3);`,
  css: `/* Card component */
.card {
  margin: 0 auto;
  padding: 16px 24px;
  color: #ffffff;
  background-color: #ffffff;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}`,
}

const MIME: Record<Language, string> = {
  javascript: 'text/javascript',
  css: 'text/css',
}

const EXTENSION: Record<Language, string> = {
  javascript: 'js',
  css: 'css',
}

export default function CssJsMinifier() {
  const [language, setLanguage] = useState<Language>('javascript')
  const [source, setSource] = useState(SAMPLES.javascript)
  const [mangle, setMangle] = useState(true)
  const [dropConsole, setDropConsole] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Each run gets an id; a run whose id is no longer current is ignored when it finishes.
  const runId = useRef(0)

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url)
    }
  }, [result])

  const invalidate = () => {
    runId.current += 1
    setResult(null)
    setError('')
    setBusy(false)
  }

  const changeLanguage = (next: Language) => {
    // Swap the sample only when the field still holds the untouched sample of the old language.
    if (source === SAMPLES[language]) setSource(SAMPLES[next])
    setLanguage(next)
    invalidate()
  }

  const changeSource = (next: string) => {
    setSource(next)
    invalidate()
  }

  const minify = async () => {
    if (!source.trim()) {
      setError('Paste some code to minify.')
      return
    }
    const id = ++runId.current
    setBusy(true)
    setResult(null)
    setError('')
    try {
      const outcome: MinifyOutcome =
        language === 'css'
          ? await minifyCss(source)
          : await minifyJavaScript(source, { mangle, dropConsole })
      if (id !== runId.current) return
      if (!outcome.ok) {
        setError(describeSyntaxError(outcome.error))
        return
      }
      const originalBytes = byteLength(source)
      const minifiedBytes = byteLength(outcome.code)
      const url = URL.createObjectURL(new Blob([outcome.code], { type: `${MIME[language]};charset=utf-8` }))
      setResult({
        code: outcome.code,
        originalBytes,
        minifiedBytes,
        savedPercent: savingsPercent(originalBytes, minifiedBytes),
        url,
        fileName: `minified.${EXTENSION[language]}`,
      })
    } catch (err) {
      if (id !== runId.current) return
      setError(`Could not minify: ${err instanceof Error ? err.message : 'unknown error'}`)
    } finally {
      if (id === runId.current) setBusy(false)
    }
  }

  return (
    <ToolLayout
      title="CSS / JS Minifier"
      description="Shrink JavaScript or CSS and see how much you saved, all in your browser"
      tag="minify"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup options={LANGUAGES} value={language} onChange={changeLanguage} />
        </div>

        <TextAreaField
          label={language === 'css' ? 'CSS input' : 'JavaScript input'}
          value={source}
          onChange={changeSource}
          className="textarea-base h-56 font-mono"
          placeholder={language === 'css' ? '.box { margin: 0 auto; }' : 'const total = a + b;'}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {language === 'javascript' ? (
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-dim">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mangle}
                  onChange={e => {
                    setMangle(e.target.checked)
                    invalidate()
                  }}
                  className="accent-[var(--color-accent)]"
                />
                Mangle names
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dropConsole}
                  onChange={e => {
                    setDropConsole(e.target.checked)
                    invalidate()
                  }}
                  className="accent-[var(--color-accent)]"
                />
                Drop console calls
              </label>
            </div>
          ) : (
            <span className="text-xs font-mono text-dim">Comments are removed and values shortened.</span>
          )}
          <button type="button" className="btn-primary" onClick={minify} disabled={busy}>
            {busy ? 'Minifying…' : 'Minify'}
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        {result && (
          <section aria-labelledby="minify-output-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="minify-output-heading" className="text-sm font-semibold">
                Minified output
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton text={result.code} label="Copy" />
                <a href={result.url} download={result.fileName} className="btn-ghost" aria-label={`Download ${result.fileName}`}>
                  Download {result.fileName}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <StatCard label="Original" value={formatBytes(result.originalBytes)} />
              <StatCard label="Minified" value={formatBytes(result.minifiedBytes)} />
              <StatCard
                label="Saved"
                value={`${result.savedPercent.toFixed(1)}%`}
                valueClassName={result.savedPercent < 0 ? 'text-red-500' : ''}
                subtext={result.savedPercent < 0 ? 'Output is larger than input' : undefined}
              />
            </div>

            <pre
              data-testid="minify-output"
              className="max-h-72 overflow-auto rounded border border-border bg-surface p-3 text-xs font-mono whitespace-pre-wrap break-all"
            >
              {result.code || '(empty output)'}
            </pre>
          </section>
        )}
      </div>
    </ToolLayout>
  )
}
