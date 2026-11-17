import { useEffect, useId, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import ErrorBanner from '../../ui/ErrorBanner'
import FileDropzone from '../../ui/FileDropzone'
import ToggleGroup from '../../ui/ToggleGroup'
import { extractedFileName, mergedFileName, moveItem, parsePageRanges } from '../../../utils/pdfPages'
import { extractPages, mergePdfs, readPdfInfo } from '../../../utils/pdfTools'
import { formatBytes } from '../../../utils/imageCompress'

type Mode = 'merge' | 'extract'

interface Entry {
  id: number
  name: string
  size: number
  bytes: Uint8Array
  pageCount: number
}

interface Output {
  url: string
  fileName: string
  pageCount: number
  size: number
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'merge', label: 'Merge' },
  { value: 'extract', label: 'Extract pages' },
]

let nextId = 1

async function readEntries(files: File[]): Promise<{ entries: Entry[]; errors: string[] }> {
  const entries: Entry[] = []
  const errors: string[] = []
  for (const file of files) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { pageCount } = await readPdfInfo(bytes)
      entries.push({ id: nextId++, name: file.name, size: file.size, bytes, pageCount })
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Could not read this file.'}`)
    }
  }
  return { entries, errors }
}

export default function PdfMergeSplit() {
  const pagesId = useId()
  const [mode, setMode] = useState<Mode>('merge')
  const [entries, setEntries] = useState<Entry[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [pickError, setPickError] = useState('')
  const [spec, setSpec] = useState('1')
  const [output, setOutput] = useState<Output | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (output) URL.revokeObjectURL(output.url)
    }
  }, [output])

  const changeMode = (next: Mode) => {
    setMode(next)
    setEntries([])
    setErrors([])
    setOutput(null)
    setError('')
  }

  const addFiles = async (files: File[]) => {
    setOutput(null)
    setError('')
    const result = await readEntries(mode === 'extract' ? files.slice(0, 1) : files)
    setErrors(result.errors)
    setEntries(prev => (mode === 'extract' ? result.entries : [...prev, ...result.entries]))
  }

  const run = async () => {
    setError('')
    setOutput(null)
    setBusy(true)
    try {
      let bytes: Uint8Array
      let fileName: string
      if (mode === 'merge') {
        bytes = await mergePdfs(entries.map(e => e.bytes))
        fileName = mergedFileName()
      } else {
        const source = entries[0]
        const parsed = parsePageRanges(spec, source.pageCount)
        if (!parsed.ok) throw new Error(parsed.error)
        bytes = await extractPages(source.bytes, parsed.pages)
        fileName = extractedFileName(source.name)
      }
      const { pageCount } = await readPdfInfo(bytes)
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      setOutput({ url: URL.createObjectURL(blob), fileName, pageCount, size: blob.size })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while building the PDF.')
    } finally {
      setBusy(false)
    }
  }

  const ready = mode === 'merge' ? entries.length >= 2 : entries.length === 1
  const totalPages = entries.reduce((sum, e) => sum + e.pageCount, 0)

  return (
    <ToolLayout
      title="PDF Merge & Split"
      description="Merge PDFs or extract pages. Processed in your browser, never uploaded."
      tag="pdf"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={MODES} value={mode} onChange={changeMode} />
        </div>

        <div className="space-y-3">
          <FileDropzone
            key={mode}
            label={mode === 'merge' ? 'PDF files' : 'PDF file'}
            accept="application/pdf,.pdf"
            multiple={mode === 'merge'}
            onFiles={picked => {
              setPickError('')
              void addFiles(picked)
            }}
            onError={setPickError}
          />
          {pickError && <ErrorBanner message={pickError} />}
        </div>

        {errors.map(message => (
          <ErrorBanner key={message} message={message} />
        ))}

        {entries.length > 0 && (
          <ul data-testid="pdf-files" className="divide-y divide-border border border-border rounded text-xs font-mono">
            {entries.map((entry, index) => (
              <li key={entry.id} className="px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-dim">{index + 1}.</span>
                <span className="flex-1 min-w-[8rem] break-all">{entry.name}</span>
                <span className="text-dim">
                  {entry.pageCount} page{entry.pageCount === 1 ? '' : 's'} · {formatBytes(entry.size)}
                </span>
                {mode === 'merge' && (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={index === 0}
                      aria-label={`Move ${entry.name} up`}
                      onClick={() => setEntries(prev => moveItem(prev, index, index - 1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={index === entries.length - 1}
                      aria-label={`Move ${entry.name} down`}
                      onClick={() => setEntries(prev => moveItem(prev, index, index + 1))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      aria-label={`Remove ${entry.name}`}
                      onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                    >
                      Remove
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {mode === 'merge' && entries.length === 1 && (
          <p className="text-xs font-mono text-dim">Add at least one more PDF to merge.</p>
        )}
        {mode === 'merge' && entries.length >= 2 && (
          <p className="text-xs font-mono text-dim">
            {entries.length} files, {totalPages} pages in total.
          </p>
        )}

        {mode === 'extract' && entries.length === 1 && (
          <div className="text-xs font-mono">
            <label htmlFor={pagesId} className="block text-dim mb-1.5">
              Pages to keep (of {entries[0].pageCount}), e.g. 1-3, 5
            </label>
            <input
              id={pagesId}
              type="text"
              value={spec}
              onChange={e => setSpec(e.target.value)}
              className="input-base w-full"
              spellCheck={false}
            />
          </div>
        )}

        <div>
          <button type="button" className="btn-primary" disabled={!ready || busy} onClick={() => void run()}>
            {busy ? 'Working…' : mode === 'merge' ? 'Merge PDFs' : 'Extract pages'}
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        {output && (
          <div role="status" data-testid="pdf-output" className="border border-border rounded px-3 py-3 text-xs font-mono flex flex-wrap items-center gap-3">
            <span className="flex-1 min-w-[10rem]">
              {output.fileName}: {output.pageCount} page{output.pageCount === 1 ? '' : 's'} · {formatBytes(output.size)}
            </span>
            <a href={output.url} download={output.fileName} className="btn-primary" aria-label={`Download ${output.fileName}`}>
              Download
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
