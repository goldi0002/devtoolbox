import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import ErrorBanner from '../../ui/ErrorBanner'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import {
  diffJson,
  formatChangeLine,
  parseJsonInput,
  previewValue,
  summarizeChanges,
  type ChangeKind,
} from '../../../utils/jsonDiff'

const SAMPLE_LEFT = `{
  "name": "Ada",
  "age": 36,
  "tags": ["admin"],
  "address": { "city": "London", "zip": "N1" },
  "active": true
}`

const SAMPLE_RIGHT = `{
  "name": "Ada",
  "age": 37,
  "tags": ["admin", "ops"],
  "address": { "zip": "N1", "city": "Cambridge" },
  "active": "yes",
  "id": 7
}`

const KIND_LABEL: Record<ChangeKind, string> = {
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
  'type-changed': 'Type changed',
}

const KIND_CLASS: Record<ChangeKind, string> = {
  added: 'text-green-500',
  removed: 'text-red-500',
  changed: 'text-amber-500',
  'type-changed': 'text-amber-500',
}

export default function JsonDiff() {
  const [left, setLeft] = useState(SAMPLE_LEFT)
  const [right, setRight] = useState(SAMPLE_RIGHT)
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useState(false)

  const parsedLeft = useMemo(() => parseJsonInput(left), [left])
  const parsedRight = useMemo(() => parseJsonInput(right), [right])

  const changes = useMemo(() => {
    if (!parsedLeft.ok || !parsedRight.ok) return null
    return diffJson(parsedLeft.value, parsedRight.value, { ignoreArrayOrder })
  }, [parsedLeft, parsedRight, ignoreArrayOrder])

  const counts = changes ? summarizeChanges(changes) : null
  const report = changes ? changes.map(formatChangeLine).join('\n') : ''

  return (
    <ToolLayout
      title="JSON Diff"
      description="Compare two JSON documents by structure and see every change by path"
      tag="json"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <TextAreaField
              label="Original (left)"
              value={left}
              onChange={setLeft}
              className="textarea-base h-64 font-mono"
              placeholder='{"name": "Ada"}'
            />
            {!parsedLeft.ok && <ErrorBanner message={`Original: ${parsedLeft.error}`} />}
          </div>
          <div className="space-y-2">
            <TextAreaField
              label="Changed (right)"
              value={right}
              onChange={setRight}
              className="textarea-base h-64 font-mono"
              placeholder='{"name": "Grace"}'
            />
            {!parsedRight.ok && <ErrorBanner message={`Changed: ${parsedRight.error}`} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-dim">
            <input
              type="checkbox"
              checked={ignoreArrayOrder}
              onChange={e => setIgnoreArrayOrder(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Ignore array order
          </label>
          {report && <CopyButton text={report} label="Copy changes" />}
        </div>

        {counts && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <StatCard label="Added" value={counts.added} />
            <StatCard label="Removed" value={counts.removed} />
            <StatCard label="Changed" value={counts.changed} />
            <StatCard label="Type changed" value={counts['type-changed']} />
          </div>
        )}

        {changes && (
          <section aria-labelledby="json-diff-changes-heading" className="space-y-2">
            <h2 id="json-diff-changes-heading" className="text-sm font-semibold">
              Changes
            </h2>
            {changes.length === 0 ? (
              <p role="status" className="text-sm text-dim">
                No differences: both documents hold the same data.
              </p>
            ) : (
              <ul data-testid="json-diff-changes" className="divide-y divide-border border border-border rounded text-xs font-mono">
                {changes.map(change => (
                  <li key={`${change.kind}:${change.path}`} className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className={`font-semibold ${KIND_CLASS[change.kind]}`}>{KIND_LABEL[change.kind]}</span>
                    <code className="break-all">{change.path}</code>
                    <span className="text-dim break-all">
                      {change.kind === 'added'
                        ? previewValue(change.after)
                        : change.kind === 'removed'
                          ? previewValue(change.before)
                          : `${previewValue(change.before)} → ${previewValue(change.after)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </ToolLayout>
  )
}
