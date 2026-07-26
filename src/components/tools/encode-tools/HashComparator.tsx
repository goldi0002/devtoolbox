import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import FieldCard from '../../ui/FieldCard'
import TextAreaField from '../../ui/TextAreaField'

function normalizeHash(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

export default function HashComparator() {
  const [left, setLeft] = useState('d2d2d2d2')
  const [right, setRight] = useState('D2D2D2D2')

  const result = useMemo(() => {
    const normalizedLeft = normalizeHash(left)
    const normalizedRight = normalizeHash(right)

    if (!normalizedLeft || !normalizedRight) {
      return {
        matches: false,
        message: 'Enter both hash values to compare them.',
      }
    }

    return normalizedLeft === normalizedRight
      ? {
        matches: true,
        message: 'The hashes match after case and whitespace normalization.',
      }
      : {
        matches: false,
        message: 'The hashes are different.',
      }
  }, [left, right])

  return (
    <ToolLayout
      title="Hash Comparator"
      description="Compare two hash or checksum values after trimming whitespace and normalizing case"
      tag="encode"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextAreaField label="Hash A" value={left} onChange={setLeft} className="input-base min-h-[150px] w-full" />
          <TextAreaField label="Hash B" value={right} onChange={setRight} className="input-base min-h-[150px] w-full" />
        </div>

        <FieldCard
          label="Comparison"
          value={result.message}
          font="sans"
          className={`border rounded p-4 ${result.matches ? 'border-green-300 bg-green-50' : 'border-border bg-surface'}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCard label="Normalized A" value={normalizeHash(left) || '—'} emphasis="dim" />
          <FieldCard label="Normalized B" value={normalizeHash(right) || '—'} emphasis="dim" />
        </div>
      </div>
    </ToolLayout>
  )
}
