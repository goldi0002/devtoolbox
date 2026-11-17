import { useId, useRef, useState } from 'react'
import ClearFieldButton from './ClearFieldButton'
import ErrorBanner from './ErrorBanner'
import { readTextFile } from '../../utils/textFile'

interface TextAreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Class list for the textarea itself, mainly used to set its height. */
  className?: string
  /** HTML rows attribute for visible textarea height */
  rows?: number
  footer?: React.ReactNode
  /** Show a "Clear" button while the field has text. Defaults to true. */
  showClearButton?: boolean
  /** Let a text file be dropped onto the field to replace its value. Defaults to true. */
  allowFileDrop?: boolean
}

const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className = 'textarea-base h-36',
  rows,
  footer,
  showClearButton = true,
  allowFileDrop = true,
}: TextAreaFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dropError, setDropError] = useState('')
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const fieldId = useId()
  const canClear = showClearButton && Boolean(value)

  const clear = () => {
    setDropError('')
    onChange('')
    fieldRef.current?.focus()
  }

  // Only file drags are intercepted; dragging selected text keeps the native behaviour.
  const onDragOver = (e: React.DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }

  const onDrop = async (e: React.DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const result = await readTextFile(file)
    if (result.ok) {
      setDropError('')
      onChange(result.text)
    } else {
      setDropError(result.error)
    }
  }

  const dropProps = allowFileDrop
    ? { onDragOver, onDragEnter: onDragOver, onDragLeave: () => setIsDragging(false), onDrop }
    : {}

  return (
    <div className="relative">
      <label htmlFor={fieldId} className={`block text-xs text-dim font-mono mb-1.5${canClear ? ' pr-12' : ''}`}>{label}</label>
      <textarea
        id={fieldId}
        ref={fieldRef}
        value={value}
        onChange={e => {
          if (dropError) setDropError('')
          onChange(e.target.value)
        }}
        className={isDragging ? `${className} border-accent ring-2 ring-accent-soft` : className}
        data-dragging={isDragging || undefined}
        {...dropProps}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
      />
      {canClear && <ClearFieldButton fieldLabel={label} onClear={clear} />}
      {dropError && (
        <div role="alert" className="mt-1.5">
          <ErrorBanner message={dropError} />
        </div>
      )}
      {footer}
    </div>
  )
}
