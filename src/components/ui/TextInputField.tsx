import { useRef } from 'react'
import ClearFieldButton from './ClearFieldButton'

interface TextInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** HTML input type (text, number, email, tel, etc.) */
  type?: string
  /** CSS class applied to the wrapping <div> */
  containerClassName?: string
  /** Show a "Clear" button while the field has text. Defaults to true. */
  showClearButton?: boolean
  /** Additional HTML input attributes (min, max, step, etc.) */
  [key: string]: any
}

export default function TextInputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  containerClassName,
  showClearButton = true,
  ...rest
}: TextInputFieldProps) {
  const fieldRef = useRef<HTMLInputElement>(null)
  const canClear = showClearButton && Boolean(value) && !rest.disabled && !rest.readOnly

  const clear = () => {
    onChange('')
    fieldRef.current?.focus()
  }

  return (
    <div className={containerClassName ? `relative ${containerClassName}` : 'relative'}>
      <label className={`block text-xs text-dim font-mono mb-1.5${canClear ? ' pr-12' : ''}`}>{label}</label>
      <input
        ref={fieldRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-base w-full"
        placeholder={placeholder}
        type={type}
        spellCheck={false}
        {...rest}
      />
      {canClear && <ClearFieldButton fieldLabel={label} onClear={clear} />}
    </div>
  )
}
