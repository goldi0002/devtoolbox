import { useRef } from 'react'
import ClearFieldButton from './ClearFieldButton'

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
}

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className = 'textarea-base h-36',
  rows,
  footer,
  showClearButton = true,
}: TextAreaFieldProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const canClear = showClearButton && Boolean(value)

  const clear = () => {
    onChange('')
    fieldRef.current?.focus()
  }

  return (
    <div className="relative">
      <label className={`block text-xs text-dim font-mono mb-1.5${canClear ? ' pr-12' : ''}`}>{label}</label>
      <textarea
        ref={fieldRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
      />
      {canClear && <ClearFieldButton fieldLabel={label} onClear={clear} />}
      {footer}
    </div>
  )
}
