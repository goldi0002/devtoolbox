import { useState, useEffect, useRef } from 'react'
import {
  SANS_FONTS,
  MONO_FONTS,
  SansFontId,
  MonoFontId,
  getInitialSansFont,
  getInitialMonoFont,
  applySansFont,
  applyMonoFont
} from '../../utils/fonts'
import { Type, Sparkles, Check } from 'lucide-react'

export default function FontPicker() {
  const [open, setOpen] = useState(false)
  const [sansFont, setSansFont] = useState<SansFontId>('dm-sans')
  const [monoFont, setMonoFont] = useState<MonoFontId>('jetbrains-mono')
  const [activeTab, setActiveTab] = useState<'sans' | 'mono'>('sans')
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSansFont(getInitialSansFont())
    setMonoFont(getInitialMonoFont())
    setMounted(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleSelectSans = (id: SansFontId) => {
    setSansFont(id)
    applySansFont(id)
  }

  const handleSelectMono = (id: MonoFontId) => {
    setMonoFont(id)
    applyMonoFont(id)
  }

  if (!mounted) return null

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-center w-8 h-8 rounded-md border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          open
            ? 'border-subtle text-bright bg-surface'
            : 'border-border text-dim hover:text-bright hover:border-subtle hover:bg-surface'
        }`}
        aria-label="Change typography and fonts"
        aria-expanded={open}
        title="Change Typography & Fonts"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Font Selection Dropdown */}
      {open && (
        <div className="absolute right-0 top-9 w-72 border border-border bg-bg z-50 rounded-lg shadow-xl animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-border bg-surface/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-mono text-bright uppercase tracking-widest font-semibold">
                Typography
              </span>
            </div>
            <span className="text-[9px] font-mono text-subtle">
              Instant preview
            </span>
          </div>

          {/* Sub Tabs: UI Font / Code Font */}
          <div className="grid grid-cols-2 p-1.5 bg-surface/20 border-b border-border text-xs font-mono">
            <button
              onClick={() => setActiveTab('sans')}
              className={`py-1 px-2 rounded text-center transition-colors ${
                activeTab === 'sans'
                  ? 'bg-surface text-bright font-semibold shadow-xs border border-border/60'
                  : 'text-subtle hover:text-bright'
              }`}
            >
              UI Text
            </button>
            <button
              onClick={() => setActiveTab('mono')}
              className={`py-1 px-2 rounded text-center transition-colors ${
                activeTab === 'mono'
                  ? 'bg-surface text-bright font-semibold shadow-xs border border-border/60'
                  : 'text-subtle hover:text-bright'
              }`}
            >
              Code & Monospace
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 divide-y-0">
            {activeTab === 'sans' && (
              <>
                {SANS_FONTS.map(f => {
                  const isSelected = sansFont === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectSans(f.id)}
                      style={{ fontFamily: f.family }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors ${
                        isSelected
                          ? 'bg-accent-soft text-bright border border-accent/30'
                          : 'text-dim hover:text-bright hover:bg-surface'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-2">
                          <span>{f.label}</span>
                          {f.id === 'dm-sans' && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface border border-border text-subtle font-normal">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-subtle mt-0.5 font-normal">
                          {f.sample}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-accent shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}
              </>
            )}

            {activeTab === 'mono' && (
              <>
                {MONO_FONTS.map(f => {
                  const isSelected = monoFont === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelectMono(f.id)}
                      style={{ fontFamily: f.family }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors ${
                        isSelected
                          ? 'bg-accent-soft text-bright border border-accent/30'
                          : 'text-dim hover:text-bright hover:bg-surface'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-2">
                          <span>{f.label}</span>
                          {f.id === 'jetbrains-mono' && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface border border-border text-subtle font-normal">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-subtle mt-0.5 font-mono">
                          {f.sample}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-accent shrink-0 ml-2" />
                      )}
                    </button>
                  )
                })}
              </>
            )}
          </div>

          {/* Footer Reset */}
          <div className="p-2 border-t border-border bg-surface/30 flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted">Stored locally</span>
            <button
              onClick={() => {
                handleSelectSans('dm-sans')
                handleSelectMono('jetbrains-mono')
              }}
              className="text-subtle hover:text-bright underline"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
