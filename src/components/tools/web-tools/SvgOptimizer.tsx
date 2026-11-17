import { useEffect, useId, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import FileDropzone from '../../ui/FileDropzone'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import {
  DEFAULT_SVG_OPTIONS,
  MAX_PRECISION,
  clampPrecision,
  optimizeSvg,
  optimizedFileName,
  type SvgOptimizeOptions,
  type SvgOptimizeResult,
} from '../../../utils/svgOptimizer'
import { formatBytes } from '../../../utils/imageCompress'

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Exported from a drawing app -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <metadata>Icon v2</metadata>
  <path d="M12.000000 2.000000 L22.000000 12.000000 L12.000000 22.000000 L2.000000 12.000000 Z" fill="#000000"/>
</svg>`

const TOGGLES: { key: 'removeComments' | 'removeMetadata' | 'minifyPaths'; label: string }[] = [
  { key: 'removeComments', label: 'Remove comments' },
  { key: 'removeMetadata', label: 'Remove metadata' },
  { key: 'minifyPaths', label: 'Minify paths and numbers' },
]

/** Blob URL for an SVG string, so it can be shown in an <img> (scripts never run there). */
function useSvgUrl(text: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!text) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [text])
  return url
}

function downloadSvg(text: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function SvgOptimizer() {
  const precisionId = useId()
  const [input, setInput] = useState(SAMPLE)
  const [fileName, setFileName] = useState<string | undefined>(undefined)
  const [options, setOptions] = useState<SvgOptimizeOptions>(DEFAULT_SVG_OPTIONS)
  const [result, setResult] = useState<SvgOptimizeResult | null>(null)
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      optimizeSvg(input, options).then(next => {
        if (!cancelled) setResult(next)
      })
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [input, options])

  const output = result?.ok ? result.output : null
  const originalUrl = useSvgUrl(input.trim() ? input : null)
  const optimizedUrl = useSvgUrl(output)

  const setToggle = (key: keyof Omit<SvgOptimizeOptions, 'precision'>, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const uploadFile = async (file: File) => {
    setFileError('')
    try {
      setInput(await file.text())
      setFileName(file.name)
    } catch {
      setFileError('Could not read this file.')
    }
  }

  const savedText = result?.ok ? `${result.savedPercent}%` : '—'
  const savedClass = result?.ok && result.savedPercent < 0 ? 'text-rose-400' : 'text-emerald-400'

  return (
    <ToolLayout
      title="SVG Optimizer"
      description="Shrink SVG files and compare the result. Processed in your browser, never uploaded."
      tag="svg"
    >
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <FileDropzone
              label="Upload an SVG file"
              accept=".svg,image/svg+xml"
              maxBytes={5 * 1024 * 1024}
              tooLargeMessage="This file is larger than 5 MB. Choose a smaller SVG."
              onFiles={files => void uploadFile(files[0])}
              onError={setFileError}
            />
            {fileError && <ErrorBanner message={fileError} />}
            <TextAreaField
              label="Original SVG"
              value={input}
              onChange={value => {
                setInput(value)
                setFileName(undefined)
              }}
              placeholder="Paste SVG markup here"
              rows={12}
            />
          </div>

          <fieldset className="space-y-3 text-xs font-mono">
            <legend className="text-dim mb-2">Options</legend>
            {TOGGLES.map(toggle => (
              <label key={toggle.key} className="flex items-center gap-2 text-bright cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[toggle.key]}
                  onChange={e => setToggle(toggle.key, e.target.checked)}
                />
                {toggle.label}
              </label>
            ))}
            <div className="flex items-center gap-2">
              <label htmlFor={precisionId} className="text-bright">
                Precision (decimal places)
              </label>
              <input
                id={precisionId}
                type="number"
                min={0}
                max={MAX_PRECISION}
                step={1}
                value={options.precision}
                disabled={!options.minifyPaths}
                onChange={e => setOptions(prev => ({ ...prev, precision: clampPrecision(Number(e.target.value) || 0) }))}
                className="w-16 px-2 py-1 border border-border rounded bg-surface text-bright disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-subtle">
              Lower precision makes smaller files but rounds coordinates more. Compare the previews after each change.
            </p>
          </fieldset>
        </div>

        {result && !result.ok && input.trim() && <ErrorBanner message={result.error} />}

        {result?.ok && (
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <StatCard label="Original" value={formatBytes(result.before)} />
            <StatCard label="Optimized" value={formatBytes(result.after)} />
            <StatCard label="Saved" value={<span className={savedClass}>{savedText}</span>} />
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <figure className="border border-border rounded-lg p-3 space-y-2">
            <figcaption className="text-xs font-mono text-dim">Original preview</figcaption>
            {originalUrl ? (
              <img src={originalUrl} alt="Original SVG preview" className="w-full max-h-64 object-contain bg-muted/30 rounded" />
            ) : (
              <div className="text-xs text-subtle italic py-8 text-center">Nothing to preview yet.</div>
            )}
          </figure>
          <figure className="border border-border rounded-lg p-3 space-y-2">
            <figcaption className="text-xs font-mono text-dim">Optimized preview</figcaption>
            {optimizedUrl ? (
              <img src={optimizedUrl} alt="Optimized SVG preview" className="w-full max-h-64 object-contain bg-muted/30 rounded" />
            ) : (
              <div className="text-xs text-subtle italic py-8 text-center">Optimized preview appears here.</div>
            )}
          </figure>
        </div>

        {output !== null && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-dim">Optimized SVG</span>
              <div className="flex items-center gap-2">
                <CopyButton text={output} label="Copy" />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => downloadSvg(output, optimizedFileName(fileName))}
                >
                  Download {optimizedFileName(fileName)}
                </button>
              </div>
            </div>
            <pre
              data-testid="svg-output"
              className="p-3 max-h-64 overflow-auto rounded border border-border bg-muted/30 text-xs font-mono whitespace-pre-wrap break-all text-bright"
            >
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
