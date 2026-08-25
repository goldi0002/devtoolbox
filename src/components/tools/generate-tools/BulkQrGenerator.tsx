import React, { useState, useMemo, useCallback } from 'react'
import SectionPanel from '../../ui/SectionPanel'
import TextAreaField from '../../ui/TextAreaField'
import {
  generateCustomSvg,
  generateEps,
  generateRasterDataUrl,
  ErrorCorrectionLevel,
  ModuleShape,
  EyeShape,
  QrVectorOptions
} from '../../../utils/qrVectorEngine'
import { downloadZip } from '../../../utils/zipCreator'
import {
  Download,
  Grid3x3,
  FileText,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Package,
  Eye,
  Settings,
  Copy
} from 'lucide-react'

type InputMode = 'lines' | 'csv'
type ExportFormat = 'svg' | 'png' | 'jpeg'

interface QrItem {
  id: string
  payload: string
  label: string
}

export default function BulkQrGenerator() {
  // Input mode and raw text
  const [inputMode, setInputMode] = useState<InputMode>('lines')
  const [rawInput, setRawInput] = useState<string>(
    'https://toolbox4devs.com\nhttps://github.com/example/repo\nhttps://docs.example.com/api'
  )

  // Styling options (shared across all QR codes)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [transparentBg, setTransparentBg] = useState(false)
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [moduleShape, setModuleShape] = useState<ModuleShape>('square')
  const [eyeShape, setEyeShape] = useState<EyeShape>('square')
  const [margin, setMargin] = useState<number>(4)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('svg')

  // Generated items
  const [items, setItems] = useState<QrItem[]>([])
  const [generatedSvgs, setGeneratedSvgs] = useState<Map<string, string>>(new Map())
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
  const [copyStates, setCopyStates] = useState<Map<string, boolean>>(new Map())

  // Parse input into QR items
  const parseInput = useCallback((input: string, mode: InputMode): QrItem[] => {
    if (!input.trim()) return []

    let lines: string[] = []

    if (mode === 'csv') {
      // Parse CSV - support comma or newline separated
      lines = input
        .split(/[\n,]+/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
    } else {
      // One per line mode
      lines = input
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
    }

    return lines.map((line, index) => ({
      id: `qr-${index}-${Date.now()}`,
      payload: line,
      label: line.length > 40 ? `${line.substring(0, 37)}...` : line
    }))
  }, [])

  // Generate all QR codes
  const handleGenerate = useCallback(async () => {
    const parsedItems = parseInput(rawInput, inputMode)
    if (parsedItems.length === 0) return

    setItems(parsedItems)
    setIsGenerating(true)
    setGenerationProgress({ current: 0, total: parsedItems.length })

    const svgs = new Map<string, string>()
    const options: QrVectorOptions = {
      text: '',
      errorCorrectionLevel: errorLevel,
      margin: margin,
      fgColor: fgColor,
      bgColor: bgColor,
      transparentBg: transparentBg,
      moduleShape: moduleShape,
      eyeShape: eyeShape
    }

    // Generate in batches to avoid blocking UI
    for (let i = 0; i < parsedItems.length; i++) {
      try {
        const svg = generateCustomSvg({ ...options, text: parsedItems[i].payload })
        svgs.set(parsedItems[i].id, svg)
      } catch (err) {
        console.error(`Failed to generate QR for item ${i}:`, err)
        svgs.set(parsedItems[i].id, '')
      }
      setGenerationProgress({ current: i + 1, total: parsedItems.length })

      // Yield to browser every 10 items
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    setGeneratedSvgs(svgs)
    setIsGenerating(false)
  }, [rawInput, inputMode, parseInput, errorLevel, margin, fgColor, bgColor, transparentBg, moduleShape, eyeShape])

  // Download single QR code
  const handleDownloadSingle = useCallback(async (item: QrItem) => {
    const options: QrVectorOptions = {
      text: item.payload,
      errorCorrectionLevel: errorLevel,
      margin: margin,
      fgColor: fgColor,
      bgColor: bgColor,
      transparentBg: transparentBg,
      moduleShape: moduleShape,
      eyeShape: eyeShape
    }

    const baseFileName = `qr-${item.label.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}`

    if (exportFormat === 'svg') {
      const svg = generateCustomSvg(options)
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      try {
        const mime = exportFormat === 'jpeg' ? 'jpeg' : 'png'
        const dataUrl = await generateRasterDataUrl(options, mime, 2)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${baseFileName}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } catch (err) {
        console.error('Download failed:', err)
      }
    }
  }, [errorLevel, margin, fgColor, bgColor, transparentBg, moduleShape, eyeShape, exportFormat])

  // Download all QR codes as ZIP
  const handleDownloadAll = useCallback(async () => {
    if (items.length === 0) return

    setIsGenerating(true)

    const zipEntries: { name: string; data: Uint8Array }[] = []
    const options: QrVectorOptions = {
      text: '',
      errorCorrectionLevel: errorLevel,
      margin: margin,
      fgColor: fgColor,
      bgColor: bgColor,
      transparentBg: transparentBg,
      moduleShape: moduleShape,
      eyeShape: eyeShape
    }

    for (const item of items) {
      const svg = generateCustomSvg({ ...options, text: item.payload })
      const safeName = item.label.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)

      if (exportFormat === 'svg') {
        zipEntries.push({
          name: `${safeName}.svg`,
          data: new TextEncoder().encode(svg)
        })
      } else {
        try {
          const mime = exportFormat === 'jpeg' ? 'jpeg' : 'png'
          const dataUrl = await generateRasterDataUrl({ ...options, text: item.payload }, mime, 2)
          // Convert data URL to Uint8Array
          const base64 = dataUrl.split(',')[1]
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          zipEntries.push({
            name: `${safeName}.${exportFormat}`,
            data: bytes
          })
        } catch (err) {
          console.error(`Failed to generate ${exportFormat} for item:`, item.label, err)
        }
      }
    }

    if (zipEntries.length > 0) {
      downloadZip(zipEntries, `qr-codes-batch-${Date.now()}.zip`)
    }

    setIsGenerating(false)
  }, [items, errorLevel, margin, fgColor, bgColor, transparentBg, moduleShape, eyeShape, exportFormat])

  // Copy single SVG to clipboard
  const handleCopySvg = useCallback((item: QrItem) => {
    const svg = generatedSvgs.get(item.id)
    if (!svg) return
    navigator.clipboard.writeText(svg)
    setCopyStates(prev => new Map(prev).set(item.id, true))
    setTimeout(() => {
      setCopyStates(prev => new Map(prev).set(item.id, false))
    }, 2000)
  }, [generatedSvgs])

  // Clear all
  const handleClear = useCallback(() => {
    setRawInput('')
    setItems([])
    setGeneratedSvgs(new Map())
  }, [])

  // Load sample data
  const handleLoadSample = useCallback(() => {
    setRawInput('https://toolbox4devs.com\nhttps://github.com/example/repo\nhttps://docs.example.com/api\nmailto:contact@example.com\nhttps://twitter.com/example')
    setInputMode('lines')
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Privacy & Safety Banner ─────────────────────────── */}
      <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-purple-300 font-medium">
          <Grid3x3 className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <span className="font-semibold text-purple-200">Bulk QR Generator:</span>
            <span className="text-purple-300/90 ml-1.5 hidden sm:inline">
              Generate hundreds of QR codes at once. Pure client-side, zero tracking.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-purple-400/80 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
          <span>Batch Export (ZIP)</span>
          <span>•</span>
          <span>Up to 500 QR codes</span>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input & Styling (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Bulk Input */}
          <SectionPanel title="1. Bulk Input Data">
            <div className="space-y-4">
              {/* Input Mode Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-subtle">Input Mode:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('lines')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      inputMode === 'lines'
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-subtle hover:text-bright hover:bg-hover'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>One per Line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('csv')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      inputMode === 'csv'
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-subtle hover:text-bright hover:bg-hover'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>CSV / Comma-separated</span>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <TextAreaField
                  label={inputMode === 'lines' ? 'Enter URLs or Text (one per line)' : 'Enter URLs or Text (comma-separated)'}
                  value={rawInput}
                  onChange={setRawInput}
                  placeholder={
                    inputMode === 'lines'
                      ? 'https://example.com\nhttps://another.com\nHello World'
                      : 'https://example.com, https://another.com, Hello World'
                  }
                  rows={6}
                />
                <div className="flex justify-between items-center text-[11px] text-muted mt-1.5">
                  <span>
                    {parseInput(rawInput, inputMode).length} QR codes to generate
                  </span>
                  <span>Max 500 items recommended</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Load Sample</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!rawInput.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating {generationProgress.current}/{generationProgress.total}...</span>
                  </>
                ) : (
                  <>
                    <Grid3x3 className="w-4 h-4" />
                    <span>Generate {parseInput(rawInput, inputMode).length} QR Codes</span>
                  </>
                )}
              </button>
            </div>
          </SectionPanel>

          {/* Section 2: Shared Styling */}
          <SectionPanel title="2. Shared Styling Options">
            <div className="space-y-4">
              {/* Module Shape & Corner Eyes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Module Shape</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'dots', label: 'Dots' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'squircle', label: 'Squircle' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setModuleShape(s.id as ModuleShape)}
                        className={`px-2 py-1.5 text-xs font-medium rounded border transition-all text-center ${
                          moduleShape === s.id
                            ? 'bg-accent/20 border-accent text-accent font-semibold'
                            : 'bg-surface border-border text-subtle hover:text-bright hover:bg-hover'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Corner Eye Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'square', label: 'Square' },
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'circle', label: 'Circle' },
                    ].map(e => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setEyeShape(e.id as EyeShape)}
                        className={`px-2 py-1.5 text-xs font-medium rounded border transition-all text-center ${
                          eyeShape === e.id
                            ? 'bg-accent/20 border-accent text-accent font-semibold'
                            : 'bg-surface border-border text-subtle hover:text-bright hover:bg-hover'
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Pattern (Foreground)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={e => setFgColor(e.target.value)}
                      className="h-8 w-10 p-0.5 border border-border rounded cursor-pointer bg-surface"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={e => setFgColor(e.target.value)}
                      className="input-base font-mono text-xs flex-1 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-subtle">Background</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted hover:text-bright select-none">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={e => setTransparentBg(e.target.checked)}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="font-semibold text-accent">Transparent BG</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      disabled={transparentBg}
                      onChange={e => setBgColor(e.target.value)}
                      className={`h-8 w-10 p-0.5 border border-border rounded cursor-pointer bg-surface ${
                        transparentBg ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                    <input
                      type="text"
                      value={transparentBg ? 'TRANSPARENT' : bgColor}
                      disabled={transparentBg}
                      onChange={e => setBgColor(e.target.value)}
                      className={`input-base font-mono text-xs flex-1 uppercase ${
                        transparentBg ? 'opacity-40 cursor-not-allowed text-accent font-semibold' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">Error Correction</label>
                  <select
                    value={errorLevel}
                    onChange={e => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                    className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="L">Level L (~7% redundancy - Highest density)</option>
                    <option value="M">Level M (~15% redundancy - Standard)</option>
                    <option value="Q">Level Q (~25% redundancy - High reliability)</option>
                    <option value="H">Level H (~30% redundancy - Max resilience)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-subtle mb-1.5">
                    Quiet Zone Margin ({margin} modules)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={margin}
                    onChange={e => setMargin(parseInt(e.target.value, 10))}
                    className="w-full accent-accent mt-2 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </SectionPanel>
        </div>

        {/* Right Column: Preview & Export (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Export Options */}
          <SectionPanel title="Export & Download">
            <div className="space-y-4">
              {/* Export Format */}
              <div>
                <label className="block text-xs font-medium text-subtle mb-1.5">Export Format</label>
                <select
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full bg-surface border border-border text-bright rounded px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="svg">SVG (Infinite Vector)</option>
                  <option value="png">PNG (Lossless Raster)</option>
                  <option value="jpeg">JPEG (Standard Image)</option>
                </select>
              </div>

              {/* Download All Button */}
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={items.length === 0 || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Download All as ZIP ({items.length} files)</span>
              </button>

              {/* Stats */}
              {items.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-dark border border-border rounded-lg text-center">
                    <div className="text-lg font-bold text-bright">{items.length}</div>
                    <div className="text-[11px] text-muted">QR Codes</div>
                  </div>
                  <div className="p-3 bg-surface-dark border border-border rounded-lg text-center">
                    <div className="text-lg font-bold text-bright capitalize">{exportFormat}</div>
                    <div className="text-[11px] text-muted">Format</div>
                  </div>
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Preview Grid */}
          <SectionPanel title={`Preview (${generatedSvgs.size}/${items.length})`}>
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  <Grid3x3 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>Enter data and click Generate to preview QR codes</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-3">
                  {items.map((item, index) => {
                    const svg = generatedSvgs.get(item.id)
                    const isCopied = copyStates.get(item.id) || false

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-surface-dark border border-border rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          {/* QR Preview */}
                          <div className="shrink-0">
                            {svg ? (
                              <div
                                className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center border border-border"
                                style={{ backgroundColor: transparentBg ? 'transparent' : bgColor }}
                                dangerouslySetInnerHTML={{ __html: svg }}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Label & Actions */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-subtle truncate" title={item.payload}>
                              {item.label}
                            </p>
                            <p className="text-[10px] text-muted mt-0.5">
                              {item.payload.length} chars
                            </p>
                            <div className="flex gap-1.5 mt-2">
                              <button
                                type="button"
                                onClick={() => handleCopySvg(item)}
                                disabled={!svg}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-subtle hover:text-bright hover:bg-hover border border-border rounded transition-colors disabled:opacity-40"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingle(item)}
                                disabled={!svg}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-subtle hover:text-bright hover:bg-hover border border-border rounded transition-colors disabled:opacity-40"
                              >
                                <Download className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>

                          {/* Index Badge */}
                          <span className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </SectionPanel>

          {/* Tips Card */}
          <div className="p-4 bg-surface border border-border rounded-xl text-xs space-y-2.5 font-sans">
            <h4 className="font-semibold text-bright flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-accent" />
              <span>Bulk Generation Tips</span>
            </h4>
            <ul className="text-muted space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li>
                <strong>One per Line mode</strong> is best for lists of URLs or text entries.
              </li>
              <li>
                <strong>CSV mode</strong> allows comma-separated values for quick paste from spreadsheets.
              </li>
              <li>
                All QR codes share the same styling options for consistent branding.
              </li>
              <li>
                <strong>ZIP download</strong> bundles all generated QR codes in your chosen format.
              </li>
              <li>
                Individual <strong>Copy SVG</strong> and <strong>Save</strong> buttons are available for each QR code.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
