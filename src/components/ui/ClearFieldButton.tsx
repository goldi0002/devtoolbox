interface ClearFieldButtonProps {
  /** Label of the field this button clears; used for the accessible name. */
  fieldLabel: string
  onClear: () => void
}

/**
 * Small "Clear" button that sits in the label row of a text field. It is
 * absolutely positioned inside a `relative` field wrapper, so showing or hiding
 * it never moves the field, and it is rendered after the field so it follows it
 * in the tab order.
 */
export default function ClearFieldButton({ fieldLabel, onClear }: ClearFieldButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={`Clear ${fieldLabel}`}
      className="absolute top-0 right-0 rounded px-1 text-xs leading-4 font-mono text-dim hover:text-bright hover:bg-muted transition-colors"
    >
      Clear
    </button>
  )
}
