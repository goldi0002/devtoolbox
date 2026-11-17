import { useEffect, useId, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import ErrorBanner from '../../ui/ErrorBanner'
import FileDropzone from '../../ui/FileDropzone'
import ToggleGroup from '../../ui/ToggleGroup'
import {
  FORMATS,
  clampQuality,
  encodedAs,
  fitWithin,
  formatBytes,
  formatInfo,
  outputFileName,
  savedPercent,
  type OutputFormat,
} from '../../../utils/imageCompress'

interface Result {
  id: string
  name: string
  originalSize: number
  size: number
  width: number
  height: number
  url: string
  fileName: string
  fellBack: boolean
}

interface Failure {
  id: string
  name: string
  message: string
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

async function compress(
  file: File,
  format: OutputFormat,
  quality: number,
  maxWidth: number,
  maxHeight: number
): Promise<Omit<Result, 'id'>> {
  const bitmap = await createImageBitmap(file)
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxWidth, maxHeight)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser.')
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await toBlob(canvas, format, quality)
    if (!blob) throw new Error('The browser could not encode this image.')
    const fellBack = !encodedAs(blob.type, format)
    return {
      name: file.name,
      originalSize: file.size,
      size: blob.size,
      width,
      height,
      url: URL.createObjectURL(blob),
      fileName: outputFileName(file.name, fellBack ? 'image/png' : format),
      fellBack,
    }
  } finally {
    bitmap.close()
  }
}

export default function ImageCompressor() {
  const qualityId = useId()
  const widthId = useId()
  const heightId = useId()
  const [files, setFiles] = useState<File[]>([])
  const [pickError, setPickError] = useState('')
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(0)
  const [maxHeight, setMaxHeight] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [failures, setFailures] = useState<Failure[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (files.length === 0) {
      setResults([])
      setFailures([])
      return
    }
    let cancelled = false
    const created: string[] = []
    setBusy(true)
    void (async () => {
      const done: Result[] = []
      const failed: Failure[] = []
      for (const [index, file] of files.entries()) {
        const id = `${index}-${file.name}`
        try {
          const result = await compress(file, format, clampQuality(quality), maxWidth, maxHeight)
          created.push(result.url)
          done.push({ id, ...result })
        } catch (err) {
          failed.push({
            id,
            name: file.name,
            message: err instanceof Error ? err.message : 'Could not read this file as an image.',
          })
        }
      }
      if (cancelled) {
        created.forEach(url => URL.revokeObjectURL(url))
        return
      }
      setResults(done)
      setFailures(failed)
      setBusy(false)
    })()
    return () => {
      cancelled = true
      created.forEach(url => URL.revokeObjectURL(url))
    }
  }, [files, format, quality, maxWidth, maxHeight])

  const info = formatInfo(format)
  const toLimit = (value: string) => Math.max(0, Math.min(20000, Math.floor(Number(value)) || 0))

  return (
    <ToolLayout
      title="Image Compressor & Converter"
      description="Compress and convert images in your browser. Nothing is uploaded."
      tag="image"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <FileDropzone
            label="Images"
            accept="image/*"
            multiple
            onFiles={picked => {
              setPickError('')
              setFiles(picked)
            }}
            onError={setPickError}
          />
          {pickError && <ErrorBanner message={pickError} />}
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleGroup options={FORMATS.map(f => ({ value: f.mime, label: f.label }))} value={format} onChange={setFormat} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label htmlFor={qualityId} className="block text-dim mb-1.5">
              Quality: {info.lossy ? `${quality}%` : 'n/a (PNG is lossless)'}
            </label>
            <input
              id={qualityId}
              type="range"
              min={1}
              max={100}
              value={quality}
              disabled={!info.lossy}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>
          <div>
            <label htmlFor={widthId} className="block text-dim mb-1.5">
              Max width (px, 0 = original)
            </label>
            <input
              id={widthId}
              type="number"
              min={0}
              max={20000}
              value={maxWidth}
              onChange={e => setMaxWidth(toLimit(e.target.value))}
              className="input-base w-full"
            />
          </div>
          <div>
            <label htmlFor={heightId} className="block text-dim mb-1.5">
              Max height (px, 0 = original)
            </label>
            <input
              id={heightId}
              type="number"
              min={0}
              max={20000}
              value={maxHeight}
              onChange={e => setMaxHeight(toLimit(e.target.value))}
              className="input-base w-full"
            />
          </div>
        </div>

        {busy && (
          <p role="status" className="text-xs font-mono text-dim">
            Compressing…
          </p>
        )}

        {failures.map(f => (
          <ErrorBanner key={f.id} message={`${f.name}: ${f.message}`} />
        ))}

        {results.length > 0 && (
          <ul data-testid="image-results" className="divide-y divide-border border border-border rounded text-xs font-mono">
            {results.map(r => {
              const pct = savedPercent(r.originalSize, r.size)
              return (
                <li key={r.id} className="px-3 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <img src={r.url} alt={`Preview of ${r.fileName}`} className="h-12 w-12 object-cover rounded border border-border" />
                  <div className="flex-1 min-w-[10rem]">
                    <div className="break-all">{r.fileName}</div>
                    <div className="text-dim">
                      {r.width} × {r.height} px · {formatBytes(r.originalSize)} → {formatBytes(r.size)} ·{' '}
                      <span data-testid="saved">{pct >= 0 ? `${pct}% smaller` : `${-pct}% larger`}</span>
                    </div>
                    {r.fellBack && (
                      <div className="text-dim">Your browser cannot encode {info.label}, so this was saved as PNG.</div>
                    )}
                  </div>
                  <a href={r.url} download={r.fileName} className="btn-ghost" aria-label={`Download ${r.fileName}`}>
                    Download
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </ToolLayout>
  )
}
