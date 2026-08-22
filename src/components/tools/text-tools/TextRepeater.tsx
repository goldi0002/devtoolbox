import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import OutputPanel from '../../ui/OutputPanel'
import StatCard from '../../ui/StatCard'
import TextAreaField from '../../ui/TextAreaField'
import TextStats from '../../ui/TextStats'
import TipsCard from '../../ui/TipsCard'
import ToggleGroup from '../../ui/ToggleGroup'

type SeparatorType = 'newline' | 'space' | 'comma' | 'none' | 'custom'

const SEPARATOR_OPTIONS = [
  { value: 'newline' as const, label: 'Newline' },
  { value: 'space' as const, label: 'Space' },
  { value: 'comma' as const, label: 'Comma' },
  { value: 'none' as const, label: 'None' },
  { value: 'custom' as const, label: 'Custom' },
]

type NumberingType = 'none' | 'dot' | 'colon' | 'bracket'

const NUMBERING_OPTIONS = [
  { value: 'none' as const, label: 'No Numbering' },
  { value: 'dot' as const, label: '1. Text' },
  { value: 'colon' as const, label: '1: Text' },
  { value: 'bracket' as const, label: '[1] Text' },
]

const ITERATION_PRESETS = [10, 100, 500, 1000, 5000]

export default function TextRepeater() {
  const [input, setInput] = useState('Repeat Me 🔥')
  const [iterations, setIterations] = useState<number>(1000)
  const [separator, setSeparator] = useState<SeparatorType>('newline')
  const [customSeparator, setCustomSeparator] = useState(' - ')
  const [numbering, setNumbering] = useState<NumberingType>('none')
  const [caseMode, setCaseMode] = useState<'none' | 'uppercase' | 'lowercase'>('none')
  const [trimTrailing, setTrimTrailing] = useState(true)

  const output = useMemo(() => {
    if (!input || iterations <= 0) return ''

    // Safety limit to avoid browser tab freezing (max 50,000 repeats)
    const safeIterations = Math.min(iterations, 50000)

    let sep = ''
    if (separator === 'newline') sep = '\n'
    else if (separator === 'space') sep = ' '
    else if (separator === 'comma') sep = ', '
    else if (separator === 'custom') sep = customSeparator
    else if (separator === 'none') sep = ''

    const lines: string[] = []
    for (let i = 1; i <= safeIterations; i++) {
      let currentText = input

      // Handle Case Conversion
      if (caseMode === 'uppercase') {
        currentText = currentText.toUpperCase()
      } else if (caseMode === 'lowercase') {
        currentText = currentText.toLowerCase()
      }

      // Handle Numbering
      if (numbering === 'dot') {
        currentText = `${i}. ${currentText}`
      } else if (numbering === 'colon') {
        currentText = `${i}: ${currentText}`
      } else if (numbering === 'bracket') {
        currentText = `[${i}] ${currentText}`
      }

      lines.push(currentText)
    }

    let result = lines.join(sep)
    if (trimTrailing) {
      result = result.trim()
    }
    return result
  }, [input, iterations, separator, customSeparator, numbering, caseMode, trimTrailing])

  const handleIterationsChange = (valStr: string) => {
    const val = parseInt(valStr, 10)
    if (isNaN(val)) {
      setIterations(0)
    } else {
      setIterations(Math.max(1, Math.min(val, 50000)))
    }
  }

  return (
    <ToolLayout
      title="Text Repeater & Multiplier"
      description="Replicate any text or string thousands of times with custom separators and formatting"
      tag="text"
    >
      <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TextAreaField
              label="Source Text"
              value={input}
              onChange={setInput}
              className="textarea-base h-40"
              placeholder="Type or paste the text you want to repeat..."
              footer={<TextStats value={input} />}
            />

            {/* Repeat Configuration Panel */}
            <div className="card space-y-4 bg-surface/40 border border-border/80">
              <h3 className="text-xs font-semibold font-mono text-dim tracking-wider uppercase border-b border-border/40 pb-2">
                Replication Settings
              </h3>

              {/* Iterations selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-dim">Iterations (Max 50,000)</label>
                  <input
                    type="number"
                    min={1}
                    max={50000}
                    value={iterations || ''}
                    onChange={e => handleIterationsChange(e.target.value)}
                    className="w-24 bg-surface border border-border rounded px-2 py-0.5 text-xs text-right font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={5000}
                  value={Math.min(iterations, 5000)}
                  onChange={e => setIterations(Number(e.target.value))}
                  className="w-full h-1 bg-border rounded appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-accent
                             [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-muted">1</span>
                  <div className="flex gap-1">
                    {ITERATION_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setIterations(preset)}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                          iterations === preset
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-transparent border-border text-subtle hover:text-bright hover:border-subtle'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-muted">5,000+</span>
                </div>
              </div>

              {/* Separators selection */}
              <div>
                <label className="block text-xs font-mono text-dim mb-2">Separator</label>
                <div className="flex flex-wrap gap-2">
                  <ToggleGroup options={SEPARATOR_OPTIONS} value={separator} onChange={setSeparator} />
                </div>
                {separator === 'custom' && (
                  <div className="mt-2 animate-fade-in">
                    <input
                      type="text"
                      value={customSeparator}
                      onChange={e => setCustomSeparator(e.target.value)}
                      placeholder="e.g. - or | or whitespace..."
                      className="input-base w-full py-1 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Numbering options */}
              <div>
                <label className="block text-xs font-mono text-dim mb-2">Prefix / Numbering</label>
                <div className="flex flex-wrap gap-2">
                  <ToggleGroup options={NUMBERING_OPTIONS} value={numbering} onChange={setNumbering} />
                </div>
              </div>

              {/* Advanced option toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-dim mb-1.5">Case Formatting</label>
                  <select
                    value={caseMode}
                    onChange={e => setCaseMode(e.target.value as any)}
                    className="input-base text-xs py-1"
                  >
                    <option value="none">Keep Original Case</option>
                    <option value="uppercase">FORCE UPPERCASE</option>
                    <option value="lowercase">force lowercase</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setTrimTrailing(v => !v)}
                    className={`flex items-center justify-between text-xs font-mono px-3 py-2 rounded border text-left transition-all duration-150 ${
                      trimTrailing
                        ? 'bg-accent-soft border-accent text-bright font-medium'
                        : 'bg-transparent border-border text-dim hover:border-subtle hover:bg-muted/10'
                    }`}
                  >
                    <span>Trim trailing spaces</span>
                    <span className={trimTrailing ? 'text-accent' : 'text-muted'}>
                      {trimTrailing ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <OutputPanel
              label="Repeated Text Output"
              value={output}
              placeholder="Replicated text will appear here..."
              heightClass="h-[430px]"
              surface="surface"
            />

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <StatCard label="Total Repeats" value={`${iterations.toLocaleString()}`} />
              <StatCard label="Length" value={`${output.length.toLocaleString()} chars`} />
            </div>
          </div>
        </div>

        <TipsCard
          title="About Text Repeater"
          items={[
            'Input any string, emojis, words, or paragraphs and multiply them instantly with zero server lag.',
            'Choose between Newlines, Spaces, Commas, Custom delimiters, or stick them together with no separator.',
            'Use the Prefix / Numbering options to automatically generate formatted lists (e.g., 1. Item, 2. Item).',
            'Perfect for stress-testing form inputs, API payloads, textareas, and generating large dummy data strings.',
          ]}
        />
      </div>
    </ToolLayout>
  )
}
