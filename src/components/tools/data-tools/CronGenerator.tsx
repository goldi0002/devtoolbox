import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import CopyButton from '../../CopyButton'
import SectionPanel from '../../ui/SectionPanel'
import {
  buildCronExpression,
  describeCronExpression,
  COMMON_PRESETS,
  DAY_OF_WEEK_OPTIONS,
  type CronOptions,
} from '../../../utils/cronGenerator'

const DEFAULT_OPTIONS: CronOptions = {
  minute: '0',
  hour: '9',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
}

export default function CronGenerator() {
  const [options, setOptions] = useState<CronOptions>(DEFAULT_OPTIONS)
  const [customExpression, setCustomExpression] = useState('')

  const cronExpression = useMemo(() => buildCronExpression(options), [options])
  const description = useMemo(() => describeCronExpression(cronExpression), [cronExpression])

  const updateOption = (key: keyof CronOptions, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }))
    setCustomExpression('')
  }

  const applyPreset = (preset: string) => {
    const parts = preset.split(' ')
    if (parts.length === 5) {
      setOptions({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      })
      setCustomExpression('')
    }
  }

  const handleCustomChange = (value: string) => {
    setCustomExpression(value)
  }

  const activeExpression = customExpression || cronExpression
  const activeDescription = customExpression ? describeCronExpression(customExpression) : description

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build and describe cron scheduling expressions with interactive controls and presets"
      tag="data"
    >
      <div className="space-y-5">
        {/* Presets */}
        <SectionPanel label="Quick Presets">
          <div className="flex flex-wrap gap-2">
            {COMMON_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.cron)}
                className="chip text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </SectionPanel>

        {/* Field-by-field controls */}
        <SectionPanel label="Build Expression">
          <div className="space-y-4">
            {/* Minute */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Minute (0-59)</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateOption('minute', '*')}
                  className={`chip text-[11px] ${options.minute === '*' ? 'chip-active' : ''}`}
                >
                  Every (*)
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('minute', '*/5')}
                  className={`chip text-[11px] ${options.minute === '*/5' ? 'chip-active' : ''}`}
                >
                  Every 5
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('minute', '*/15')}
                  className={`chip text-[11px] ${options.minute === '*/15' ? 'chip-active' : ''}`}
                >
                  Every 15
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('minute', '*/30')}
                  className={`chip text-[11px] ${options.minute === '*/30' ? 'chip-active' : ''}`}
                >
                  Every 30
                </button>
                <input
                  type="text"
                  value={options.minute}
                  onChange={e => updateOption('minute', e.target.value)}
                  placeholder="0"
                  className="input-base w-20 text-xs text-center"
                />
              </div>
            </div>

            {/* Hour */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Hour (0-23)</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateOption('hour', '*')}
                  className={`chip text-[11px] ${options.hour === '*' ? 'chip-active' : ''}`}
                >
                  Every (*)
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('hour', '*/2')}
                  className={`chip text-[11px] ${options.hour === '*/2' ? 'chip-active' : ''}`}
                >
                  Every 2
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('hour', '*/6')}
                  className={`chip text-[11px] ${options.hour === '*/6' ? 'chip-active' : ''}`}
                >
                  Every 6
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('hour', '*/12')}
                  className={`chip text-[11px] ${options.hour === '*/12' ? 'chip-active' : ''}`}
                >
                  Every 12
                </button>
                <input
                  type="text"
                  value={options.hour}
                  onChange={e => updateOption('hour', e.target.value)}
                  placeholder="0"
                  className="input-base w-20 text-xs text-center"
                />
              </div>
            </div>

            {/* Day of Month */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Day of Month (1-31)</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateOption('dayOfMonth', '*')}
                  className={`chip text-[11px] ${options.dayOfMonth === '*' ? 'chip-active' : ''}`}
                >
                  Every (*)
                </button>
                {[1, 15].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateOption('dayOfMonth', String(d))}
                    className={`chip text-[11px] ${options.dayOfMonth === String(d) ? 'chip-active' : ''}`}
                  >
                    Day {d}
                  </button>
                ))}
                <input
                  type="text"
                  value={options.dayOfMonth}
                  onChange={e => updateOption('dayOfMonth', e.target.value)}
                  placeholder="*"
                  className="input-base w-20 text-xs text-center"
                />
              </div>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Month (1-12)</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateOption('month', '*')}
                  className={`chip text-[11px] ${options.month === '*' ? 'chip-active' : ''}`}
                >
                  Every (*)
                </button>
                {[1, 6, 12].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateOption('month', String(m))}
                    className={`chip text-[11px] ${options.month === String(m) ? 'chip-active' : ''}`}
                  >
                    {new Date(2000, m - 1).toLocaleString('en', { month: 'short' })}
                  </button>
                ))}
                <input
                  type="text"
                  value={options.month}
                  onChange={e => updateOption('month', e.target.value)}
                  placeholder="*"
                  className="input-base w-20 text-xs text-center"
                />
              </div>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-xs font-mono text-dim mb-1.5">Day of Week (0-6)</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => updateOption('dayOfWeek', '*')}
                  className={`chip text-[11px] ${options.dayOfWeek === '*' ? 'chip-active' : ''}`}
                >
                  Every (*)
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('dayOfWeek', '1-5')}
                  className={`chip text-[11px] ${options.dayOfWeek === '1-5' ? 'chip-active' : ''}`}
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => updateOption('dayOfWeek', '0,6')}
                  className={`chip text-[11px] ${options.dayOfWeek === '0,6' ? 'chip-active' : ''}`}
                >
                  Weekend
                </button>
                {DAY_OF_WEEK_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => updateOption('dayOfWeek', d.value)}
                    className={`chip text-[11px] ${options.dayOfWeek === d.value ? 'chip-active' : ''}`}
                  >
                    {d.label.slice(0, 3)}
                  </button>
                ))}
                <input
                  type="text"
                  value={options.dayOfWeek}
                  onChange={e => updateOption('dayOfWeek', e.target.value)}
                  placeholder="*"
                  className="input-base w-20 text-xs text-center"
                />
              </div>
            </div>
          </div>
        </SectionPanel>

        {/* Custom expression input */}
        <div>
          <label className="block text-xs font-mono text-dim mb-1.5">Or type a custom expression</label>
          <input
            type="text"
            value={customExpression}
            onChange={e => handleCustomChange(e.target.value)}
            placeholder="* * * * *"
            className="input-base font-mono"
          />
        </div>

        {/* Result */}
        <SectionPanel label="Generated Expression">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-lg text-bright bg-surface border border-border rounded-lg px-4 py-3 tracking-wider">
                {activeExpression}
              </code>
              <CopyButton text={activeExpression} size="md" />
            </div>

            <div className="rounded-lg border border-border bg-surface/50 p-3">
              <p className="text-xs font-sans text-dim font-medium">{activeDescription}</p>
            </div>

            {/* Field breakdown */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: 'Min', value: activeExpression.split(' ')[0] || '*' },
                { label: 'Hour', value: activeExpression.split(' ')[1] || '*' },
                { label: 'Day', value: activeExpression.split(' ')[2] || '*' },
                { label: 'Month', value: activeExpression.split(' ')[3] || '*' },
                { label: 'DOW', value: activeExpression.split(' ')[4] || '*' },
              ].map(field => (
                <div key={field.label} className="p-2 bg-surface border border-border rounded">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-0.5">{field.label}</div>
                  <div className="font-mono text-xs text-bright font-medium">{field.value}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionPanel>
      </div>
    </ToolLayout>
  )
}
