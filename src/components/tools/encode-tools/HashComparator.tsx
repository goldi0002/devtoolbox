import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'

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
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">Hash A</label>
            <textarea value={left} onChange={e => setLeft(e.target.value)} className="input-base min-h-[150px] w-full" spellCheck={false} />
          </div>
          <div>
            <label className="block text-xs text-dim font-mono mb-1.5">Hash B</label>
            <textarea value={right} onChange={e => setRight(e.target.value)} className="input-base min-h-[150px] w-full" spellCheck={false} />
          </div>
        </div>

        <div className={`border rounded p-4 ${result.matches ? 'border-green-300 bg-green-50' : 'border-border bg-surface'}`}>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Comparison</div>
          <p className="text-sm font-sans text-bright">{result.message}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Normalized A</div>
            <p className="text-sm font-mono text-dim break-all">{normalizeHash(left) || '—'}</p>
          </div>
          <div className="border border-border rounded p-4 bg-surface">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-subtle mb-2">Normalized B</div>
            <p className="text-sm font-mono text-dim break-all">{normalizeHash(right) || '—'}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
