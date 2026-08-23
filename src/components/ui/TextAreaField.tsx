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
}

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className = 'textarea-base h-36',
  rows,
  footer,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-xs text-dim font-mono mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
      />
      {footer}
    </div>
  )
}
