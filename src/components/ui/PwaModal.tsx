import { useState } from 'react'
import { HardDrive, Wifi, WifiOff, RefreshCw, Trash2, CheckCircle2, Download, ShieldCheck, X } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'

interface PwaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PwaModal({ isOpen, onClose }: PwaModalProps) {
  const {
    isOnline,
    isInstalled,
    isInstallable,
    promptInstall,
    isUpdateAvailable,
    applyUpdate,
    cacheInfo,
    refreshCacheInfo,
    clearAllCache,
    isClearingCache,
  } = usePWA()

  const [clearedSuccess, setClearedSuccess] = useState(false)

  if (!isOpen) return null

  const handleClearCache = async () => {
    const ok = await clearAllCache()
    if (ok) {
      setClearedSuccess(true)
      setTimeout(() => setClearedSuccess(false), 3000)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-auto p-4 animate-scale-in">
        <div className="rounded-xl border border-border bg-bg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wider text-bright">PWA & Offline Storage</h3>
                <p className="text-xs text-subtle font-mono">100% In-Browser Execution & Multi-Tier Caching</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted hover:text-bright hover:bg-surface transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-sans">
            {/* Status Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-surface/40 p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-[11px] font-mono text-muted uppercase tracking-wider">Network Status</div>
                  <div className={`text-xs font-semibold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isOnline ? 'Online (Ready)' : 'Offline (Local Only)'}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface/40 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent border border-accent/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-muted uppercase tracking-wider">PWA Mode</div>
                  <div className="text-xs font-semibold text-bright">
                    {isInstalled ? 'Installed App' : 'Browser Session'}
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Explanation */}
            <div className="rounded-lg border border-border bg-surface/20 p-3.5 text-xs text-dim space-y-1.5">
              <div className="font-medium text-bright flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Zero Backend Dependency
              </div>
              <p className="leading-relaxed">
                All 51+ utilities process inputs locally using Web Crypto, WebAssembly, and JavaScript engines. No input or files are ever sent across a network.
              </p>
            </div>

            {/* Cache Storage Metrics */}
            <div className="rounded-lg border border-border bg-surface/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-bright flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-accent" />
                  Offline Cache Storage
                </span>
                <button
                  onClick={() => refreshCacheInfo()}
                  className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Stats
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-bg border border-border">
                  <div className="text-lg font-bold font-mono text-bright">
                    {cacheInfo?.totalEntries ?? 0}
                  </div>
                  <div className="text-[10px] font-mono text-muted">Cached Files</div>
                </div>

                <div className="p-2 rounded bg-bg border border-border">
                  <div className="text-lg font-bold font-mono text-accent">
                    {cacheInfo?.usageFormatted ?? '0 B'}
                  </div>
                  <div className="text-[10px] font-mono text-muted">Storage Used</div>
                </div>

                <div className="p-2 rounded bg-bg border border-border">
                  <div className="text-lg font-bold font-mono text-dim">
                    {cacheInfo?.keys.length ?? 0}
                  </div>
                  <div className="text-[10px] font-mono text-muted">Cache Tiers</div>
                </div>
              </div>

              {/* Cache Tiers List */}
              {cacheInfo && cacheInfo.keys.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <div className="text-[11px] font-mono text-muted mb-1.5">Active Service Worker Caches:</div>
                  <div className="space-y-1">
                    {cacheInfo.keys.map((k) => (
                      <div key={k} className="flex items-center justify-between text-[11px] font-mono bg-bg/50 px-2.5 py-1 rounded border border-border/40 text-subtle">
                        <span className="truncate">{k}</span>
                        <span className="text-[10px] text-emerald-400 font-sans">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Install Prompt if available */}
            {isInstallable && !isInstalled && (
              <div className="rounded-lg border border-accent/30 bg-accent-soft/40 p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-bright">Install ToolBox4Devs App</div>
                  <div className="text-[11px] text-subtle">Run with dedicated desktop window and offline launch.</div>
                </div>
                <button
                  onClick={promptInstall}
                  className="px-3 py-1.5 bg-accent text-accent-fg rounded-md text-xs font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              </div>
            )}

            {/* Update Banner */}
            {isUpdateAvailable && (
              <div className="rounded-lg border border-accent bg-accent/10 p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-bright">New Update Ready</div>
                  <div className="text-[11px] text-subtle">A refreshed build is ready to activate.</div>
                </div>
                <button
                  onClick={applyUpdate}
                  className="px-3 py-1.5 bg-accent text-accent-fg rounded-md text-xs font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Update
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isClearingCache ? 'Clearing...' : 'Clear Offline Cache'}
              </button>

              {clearedSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cache Purged!
                </span>
              )}

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md border border-border bg-surface text-bright hover:bg-surface-hover text-xs font-medium transition-colors ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
