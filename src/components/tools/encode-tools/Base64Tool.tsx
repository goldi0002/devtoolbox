import { useState, useRef } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import TextAreaField from '../../ui/TextAreaField'
import ToggleGroup from '../../ui/ToggleGroup'
import { decodeBase64, encodeBase64 } from '../../../utils/encoding'
import { ArrowLeftRight, Upload, FileCheck, RefreshCw } from 'lucide-react'

type Mode = 'encode' | 'decode'

const MODES = [
  { value: 'encode' as const, label: 'Encode' },
  { value: 'decode' as const, label: 'Decode' },
]

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('encode')
  const [urlSafe, setUrlSafe] = useState(false)
  const [dataUriMode, setDataUriMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processConversion = (text: string, currentMode: Mode, isUrlSafe: boolean, isDataUri: boolean): string => {
    if (!text) return ''
    if (currentMode === 'encode') {
      let encoded = encodeBase64(text)
      if (isUrlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      if (isDataUri && !encoded.startsWith('data:')) {
        encoded = `data:text/plain;base64,${encoded}`
      }
      return encoded
    } else {
      let cleanInput = text.trim()
      if (cleanInput.startsWith('data:')) {
        const parts = cleanInput.split(',')
        if (parts.length > 1) cleanInput = parts[1]
      }
      if (isUrlSafe) {
        cleanInput = cleanInput.replace(/-/g, '+').replace(/_/g, '/')
        while (cleanInput.length % 4) {
          cleanInput += '='
        }
      }
      return decodeBase64(cleanInput)
    }
  }

  const handleInput = (val: string, m = mode, isUrl = urlSafe, isUri = dataUriMode) => {
    setInput(val)
    setError('')
    if (!val) {
      setOutput('')
      return
    }

    try {
      setOutput(processConversion(val, m, isUrl, isUri))
    } catch {
      setError(m === 'encode' ? 'Encoding failed' : 'Invalid Base64 payload')
      setOutput('')
    }
  }

  const handleModeChange = (m: Mode) => {
    setMode(m)
    handleInput(input, m, urlSafe, dataUriMode)
  }

  const handleUrlSafeToggle = (checked: boolean) => {
    setUrlSafe(checked)
    handleInput(input, mode, checked, dataUriMode)
  }

  const handleDataUriToggle = (checked: boolean) => {
    setDataUriMode(checked)
    handleInput(input, mode, urlSafe, checked)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        if (mode === 'encode') {
          setInput(`[Binary File: ${file.name}]`)
          setOutput(result) // ReadAsDataURL gives data URI
        } else {
          setInput(result)
          handleInput(result, 'decode', urlSafe, dataUriMode)
        }
      }
    }
    if (mode === 'encode') {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const swap = () => {
    if (!output) return
    const newMode: Mode = mode === 'encode' ? 'decode' : 'encode'
    setInput(output)
    setMode(newMode)
    handleInput(output, newMode, urlSafe, dataUriMode)
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <ToolLayout
      title="Base64 Encoder / Decoder"
      description="Safely encode text or binary files to Base64, or decode Base64 back to original text with 100% browser privacy."
      tag="encode"
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup options={MODES} value={mode} onChange={handleModeChange} />

            <label className="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright cursor-pointer px-2 py-1 rounded bg-muted/40">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => handleUrlSafeToggle(e.target.checked)}
                className="rounded border-border accent-indigo-500"
              />
              URL-Safe Base64
            </label>

            {mode === 'encode' && (
              <label className="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright cursor-pointer px-2 py-1 rounded bg-muted/40">
                <input
                  type="checkbox"
                  checked={dataUriMode}
                  onChange={(e) => handleDataUriToggle(e.target.checked)}
                  className="rounded border-border accent-indigo-500"
                />
                Data URI Format
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost text-xs flex items-center gap-1"
              title="Upload file to convert to Base64"
            >
              <Upload size={13} />
              Upload File
            </button>

            {output && (
              <button
                type="button"
                onClick={swap}
                className="btn-ghost text-xs flex items-center gap-1"
                title="Swap input and output"
              >
                <ArrowLeftRight size={13} />
                Swap
              </button>
            )}

            <button type="button" onClick={clear} className="btn-ghost text-xs">
              Clear
            </button>
          </div>
        </div>

        {/* Input & Output Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField
            label={mode === 'encode' ? 'Plain Text or File Content' : 'Base64 Encoded Input'}
            value={input}
            onChange={(val) => handleInput(val, mode, urlSafe, dataUriMode)}
            placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 payload (e.g. SGVsbG8sIFdvcmxkIQ==)...'}
            className="textarea-base h-40"
          />

          <OutputPanel
            label={mode === 'encode' ? 'Base64 Result' : 'Decoded Text Result'}
            value={output}
            error={error}
            heightClass="min-h-[200px]"
          />
        </div>
      </div>
    </ToolLayout>
  )
}

