import { useState, useMemo } from 'react'
import { convertNumberBase, BaseConversionResult } from '../../utils/baseConverter'
import CopyButton from '../CopyButton'
import { Hash, Binary, Cpu, Sparkles } from 'lucide-react'

export default function BaseConverter() {
  const [val, setVal] = useState('255')
  const [sourceBase, setSourceBase] = useState(10)
  const [customBase, setCustomBase] = useState(36)

  const { result, error } = useMemo<{ result: BaseConversionResult | null; error: string | null }>(() => {
    try {
      if (!val.trim()) return { result: null, error: null }
      const res = convertNumberBase(val, sourceBase, customBase)
      return { result: res, error: null }
    } catch (err: any) {
      return { result: null, error: err?.message || 'Invalid number format' }
    }
  }, [val, sourceBase, customBase])

  const setFrom = (newVal: string, base: number) => {
    setVal(newVal)
    setSourceBase(base)
  }

  return (
    <div className="space-y-6">
      {/* ── Input Card ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1">
            <label htmlFor="base-input" className="block text-xs font-mono text-subtle mb-2 font-medium">
              Input Value
            </label>
            <input
              id="base-input"
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="e.g. 255, 0xFF, 11111111"
              className="w-full px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor="source-base" className="block text-xs font-mono text-subtle mb-2 font-medium">
              Source Base
            </label>
            <select
              id="source-base"
              value={sourceBase}
              onChange={(e) => setSourceBase(Number(e.target.value))}
              className="w-full px-3 py-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500"
            >
              <option value={10}>Decimal (Base 10)</option>
              <option value={16}>Hexadecimal (Base 16)</option>
              <option value={2}>Binary (Base 2)</option>
              <option value={8}>Octal (Base 8)</option>
            </select>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-[11px] font-mono text-muted">Presets:</span>
          {[
            { label: '255 (0xFF)', val: '255', base: 10 },
            { label: '1024 (0x400)', val: '1024', base: 10 },
            { label: '65535 (16-bit max)', val: '65535', base: 10 },
            { label: '0xDEADBEEF', val: 'DEADBEEF', base: 16 },
            { label: '0b10101010', val: '10101010', base: 2 },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setFrom(p.val, p.base)}
              className="px-2.5 py-1 text-xs font-mono rounded-md bg-muted/30 text-dim border border-border/60 hover:bg-muted/60 hover:text-bright transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
          ⚠ {error}
        </div>
      )}

      {/* ── Conversion Results ── */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Main 4 Bases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decimal */}
            <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Decimal (Base 10)</span>
                <span className="text-base font-mono font-bold text-bright select-all">{result.decimal || '0'}</span>
              </div>
              <CopyButton text={result.decimal} />
            </div>

            {/* Hexadecimal */}
            <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Hexadecimal (Base 16)</span>
                <span className="text-base font-mono font-bold text-indigo-400 select-all">0x{result.hex || '0'}</span>
              </div>
              <CopyButton text={`0x${result.hex}`} />
            </div>

            {/* Binary */}
            <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between col-span-1 md:col-span-2">
              <div className="overflow-x-auto pr-2">
                <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Binary (Base 2 - 4-bit nibbles)</span>
                <span className="text-sm font-mono font-bold text-emerald-400 tracking-wider select-all">{result.binaryFormatted || '0'}</span>
              </div>
              <CopyButton text={result.binary} />
            </div>

            {/* Octal */}
            <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-subtle uppercase block mb-1">Octal (Base 8)</span>
                <span className="text-base font-mono font-bold text-amber-400 select-all">0o{result.octal || '0'}</span>
              </div>
              <CopyButton text={`0o${result.octal}`} />
            </div>

            {/* Custom Base */}
            <div className="card p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-subtle uppercase">Custom Base:</span>
                  <input
                    type="number"
                    min={2}
                    max={36}
                    value={customBase}
                    onChange={(e) => setCustomBase(Math.max(2, Math.min(36, Number(e.target.value))))}
                    className="w-12 px-1 py-0.5 text-[11px] font-mono bg-muted border border-border rounded text-center text-bright"
                  />
                </div>
                <span className="text-base font-mono font-bold text-pink-400 select-all">{result.customBase || '0'}</span>
              </div>
              <CopyButton text={result.customBase} />
            </div>
          </div>

          {/* Low-Level Bit & Two's Complement Details */}
          <div className="card p-5 bg-surface border border-border rounded-xl space-y-3">
            <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
              <Cpu size={14} className="text-indigo-400" />
              Low-Level Binary & Two's Complement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle text-[10px] block mb-1">8-Bit Representation</span>
                <span className="text-indigo-300 select-all">{result.twoComplement8}</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle text-[10px] block mb-1">16-Bit Representation</span>
                <span className="text-indigo-300 select-all">{result.twoComplement16}</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle text-[10px] block mb-1">32-Bit Representation</span>
                <span className="text-indigo-300 select-all">{result.twoComplement32}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-dim pt-2 border-t border-border/40">
              <span>Minimum Bits Required: <strong className="text-bright">{result.bitsRequired} bits</strong></span>
              <span>ASCII Character: <strong className="text-bright">{result.ascii}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
