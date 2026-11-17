import { useId, useMemo, useRef, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import ErrorBanner from '../../ui/ErrorBanner'
import FileDropzone from '../../ui/FileDropzone'
import SectionPanel from '../../ui/SectionPanel'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import { formatBytes } from '../../../utils/imageCompress'
import {
  LARGE_FILE_THRESHOLD_BYTES,
  base64FromDataUrl,
  buildDataUri,
  cssBackgroundImage,
  decodeBase64ToBytes,
  decodedLength,
  extensionForMime,
  htmlImgTag,
  isImageMime,
  isLargeFile,
  normalizeMime,
  parseDataUri,
} from '../../../utils/dataUri'

type Mode = 'encode' | 'decode'

interface Encoded {
  name: string
  mime: string
  originalSize: number
  base64: string
  dataUri: string
}

const MODES: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: 'encode', label: 'Encode file' },
  { value: 'decode', label: 'Decode Data URI' },
]

const PLACEHOLDER_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

function downloadBytes(base64: string, mime: string, fileName: string) {
  const bytes = decodeBase64ToBytes(base64)
  if (!bytes) return
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ImageToBase64() {
  const [mode, setMode] = useState<Mode>('encode')

  // Encode mode state
  const [encoded, setEncoded] = useState<Encoded | null>(null)
  const [readError, setReadError] = useState('')
  const [reading, setReading] = useState(false)
  const readToken = useRef(0)

  // Decode mode state
  const [uriInput, setUriInput] = useState('')
  const [brokenPreview, setBrokenPreview] = useState('')
  const parsed = useMemo(() => parseDataUri(uriInput), [uriInput])

  function readFile(file: File | undefined) {
    const token = ++readToken.current
    setEncoded(null)
    setReadError('')
    if (!file) return

    const reader = new FileReader()
    setReading(true)
    reader.onload = () => {
      if (token !== readToken.current) return
      const base64 = base64FromDataUrl(String(reader.result ?? ''))
      setEncoded({
        name: file.name,
        mime: normalizeMime(file.type),
        originalSize: file.size,
        base64,
        dataUri: buildDataUri(file.type, base64),
      })
      setReading(false)
    }
    reader.onerror = () => {
      if (token !== readToken.current) return
      setReadError('Could not read this file. Try picking it again.')
      setReading(false)
    }
    reader.readAsDataURL(file)
  }

  const decodedName = parsed.ok ? `decoded.${extensionForMime(parsed.mime)}` : ''

  return (
    <ToolLayout
      title="Image to Base64 / Data URI"
      description="Turn an image or any small file into a Base64 string, Data URI, CSS or HTML snippet, and back"
      tag="encode"
    >
      <div className="space-y-5">
        <ToggleGroup options={MODES} value={mode} onChange={setMode} />

        {mode === 'encode' ? (
          <div className="space-y-5">
            <FileDropzone
              label="File to encode"
              onFiles={files => readFile(files[0])}
            />

            {reading && (
              <p role="status" className="text-xs font-mono text-dim">
                Reading file…
              </p>
            )}
            {readError && <ErrorBanner message={readError} />}

            {encoded && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <StatCard label="MIME type" value={encoded.mime} />
                  <StatCard label="Original size" value={formatBytes(encoded.originalSize)} subValue={encoded.name} />
                  <StatCard label="Base64 size" value={formatBytes(encoded.base64.length)} />
                </div>

                {isLargeFile(encoded.originalSize) && (
                  <ErrorBanner
                    message={`Large file: over ${formatBytes(LARGE_FILE_THRESHOLD_BYTES)}. Base64 adds about a third, so this text is slow to paste into CSS or HTML and bloats the page. Consider hosting the file and linking to it.`}
                  />
                )}

                <SectionPanel label="Raw Base64" copyText={encoded.base64}>
                  <textarea
                    readOnly
                    aria-label="Raw Base64 output"
                    value={encoded.base64}
                    className="textarea-base h-28 w-full font-mono text-xs"
                  />
                </SectionPanel>

                <SectionPanel label="Data URI" copyText={encoded.dataUri}>
                  <textarea
                    readOnly
                    aria-label="Data URI output"
                    value={encoded.dataUri}
                    className="textarea-base h-28 w-full font-mono text-xs"
                  />
                </SectionPanel>

                <SectionPanel label="CSS background-image" copyText={cssBackgroundImage(encoded.dataUri)}>
                  <textarea
                    readOnly
                    aria-label="CSS background-image output"
                    value={cssBackgroundImage(encoded.dataUri)}
                    className="textarea-base h-28 w-full font-mono text-xs"
                  />
                </SectionPanel>

                <SectionPanel label="HTML img tag" copyText={htmlImgTag(encoded.dataUri, encoded.name)}>
                  <textarea
                    readOnly
                    aria-label="HTML img tag output"
                    value={htmlImgTag(encoded.dataUri, encoded.name)}
                    className="textarea-base h-28 w-full font-mono text-xs"
                  />
                </SectionPanel>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <TextAreaField
              label="Data URI"
              value={uriInput}
              onChange={value => {
                setUriInput(value)
                setBrokenPreview('')
              }}
              className="textarea-base h-40 font-mono"
              placeholder={PLACEHOLDER_URI}
              showClearButton
              allowFileDrop={false}
            />

            {uriInput.trim() && !parsed.ok && <ErrorBanner message={`Data URI: ${parsed.error}`} />}

            {parsed.ok && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <StatCard label="MIME type" value={parsed.mime} />
                  <StatCard label="Decoded size" value={formatBytes(decodedLength(parsed.base64))} />
                </div>

                {isImageMime(parsed.mime) ? (
                  brokenPreview === parsed.dataUri ? (
                    <ErrorBanner message="The browser could not render this image. The data may be corrupt or not an image." />
                  ) : (
                    <div className="border border-border rounded-lg p-4 bg-surface flex justify-center">
                      <img
                        src={parsed.dataUri}
                        alt="Preview of the decoded image"
                        data-testid="data-uri-preview"
                        onError={() => setBrokenPreview(parsed.dataUri)}
                        className="max-h-64 max-w-full object-contain"
                      />
                    </div>
                  )
                ) : (
                  <p className="text-xs font-mono text-dim">
                    Preview is only shown for image types. The file can still be downloaded below.
                  </p>
                )}

                <div>
                  <button
                    type="button"
                    className="btn-primary"
                    aria-label={`Download ${decodedName}`}
                    onClick={() => downloadBytes(parsed.base64, parsed.mime, decodedName)}
                  >
                    Download {decodedName}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
