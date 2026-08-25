import { useState } from 'react'
import { WifiOff, RefreshCw, X, Download } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'

export default function PwaStatusBanner() {
  const { isOnline, isUpdateAvailable, applyUpdate, isInstallable, promptInstall, isInstalled } = usePWA()
  const [dismissUpdate, setDismissUpdate] = useState(false)
  const [dismissInstall, setDismissInstall] = useState(false)

  return (
    <div className="relative z-40">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div
          id="pwa-offline-banner"
          className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 px-4 py-2 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <div className="flex-1">
              <span className="font-semibold text-amber-200">Offline Mode Active:</span> All 51+ developer tools run 100% in browser memory with zero network latency.
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase font-bold tracking-wider">
              Local Memory
            </span>
          </div>
        </div>
      )}

      {/* ── App Update Available Banner ── */}
      {isUpdateAvailable && !dismissUpdate && (
        <div
          id="pwa-update-banner"
          className="bg-accent/15 border-b border-accent/30 text-bright px-4 py-2.5 text-xs font-mono flex items-center justify-between gap-3 shadow-sm animate-fade-in"
        >
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2 text-subtle">
              <RefreshCw className="w-4 h-4 text-accent animate-spin" />
              <span>A new version of <strong>ToolBox4Devs</strong> is ready.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-apply-pwa-update"
                onClick={applyUpdate}
                className="px-3 py-1 bg-accent text-accent-fg font-sans text-xs font-semibold rounded hover:bg-accent/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Update Now
              </button>
              <button
                id="btn-dismiss-pwa-update"
                onClick={() => setDismissUpdate(true)}
                className="p-1 text-muted hover:text-bright rounded hover:bg-surface transition-colors"
                title="Dismiss update alert"
                aria-label="Dismiss update alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Install as Desktop / Mobile App Quick Tip (Only if installable and not installed) ── */}
      {isInstallable && !isInstalled && !dismissInstall && (
        <div
          id="pwa-install-prompt-banner"
          className="hidden md:flex bg-surface/80 backdrop-blur border-b border-border text-dim px-4 py-2 text-xs font-mono items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Install ToolBox4Devs as a standalone desktop app for instant offline access.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-install-pwa-top"
                onClick={promptInstall}
                className="px-2.5 py-0.5 rounded border border-accent/40 bg-accent-soft text-accent text-[11px] font-sans font-medium hover:bg-accent hover:text-accent-fg transition-all cursor-pointer"
              >
                Install App
              </button>
              <button
                onClick={() => setDismissInstall(true)}
                className="p-1 text-muted hover:text-bright rounded transition-colors"
                title="Dismiss install tip"
                aria-label="Dismiss install tip"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
