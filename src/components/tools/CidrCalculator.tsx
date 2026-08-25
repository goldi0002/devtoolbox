import { useState, useMemo } from 'react'
import { calculateCidr, CidrResult } from '../../utils/cidr'
import CopyButton from '../CopyButton'
import { Network, Copy, Layers, Globe, Shield } from 'lucide-react'

const PRESET_CIDRS = [
  '192.168.1.0/24',
  '10.0.0.0/16',
  '172.16.0.0/12',
  '192.168.0.1/28',
  '10.100.50.0/22',
  '1.1.1.1/32',
]

export default function CidrCalculator() {
  const [inputCidr, setInputCidr] = useState('192.168.1.0/24')

  const { result, error } = useMemo<{ result: CidrResult | null; error: string | null }>(() => {
    try {
      if (!inputCidr.trim()) return { result: null, error: null }
      const res = calculateCidr(inputCidr)
      return { result: res, error: null }
    } catch (err: any) {
      return { result: null, error: err?.message || 'Invalid CIDR format' }
    }
  }, [inputCidr])

  return (
    <div className="space-y-6">
      {/* ── Input Header & Presets ── */}
      <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
        <div>
          <label htmlFor="cidr-input" className="block text-xs font-mono text-subtle mb-2 font-medium">
            IP Address / CIDR Prefix (e.g., 192.168.1.0/24 or 10.0.0.1/16)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              id="cidr-input"
              type="text"
              value={inputCidr}
              onChange={(e) => setInputCidr(e.target.value)}
              placeholder="192.168.1.0/24"
              className="flex-1 px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {result && (
              <div className="shrink-0">
                <CopyButton text={`Network: ${result.networkAddress}/${result.prefix}\nNetmask: ${result.netmask}\nHosts: ${result.firstUsableIp} - ${result.lastUsableIp} (${result.usableHosts} usable)`} />
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-[11px] font-mono text-muted">Presets:</span>
          {PRESET_CIDRS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setInputCidr(preset)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors ${
                inputCidr === preset
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-muted/30 text-dim border-border/60 hover:bg-muted/60 hover:text-bright'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error Display ── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
          ⚠ {error}
        </div>
      )}

      {/* ── Calculation Results ── */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 bg-surface border border-border rounded-xl">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider block mb-1">Usable Hosts</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{result.usableHosts.toLocaleString()}</span>
              <span className="text-[10px] text-muted block mt-1">({result.totalHosts.toLocaleString()} total addresses)</span>
            </div>

            <div className="card p-4 bg-surface border border-border rounded-xl">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider block mb-1">Subnet Mask</span>
              <span className="text-base font-bold font-mono text-bright">{result.netmask}</span>
              <span className="text-[10px] text-muted block mt-1">CIDR /{result.prefix}</span>
            </div>

            <div className="card p-4 bg-surface border border-border rounded-xl">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider block mb-1">IP Classification</span>
              <span className="text-base font-bold font-mono text-indigo-400">{result.ipClass}</span>
              <span className="text-[10px] text-muted block mt-1">{result.ipType} Scope</span>
            </div>

            <div className="card p-4 bg-surface border border-border rounded-xl">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider block mb-1">Wildcard Mask</span>
              <span className="text-base font-bold font-mono text-amber-400">{result.wildcard}</span>
              <span className="text-[10px] text-muted block mt-1">Inverse mask</span>
            </div>
          </div>

          {/* Detailed Breakdown Grid */}
          <div className="card p-6 bg-surface border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2">
                <Network size={14} className="text-indigo-400" />
                Network Addressing Table
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle">Network Address:</span>
                <span className="font-semibold text-bright">{result.networkAddress}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle">Broadcast Address:</span>
                <span className="font-semibold text-bright">{result.broadcastAddress}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle">First Usable Host IP:</span>
                <span className="font-semibold text-emerald-400">{result.firstUsableIp}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-subtle">Last Usable Host IP:</span>
                <span className="font-semibold text-emerald-400">{result.lastUsableIp}</span>
              </div>
            </div>

            {/* Binary Representations */}
            <div className="pt-3 border-t border-border/40 space-y-3">
              <h4 className="text-[11px] font-mono text-subtle uppercase">Binary Bit Breakdown</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-muted/30 gap-1">
                  <span className="text-muted">IP Address (Binary):</span>
                  <span className="text-indigo-300 select-all font-mono tracking-wider">{result.ipBinary}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-muted/30 gap-1">
                  <span className="text-muted">Subnet Mask (Binary):</span>
                  <span className="text-amber-300 select-all font-mono tracking-wider">{result.netmaskBinary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
