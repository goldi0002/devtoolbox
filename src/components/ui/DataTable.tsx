import CopyButton from '../CopyButton'

export interface DataTableColumn {
  label: string
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  /** Tailwind grid template class shared by the header and the rows. */
  gridClass: string
  columns: DataTableColumn[]
  rows: T[]
  rowKey: (row: T) => string
  renderRow: (row: T) => React.ReactNode
  copyText?: (row: T) => string
  emptyMessage?: string
  align?: 'start' | 'center'
  bodyClass?: string
}

export default function DataTable<T>({
  gridClass,
  columns,
  rows,
  rowKey,
  renderRow,
  copyText,
  emptyMessage = 'No results found.',
  align = 'start',
  bodyClass = 'divide-y divide-border',
}: DataTableProps<T>) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <div className={`grid ${gridClass} gap-3 px-4 py-2 bg-surface border-b border-border text-[10px] font-mono uppercase tracking-[0.16em] text-subtle`}>
        {columns.map(column => (
          <span key={column.label} className={column.align === 'right' ? 'text-right' : undefined}>
            {column.label}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-8 text-xs font-mono text-subtle">{emptyMessage}</div>
      ) : (
        <div className={bodyClass}>
          {rows.map(row => (
            <div
              key={rowKey(row)}
              className={`grid ${gridClass} gap-3 px-4 py-3 ${align === 'center' ? 'items-center' : 'items-start'} bg-[#f8f8f8]`}
            >
              {renderRow(row)}
              {copyText && (
                <div className="justify-self-end">
                  <CopyButton text={copyText(row)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
