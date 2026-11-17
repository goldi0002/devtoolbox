import { useEffect, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import {
  CONFIG_FORMATS,
  CONFIG_FORMAT_EXTENSION,
  CONFIG_FORMAT_MIME,
  CONFIG_SAMPLES,
  convertConfig,
  describeConversionError,
  type ConfigFormat,
  type ConversionOutcome,
} from '../../../utils/configConverter'

const FORMAT_LABEL: Record<ConfigFormat, string> = {
  toml: 'TOML',
  json: 'JSON',
  yaml: 'YAML',
}

interface Download {
  url: string
  fileName: string
}

export default function TomlJsonYamlConverter() {
  const [from, setFrom] = useState<ConfigFormat>('toml')
  const [to, setTo] = useState<ConfigFormat>('json')
  const [source, setSource] = useState(CONFIG_SAMPLES.toml)
  const [indent, setIndent] = useState(2)
  const [outcome, setOutcome] = useState<ConversionOutcome | null>(null)
  const [download, setDownload] = useState<Download | null>(null)

  // Convert whenever the input or a setting changes. A run that has been overtaken is ignored.
  useEffect(() => {
    if (!source.trim()) {
      setOutcome(null)
      return
    }
    let current = true
    convertConfig(source, from, to, { indent }).then(next => {
      if (current) setOutcome(next)
    })
    return () => {
      current = false
    }
  }, [source, from, to, indent])

  // Build the downloadable file for a successful result and release it when it is replaced.
  useEffect(() => {
    if (!outcome?.ok) {
      setDownload(null)
      return
    }
    const url = URL.createObjectURL(new Blob([outcome.text], { type: `${CONFIG_FORMAT_MIME[to]};charset=utf-8` }))
    setDownload({ url, fileName: `converted.${CONFIG_FORMAT_EXTENSION[to]}` })
    return () => URL.revokeObjectURL(url)
  }, [outcome, to])

  const changeFrom = (next: ConfigFormat) => {
    // Swap in the sample for the new format only while the input still holds the untouched sample.
    if (source === CONFIG_SAMPLES[from]) setSource(CONFIG_SAMPLES[next])
    setFrom(next)
  }

  const swap = () => {
    const converted = outcome?.ok ? outcome.text : null
    setFrom(to)
    setTo(from)
    if (converted !== null) setSource(converted)
  }

  const convertedText = outcome?.ok ? outcome.text : ''

  return (
    <ToolLayout
      title="TOML / JSON / YAML Converter"
      description="Convert between TOML, JSON and YAML in any direction. Syntax errors show their line and column, and the result downloads with the right file extension."
      tag="data"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <span id="convert-from-label" className="block text-xs text-dim font-mono">
              From
            </span>
            <div role="group" aria-labelledby="convert-from-label">
              <ToggleGroup options={CONFIG_FORMATS} value={from} onChange={changeFrom} />
            </div>
          </div>

          <button type="button" className="btn-ghost" onClick={swap}>
            Swap
          </button>

          <div className="space-y-1.5">
            <span id="convert-to-label" className="block text-xs text-dim font-mono">
              To
            </span>
            <div role="group" aria-labelledby="convert-to-label">
              <ToggleGroup options={CONFIG_FORMATS} value={to} onChange={setTo} />
            </div>
          </div>

          {to === 'toml' ? (
            <span className="text-xs font-mono text-dim pb-2">TOML output has a fixed layout.</span>
          ) : (
            <label className="flex items-center gap-2 text-xs font-mono text-dim pb-1.5">
              <span>Indentation</span>
              <select
                value={indent}
                onChange={e => setIndent(Number(e.target.value))}
                className="bg-bg border border-border text-bright rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>
          )}
        </div>

        <TextAreaField
          label={`${FORMAT_LABEL[from]} input`}
          value={source}
          onChange={setSource}
          className="textarea-base h-56 font-mono"
          placeholder={`Paste a ${FORMAT_LABEL[from]} document here`}
        />

        {!source.trim() && <p className="text-xs font-mono text-dim">Paste a document to convert it.</p>}

        {outcome && !outcome.ok && <ErrorBanner message={describeConversionError(outcome.error)} />}

        {outcome?.ok && (
          <section aria-labelledby="convert-output-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="convert-output-heading" className="text-sm font-semibold">
                {FORMAT_LABEL[to]} output
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton text={convertedText} label="Copy" />
                {download && (
                  <a
                    href={download.url}
                    download={download.fileName}
                    className="btn-ghost"
                    aria-label={`Download ${download.fileName}`}
                  >
                    Download {download.fileName}
                  </a>
                )}
              </div>
            </div>

            <pre
              data-testid="convert-output"
              className="max-h-96 overflow-auto rounded border border-border bg-surface p-3 text-xs font-mono whitespace-pre-wrap break-all"
            >
              {convertedText || '(empty output)'}
            </pre>
          </section>
        )}
      </div>
    </ToolLayout>
  )
}
