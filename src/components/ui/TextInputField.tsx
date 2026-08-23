interface TextInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** HTML input type (text, number, email, tel, etc.) */
  type?: string
  /** CSS class applied to the wrapping <div> */
  containerClassName?: string
  /** Additional HTML input attributes (min, max, step, etc.) */
  [key: string]: any
}

export default function TextInputField({ label, value, onChange, placeholder, type = 'text', containerClassName, ...rest }: TextInputFieldProps) {
  return (
    <div className={containerClassName}>
      <label className="block text-xs text-dim font-mono mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-base w-full"
        placeholder={placeholder}
        type={type}
        spellCheck={false}
        {...rest}
      />
    </div>
  )
}
