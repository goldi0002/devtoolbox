interface TextInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TextInputField({ label, value, onChange, placeholder }: TextInputFieldProps) {
  return (
    <div>
      <label className="block text-xs text-dim font-mono mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-base w-full"
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  )
}
