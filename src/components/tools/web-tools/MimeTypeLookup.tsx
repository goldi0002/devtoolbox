import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import DataTable from '../../ui/DataTable'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import TextInputField from '../../ui/TextInputField'
import { matchesQuery } from '../../../utils/text'

type MimeRow = {
  extension: string
  mime: string
  category: string
  notes: string
}

const MIME_TYPES: MimeRow[] = [
  { extension: '.txt', mime: 'text/plain', category: 'Text', notes: 'Plain text files and logs.' },
  { extension: '.html', mime: 'text/html', category: 'Text', notes: 'Standard HTML documents.' },
  { extension: '.css', mime: 'text/css', category: 'Text', notes: 'Stylesheets served to browsers.' },
  { extension: '.csv', mime: 'text/csv', category: 'Text', notes: 'Comma-separated text data.' },
  { extension: '.js', mime: 'text/javascript', category: 'Script', notes: 'JavaScript source for the web.' },
  { extension: '.mjs', mime: 'text/javascript', category: 'Script', notes: 'ES module JavaScript files.' },
  { extension: '.json', mime: 'application/json', category: 'Application', notes: 'JSON APIs, config, and data exchange.' },
  { extension: '.map', mime: 'application/json', category: 'Application', notes: 'Source map files.' },
  { extension: '.pdf', mime: 'application/pdf', category: 'Document', notes: 'PDF documents.' },
  { extension: '.zip', mime: 'application/zip', category: 'Archive', notes: 'ZIP archives and bundles.' },
  { extension: '.tar', mime: 'application/x-tar', category: 'Archive', notes: 'TAR archives.' },
  { extension: '.gz', mime: 'application/gzip', category: 'Archive', notes: 'Gzip-compressed assets or archives.' },
  { extension: '.xml', mime: 'application/xml', category: 'Application', notes: 'XML APIs and documents.' },
  { extension: '.wasm', mime: 'application/wasm', category: 'Application', notes: 'WebAssembly modules.' },
  { extension: '.svg', mime: 'image/svg+xml', category: 'Image', notes: 'Scalable vector graphics.' },
  { extension: '.png', mime: 'image/png', category: 'Image', notes: 'Lossless bitmap image format.' },
  { extension: '.jpg', mime: 'image/jpeg', category: 'Image', notes: 'JPEG image files.' },
  { extension: '.webp', mime: 'image/webp', category: 'Image', notes: 'Modern compressed web image format.' },
  { extension: '.ico', mime: 'image/x-icon', category: 'Image', notes: 'Favicons and icon resources.' },
  { extension: '.woff', mime: 'font/woff', category: 'Font', notes: 'Web Open Font Format.' },
  { extension: '.woff2', mime: 'font/woff2', category: 'Font', notes: 'Compressed web font format.' },
  { extension: '.ttf', mime: 'font/ttf', category: 'Font', notes: 'TrueType fonts.' },
  { extension: '.mp3', mime: 'audio/mpeg', category: 'Audio', notes: 'MP3 audio.' },
  { extension: '.wav', mime: 'audio/wav', category: 'Audio', notes: 'Waveform audio files.' },
  { extension: '.mp4', mime: 'video/mp4', category: 'Video', notes: 'MPEG-4 video.' },
  { extension: '.webm', mime: 'video/webm', category: 'Video', notes: 'Open web video format.' },
]

export default function MimeTypeLookup() {
  const [query, setQuery] = useState('json')

  const matches = useMemo(
    () => MIME_TYPES.filter(row => matchesQuery(query, [row.extension, row.mime, row.category, row.notes])),
    [query]
  )

  const exactMatch = useMemo(() => {
    const normalized = query.trim().toLowerCase().replace(/^\./, '')
    if (!normalized) return undefined
    return MIME_TYPES.find((row) => row.extension.slice(1) === normalized || row.mime.toLowerCase() === query.trim().toLowerCase())
  }, [query])

  return (
    <ToolLayout
      title="MIME Type Lookup"
      description="Search common content types and file extensions for uploads, headers, and static assets"
      tag="web"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          {['json', 'svg', 'woff2', 'application/json'].map((preset) => (
            <button key={preset} onClick={() => setQuery(preset)} className="btn-ghost">
              {preset}
            </button>
          ))}
          <button onClick={() => setQuery('')} className="btn-primary ml-auto">Show all</button>
        </div>

        <TextInputField
          label="Search by extension, MIME type, or format"
          value={query}
          onChange={setQuery}
          placeholder="e.g. .svg, application/json, font, zip"
        />

        {exactMatch && (
          <QuickAnswerCard
            headline={`${exactMatch.extension} → ${exactMatch.mime}`}
            subline={exactMatch.category}
            copyText={`${exactMatch.extension} ${exactMatch.mime}`}
          />
        )}

        <DataTable
          gridClass="grid-cols-[110px_220px_100px_1fr_auto]"
          columns={[
            { label: 'Ext' },
            { label: 'MIME' },
            { label: 'Type' },
            { label: 'Notes' },
            { label: 'Copy', align: 'right' },
          ]}
          rows={matches}
          rowKey={row => `${row.extension}-${row.mime}`}
          copyText={row => `${row.extension} ${row.mime}`}
          emptyMessage="No matching MIME types found."
          renderRow={row => (
            <>
              <div className="text-sm font-mono text-bright">{row.extension}</div>
              <div className="text-xs font-mono text-dim break-all pt-0.5">{row.mime}</div>
              <div className="text-xs font-mono text-subtle pt-0.5">{row.category}</div>
              <div className="text-sm font-sans text-dim leading-relaxed">{row.notes}</div>
            </>
          )}
        />
      </div>
    </ToolLayout>
  )
}
