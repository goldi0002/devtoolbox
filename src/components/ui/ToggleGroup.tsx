interface ToggleGroupProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}

export default function ToggleGroup<T extends string>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <>
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={value === option.value ? 'btn-primary' : 'btn-ghost'}
        >
          {option.label}
        </button>
      ))}
    </>
  )
}
