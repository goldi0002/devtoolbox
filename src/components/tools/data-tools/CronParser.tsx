import { useState } from 'react'
import { parseCronExpression } from '../../../utils/cronParser'
import SectionPanel from '../../ui/SectionPanel'
import ErrorBanner from '../../ui/ErrorBanner'

const PRESETS = [
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Hourly at minute 0', cron: '0 * * * *' },
  { label: 'Daily at 9:00 AM', cron: '0 9 * * *' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'At midnight on 1st of month', cron: '0 0 1 * *' },
]

export default function CronParser() {
  const [cron, setCron] = useState('*/15 * * * *')
  const result = parseCronExpression(cron)

  return (
    <div className="space-y-6">
      <SectionPanel label="Cron Expression Parser">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-dim">Presets:</span>
            {PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setCron(p.cron)}
                className="chip text-[11px]"
              >
                {p.label} ({p.cron})
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-mono text-dim mb-1">Cron Expression (5 fields):</label>
            <input
              type="text"
              value={cron}
              onChange={e => setCron(e.target.value)}
              placeholder="* * * * *"
              className="w-full font-mono text-sm bg-surface border border-border rounded-lg px-4 py-2 text-bright outline-none focus:border-accent"
            />
          </div>

          {result.error ? (
            <ErrorBanner message={result.error} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface/50 p-4">
                <p className="eyebrow mb-1">Human Readable Schedule</p>
                <p className="text-sm font-sans text-bright font-medium">{result.description}</p>
              </div>

              {result.nextRuns.length > 0 && (
                <div className="rounded-lg border border-border bg-surface/30 p-4 space-y-2">
                  <p className="eyebrow">Next 5 Scheduled Runs (UTC)</p>
                  <ul className="space-y-1 font-mono text-xs text-subtle">
                    {result.nextRuns.map((run, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-accent">→</span>
                        <span>{run}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionPanel>
    </div>
  )
}
