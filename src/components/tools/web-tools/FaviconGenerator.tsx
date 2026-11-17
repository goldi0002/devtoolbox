import { useEffect, useId, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import FileDropzone from '../../ui/FileDropzone'
import {
  ICO_FILE_NAME,
  ICO_SIZES,
  MANIFEST_FILE_NAME,
  PNG_SIZES,
  ZIP_FILE_NAME,
  buildIco,
  buildLinkTags,
  buildManifest,
  containRect,
  pngFileName,
  sanitizeHexColor,
  zipFiles,
} from '../../../utils/favicon'
import { formatBytes } from '../../../utils/imageCompress'

const MAX_BYTES = 5 * 1024 * 1024

interface PngOutput {
  name: string
  size: number
  url: string
  bytes: Uint8Array
  blob: Blob
}

interface Outputs {
  pngs: PngOutput[]
  icoUrl: string
  icoBytes: Uint8Array
  icoBlob: Blob
}

/** Decodes the file through an <img> so SVGs are drawn as vectors. */
function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this file as an image.'))
    }
    img.src = url
  })
}

async function renderPng(img: HTMLImageElement, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  // SVGs without a fixed size report 0; drawing into an explicit square still works.
  const { dx, dy, dw, dh } = containRect(img.naturalWidth || 512, img.naturalHeight || 512, size)
  ctx.drawImage(img, dx, dy, dw, dh)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('The browser could not encode a PNG at this size.')
  return blob
}

async function generate(file: File, register: (url: string) => void): Promise<Outputs> {
  const img = await loadImage(file)
  const pngs: PngOutput[] = []
  for (const size of PNG_SIZES) {
    const blob = await renderPng(img, size)
    const url = URL.createObjectURL(blob)
    register(url)
    pngs.push({ name: pngFileName(size), size, url, blob, bytes: new Uint8Array(await blob.arrayBuffer()) })
  }
  const icoBytes = buildIco(pngs.filter(p => (ICO_SIZES as readonly number[]).includes(p.size)).map(p => p.bytes))
  const icoBlob = new Blob([icoBytes], { type: 'image/x-icon' })
  const icoUrl = URL.createObjectURL(icoBlob)
  register(icoUrl)
  return { pngs, icoUrl, icoBytes, icoBlob }
}

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function FaviconGenerator() {
  const nameId = useId()
  const baseId = useId()
  const colorId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [siteName, setSiteName] = useState('My Site')
  const [basePath, setBasePath] = useState('/')
  const [themeColor, setThemeColor] = useState('#ffffff')
  const [outputs, setOutputs] = useState<Outputs | null>(null)
  const [genError, setGenError] = useState('')
  const [busy, setBusy] = useState(false)
  const [zipping, setZipping] = useState(false)

  useEffect(() => {
    if (!file) {
      setOutputs(null)
      setGenError('')
      return
    }
    let cancelled = false
    const urls: string[] = []
    const revokeAll = () => urls.forEach(url => URL.revokeObjectURL(url))
    setBusy(true)
    setGenError('')
    generate(file, url => {
      urls.push(url)
    })
      .then(result => {
        if (cancelled) {
          revokeAll()
          return
        }
        setOutputs(result)
      })
      .catch((err: unknown) => {
        if (cancelled) {
          revokeAll()
          return
        }
        setOutputs(null)
        setGenError(err instanceof Error ? err.message : 'Could not create the icons from this file.')
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
      revokeAll()
    }
  }, [file])

  const linkTags = buildLinkTags(basePath)
  const manifest = buildManifest(siteName, sanitizeHexColor(themeColor))

  const downloadZip = async () => {
    if (!outputs) return
    setZipping(true)
    try {
      const data = await zipFiles([
        ...outputs.pngs.map(p => ({ name: p.name, data: p.bytes })),
        { name: ICO_FILE_NAME, data: outputs.icoBytes },
        { name: MANIFEST_FILE_NAME, data: new TextEncoder().encode(manifest) },
      ])
      const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }))
      triggerDownload(url, ZIP_FILE_NAME)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setGenError('Could not build the ZIP file. Download the files one by one instead.')
    } finally {
      setZipping(false)
    }
  }

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Create favicon PNGs, favicon.ico, apple-touch-icon and site.webmanifest from one image. Processed in your browser."
      tag="image"
    >
      <div className="space-y-5">
        <FileDropzone
          label="Source image"
          accept="image/png,image/jpeg,image/svg+xml"
          maxBytes={MAX_BYTES}
          tooLargeMessage="This file is larger than 5 MB. Choose a smaller image."
          hint="PNG, JPEG or SVG up to 5 MB."
          onFiles={files => {
            setFileError('')
            setFile(files[0])
          }}
          onError={setFileError}
        />

        {fileError && <ErrorBanner message={fileError} />}
        {genError && <ErrorBanner message={genError} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label htmlFor={nameId} className="block text-dim mb-1.5">
              Site name (manifest)
            </label>
            <input id={nameId} type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label htmlFor={baseId} className="block text-dim mb-1.5">
              Base path (where the files are hosted)
            </label>
            <input id={baseId} type="text" value={basePath} onChange={e => setBasePath(e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label htmlFor={colorId} className="block text-dim mb-1.5">
              Theme color (manifest)
            </label>
            <input
              id={colorId}
              type="color"
              value={sanitizeHexColor(themeColor)}
              onChange={e => setThemeColor(e.target.value)}
              className="h-9 w-full rounded border border-border bg-surface"
            />
          </div>
        </div>

        {busy && (
          <p role="status" className="text-xs font-mono text-dim">
            Creating icons…
          </p>
        )}

        {outputs && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <button type="button" onClick={downloadZip} disabled={zipping} className="btn-ghost" aria-label="Download all as ZIP">
                {zipping ? 'Building ZIP…' : 'Download all as ZIP'}
              </button>
              <span className="text-subtle">
                PNG {PNG_SIZES.join(', ')} px · {ICO_FILE_NAME} · {MANIFEST_FILE_NAME}
              </span>
            </div>

            <ul data-testid="favicon-results" className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              {outputs.pngs.map(p => (
                <li key={p.name} className="border border-border rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="h-24 w-24 flex items-center justify-center bg-muted/30 rounded">
                    <img
                      src={p.url}
                      alt={`Preview of ${p.name}`}
                      width={Math.min(p.size, 96)}
                      height={Math.min(p.size, 96)}
                      className="max-h-24 max-w-24"
                    />
                  </div>
                  <div className="text-center break-all">{p.name}</div>
                  <div className="text-dim">
                    {p.size} × {p.size} · {formatBytes(p.blob.size)}
                  </div>
                  <a href={p.url} download={p.name} className="btn-ghost" aria-label={`Download ${p.name}`}>
                    Download
                  </a>
                </li>
              ))}
              <li className="border border-border rounded-lg p-3 flex flex-col items-center gap-2">
                <div className="h-24 w-24 flex items-center justify-center text-dim text-center rounded bg-muted/30">
                  .ico
                </div>
                <div className="text-center break-all">{ICO_FILE_NAME}</div>
                <div className="text-dim text-center">
                  16, 32, 48 px · {formatBytes(outputs.icoBlob.size)}
                </div>
                <a href={outputs.icoUrl} download={ICO_FILE_NAME} className="btn-ghost" aria-label={`Download ${ICO_FILE_NAME}`}>
                  Download
                </a>
              </li>
            </ul>
          </>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dim">HTML link tags</span>
              <CopyButton text={linkTags} aria-label="Copy link tags" label="Copy" />
            </div>
            <textarea
              readOnly
              aria-label="HTML link tags"
              value={linkTags}
              rows={8}
              className="textarea-base w-full font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dim">{MANIFEST_FILE_NAME}</span>
              <CopyButton text={manifest} aria-label="Copy web app manifest" label="Copy" />
            </div>
            <textarea
              readOnly
              aria-label="Web app manifest"
              value={manifest}
              rows={8}
              className="textarea-base w-full font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

