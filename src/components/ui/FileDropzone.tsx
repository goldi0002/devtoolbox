import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Upload } from 'lucide-react'
import { checkFiles, type FileRules } from '../../utils/fileDropzone'

export interface FileDropzoneProps extends FileRules {
  /** Visible label and accessible name of the file input. */
  label: string
  /** Receives the files that passed the accept and size rules. Only called when at least one file passed. */
  onFiles: (files: File[]) => void
  /** Receives one message describing every rejected file. */
  onError?: (message: string) => void
  /** Optional extra text under the zone, such as size limits. */
  hint?: string
  disabled?: boolean
  /** Name of the file the tool is currently using, shown inside the zone. */
  selectedName?: string | null
}

/**
 * Shared file picker: click, Enter/Space, or drag and drop. The label is attached to a
 * visually hidden file input, so label-based lookups and setInputFiles keep working.
 */
export default function FileDropzone({
  label,
  accept,
  multiple = false,
  maxBytes,
  tooLargeMessage,
  onFiles,
  onError,
  hint,
  disabled = false,
  selectedName,
}: FileDropzoneProps) {
  const inputId = useId()
  const hintId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (list: FileList | null) => {
    if (disabled || !list || list.length === 0) return
    // Copy the files out before the input value is reset by the caller.
    const { accepted, errors } = checkFiles(Array.from(list), { accept, multiple, maxBytes, tooLargeMessage })
    if (errors.length > 0) onError?.(errors.join(' '))
    if (accepted.length > 0) onFiles(accepted)
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPicker()
    }
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    if (!dragging) setDragging(true)
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs text-dim font-mono">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        className="sr-only"
        onChange={event => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={hint ? hintId : undefined}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center text-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-border-hover bg-surface/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="p-2.5 rounded-full bg-surface border border-border text-accent" aria-hidden="true">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-bright break-all">
          {selectedName ?? (multiple ? 'Choose files or drop them here' : 'Choose a file or drop it here')}
        </p>
        <p className="text-xs text-subtle">
          Click or press Enter to browse. Files are read in your browser and never uploaded.
        </p>
      </div>
      {hint && (
        <p id={hintId} className="text-[11px] text-subtle font-mono">
          {hint}
        </p>
      )}
    </div>
  )
}
