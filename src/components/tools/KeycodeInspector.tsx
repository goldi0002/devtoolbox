import { useState, useEffect, useMemo } from 'react'
import { extractKeyInfo, generateEventCodeSnippets, KeyInfo, COMMON_KEY_CODES } from '../../utils/keyboardEvents'
import CopyButton from '../CopyButton'
import { Keyboard, Terminal, Sparkles, Search, Layers, Command, CornerDownLeft } from 'lucide-react'

const INITIAL_KEY_INFO: KeyInfo = {
  key: 'Enter',
  code: 'Enter',
  keyCode: 13,
  which: 13,
  location: 0,
  locationName: 'Standard (DOM_KEY_LOCATION_STANDARD)',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  repeat: false,
  char: '',
}

export default function KeycodeInspector() {
  const [activeKey, setActiveKey] = useState<KeyInfo>(INITIAL_KEY_INFO)
  const [snippetTab, setSnippetTab] = useState<'javascript' | 'react' | 'vue'>('javascript')
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isListening) return
      // Don't capture when typing in the search input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return

      e.preventDefault()
      const info = extractKeyInfo(e)
      setActiveKey(info)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening])

  const snippets = useMemo(() => {
    return generateEventCodeSnippets(activeKey)
  }, [activeKey])

  const filteredTable = useMemo(() => {
    if (!searchQuery.trim()) return COMMON_KEY_CODES
    const q = searchQuery.toLowerCase()
    return COMMON_KEY_CODES.filter(
      item =>
        item.key.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        String(item.keyCode).includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* ── Live Key Capture Hero Box ── */}
      <div 
        tabIndex={0}
        onClick={() => setIsListening(true)}
        className="card p-8 bg-surface border-2 border-indigo-500/40 hover:border-indigo-500/80 rounded-2xl text-center space-y-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center justify-between text-xs font-mono text-subtle">
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold uppercase tracking-wider">
            <Keyboard size={15} />
            Live Keypress Detector
          </span>
          <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] animate-pulse">
            ● Press Any Key on Keyboard
          </span>
        </div>

        {/* Giant Keycode Display */}
        <div className="py-4">
          <span className="text-6xl sm:text-8xl font-black font-mono text-bright tracking-tight">
            {activeKey.which || activeKey.keyCode}
          </span>
          <span className="block text-xs font-mono text-subtle mt-2">
            JavaScript Event KeyCode / Which
          </span>
        </div>

        {/* 4 Core Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
          <div className="p-3 bg-muted/40 border border-border rounded-xl">
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">event.key</span>
            <span className="text-base font-bold font-mono text-indigo-300 truncate block">
              {activeKey.key === ' ' ? '(Space)' : activeKey.key}
            </span>
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-xl">
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">event.code</span>
            <span className="text-base font-bold font-mono text-emerald-400 truncate block">
              {activeKey.code}
            </span>
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-xl">
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">event.which</span>
            <span className="text-base font-bold font-mono text-amber-400 truncate block">
              {activeKey.which}
            </span>
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-xl">
            <span className="text-[10px] font-mono text-subtle uppercase block mb-1">event.location</span>
            <span className="text-base font-bold font-mono text-pink-400 truncate block">
              {activeKey.location}
            </span>
          </div>
        </div>

        {/* Modifier Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { label: 'Shift', active: activeKey.shiftKey },
            { label: 'Control (Ctrl)', active: activeKey.ctrlKey },
            { label: 'Alt / Option', active: activeKey.altKey },
            { label: 'Meta / Command', active: activeKey.metaKey },
            { label: 'Repeat', active: activeKey.repeat },
          ].map((mod) => (
            <span
              key={mod.label}
              className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all ${
                mod.active
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-xs'
                  : 'bg-muted/30 text-muted border-border/50'
              }`}
            >
              {mod.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Code Snippet Generator ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-indigo-400" />
            <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider">
              Event Handler Snippet ({activeKey.code})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-muted/50 rounded-lg border border-border">
              {(['javascript', 'react', 'vue'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSnippetTab(tab)}
                  className={`px-3 py-1 text-xs font-mono rounded-md capitalize transition-colors ${
                    snippetTab === tab ? 'bg-indigo-600 text-white font-medium' : 'text-dim hover:text-bright'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <CopyButton text={snippets[snippetTab]} />
          </div>
        </div>

        <pre className="p-4 bg-muted/30 border border-border rounded-xl font-mono text-xs text-bright overflow-x-auto select-all">
          {snippets[snippetTab]}
        </pre>
      </div>

      {/* ── Key Codes Reference Table ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-indigo-400" />
            Standard Key Codes Reference Table
          </h3>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, codes, categories..."
              className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto border border-border/70 rounded-lg">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-surface border-b border-border">
              <tr>
                <th className="p-2.5 text-indigo-300">Key</th>
                <th className="p-2.5 text-emerald-400">event.code</th>
                <th className="p-2.5 text-amber-400">keyCode</th>
                <th className="p-2.5 text-subtle">Category</th>
                <th className="p-2.5 text-subtle">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => {
                    setActiveKey({
                      key: item.key,
                      code: item.code,
                      keyCode: item.keyCode,
                      which: item.keyCode,
                      location: 0,
                      locationName: 'Standard',
                      ctrlKey: false,
                      shiftKey: false,
                      altKey: false,
                      metaKey: false,
                      repeat: false,
                      char: item.key.length === 1 ? item.key : '',
                    })
                  }}
                  className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-2.5 font-bold text-bright">{item.key}</td>
                  <td className="p-2.5 text-emerald-400">{item.code}</td>
                  <td className="p-2.5 text-amber-400 font-bold">{item.keyCode}</td>
                  <td className="p-2.5 text-subtle">{item.category}</td>
                  <td className="p-2.5 text-dim">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
