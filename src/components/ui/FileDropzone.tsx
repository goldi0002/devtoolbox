import { useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
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
  /**
   * `default` is the large dashed drop zone with the label above it.
   * `compact` is a single button-sized zone for toolbars; its text is the label.
   */
  variant?: 'default' | 'compact'
  /** Replaces the default helper line inside the default zone. */
  description?: string
  /** Rendered below the zone, outside the clickable element, so interactive children stay valid. */
  children?: ReactNode
  /** Extra classes for the clickable zone, used to match a surrounding toolbar or panel. */
  className?: string
  /** Shows the upload icon. Defaults to true. */
  showIcon?: boolean
}

/**
 * Shared file picker: click, Enter/Space, or drag and drop. The input is visually hidden but
 * stays labelled (a visible <label> in the default variant, aria-label in the compact one),
 * so label-based lookups and setInputFiles keep working.
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
  variant = 'default',
  description,
  children,
  className,
  showIcon = true,
}: FileDropzoneProps) {
  const inputId = useId()
  const hintId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const compact = variant === 'compact'

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

  const input = (
    <input
      ref={inputRef}
      id={compact ? undefined : inputId}
      aria-label={compact ? label : undefined}
      // The compact zone is the accessible control; the input stays labelled for lookups but is hidden from the tree.
      aria-hidden={compact ? true : undefined}
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
  )

  const hintLine = hint && (
    <p id={hintId} className="text-[11px] text-subtle font-mono">
      {hint}
    </p>
  )

  const handlers = {
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled || undefined,
    'aria-describedby': hint ? hintId : undefined,
    onClick: openPicker,
    onKeyDown,
    onDragOver,
    onDragLeave,
    onDrop,
  }

  const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'

  if (compact) {
    return (
      <div>
        {input}
        <div
          {...handlers}
          className={`inline-flex items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            dragging ? 'ring-2 ring-accent' : ''
          } ${disabledClass}${className ? ` ${className}` : ''}`}
        >
          {showIcon && <Upload className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>{selectedName ?? label}</span>
        </div>
        {hintLine}
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs text-dim font-mono">
        {label}
      </label>
      {input}
      <div
        {...handlers}
        className={`flex flex-col items-center justify-center text-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-border-hover bg-surface/50'
        } ${disabledClass}${className ? ` ${className}` : ''}`}
      >
        <div className="p-2.5 rounded-full bg-surface border border-border text-accent" aria-hidden="true">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-bright break-all">
          {selectedName ?? (multiple ? 'Choose files or drop them here' : 'Choose a file or drop it here')}
        </p>
        <p className="text-xs text-subtle">
          {description ?? 'Click or press Enter to browse. Files are read in your browser and never uploaded.'}
        </p>
      </div>
      {hintLine}
      {children}
    </div>
  )
}
