import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HardDrive, Download, WifiOff } from 'lucide-react'
import { tools } from '../tools/registry'
import { usePWA } from '../hooks/usePWA'
import ThemePicker from './ui/Themepicker'

const CommandPalette = lazy(() => import('./CommandPalette'))
const PwaModal = lazy(() => import('./ui/PwaModal'))

// ── Nav config ─────────────────────────────────────────────────────────────
const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Tools', path: '/tools' },
  { label: 'About', path: '/about' },
]

// Only in mobile menu — keeps desktop nav tight
const mobileOnlyLinks = [
  { label: 'Privacy', path: '/privacy' },
]

const toolSlugs = tools.map(t => t.slug)

// ── Logo ───────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div className="w-8 h-8 grid grid-cols-2 gap-0.5 p-1 rounded-md bg-accent-soft transition-transform duration-300 group-hover:scale-105">
      <div className="bg-accent rounded-[2px]" />
      <div className="bg-accent/40 rounded-[2px]" />
      <div className="bg-accent/40 rounded-[2px]" />
      <div className="bg-accent rounded-[2px]" />
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showShortcutHint, setShowShortcutHint] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [pwaOpen, setPwaOpen] = useState(false)

  const { isOnline, isInstallable, promptInstall, isInstalled } = usePWA()

  useEffect(() => { setMounted(true) }, [])
  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Global keyboard shortcut: press "?" to open shortcut hint, "/" to jump to tools search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const tag = target.tagName

    // also check for contenteditable (CodeMirror)
    const isEditable =
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      target.isContentEditable ||           // ← covers CodeMirror & any other rich editor
      target.closest('[contenteditable]')   // ← covers clicks inside nested elements

    if (e.key === 'Escape') {
      setShowShortcutHint(false)
      setPwaOpen(false)
      return
    }

    if (isEditable) return

    if (e.key === '?') {
      e.preventDefault()
      setShowShortcutHint(h => !h)
    }
    if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const isActive = (path: string) => {
    if (!mounted) return false
    if (path === '/') return pathname === '/'
    if (path === '/tools') {
      return (
        pathname === '/tools' ||
        pathname.startsWith('/tools/') ||
        toolSlugs.some(slug => pathname === `/${slug}`)
      )
    }
    return pathname === path
  }
  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <LogoMark />
            <span className="font-display text-xl tracking-wider text-bright">TOOLBOX4DEVS</span>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────────────── */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 font-sans
                  ${isActive(link.path)
                    ? 'text-accent bg-accent-soft font-medium'
                    : 'text-dim hover:text-bright hover:bg-surface'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right controls ────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Offline Status Badge */}
            {!isOnline && (
              <button
                onClick={() => setPwaOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="Offline Mode Active — Click for details"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium">Offline</span>
              </button>
            )}

            {/* Install App Button if Installable */}
            {isInstallable && !isInstalled && (
              <button
                onClick={promptInstall}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent/40 bg-accent-soft text-accent text-xs font-medium hover:bg-accent hover:text-accent-fg transition-all cursor-pointer shadow-sm"
                title="Install ToolBox4Devs as Desktop Application"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* PWA & Cache Manager Button */}
            <button
              onClick={() => setPwaOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-subtle hover:text-bright hover:border-accent transition-colors"
              aria-label="PWA & Offline Storage Manager"
              title="PWA & Offline Storage (Caches, App Status)"
            >
              <HardDrive className="w-3.5 h-3.5" />
            </button>

            {/* Keyboard shortcut hint */}
            <button
              onClick={() => setShowShortcutHint(h => !h)}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md border border-border text-[11px] font-mono text-subtle hover:text-bright hover:border-accent transition-colors"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-full border border-border bg-surface/70 pl-3 pr-2 py-1.5 text-[11px] font-mono text-subtle hover:border-accent hover:text-bright transition-colors"
              aria-label="Open command palette"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>Search tools</span>
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[9px] text-muted">Ctrl K</kbd>
            </button>

            {/* Theme toggle */}
            <ThemePicker />

            {/* Mobile hamburger */}
            <button
              className="sm:hidden flex flex-col gap-1.5 p-2 ml-1"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span className={`block w-5 h-px bg-bright transition-all duration-200
                ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-px bg-bright transition-all duration-200
                ${open ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-bright transition-all duration-200
                ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile nav ──────────────────────────────────────────────────── */}
        {open && (
          <div className="sm:hidden border-t border-border bg-bg px-4 py-3 flex flex-col gap-1 animate-fade-in">
            {[...navLinks, ...mobileOnlyLinks].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm rounded-md transition-all duration-200 font-sans flex items-center justify-between
                  ${isActive(link.path)
                    ? 'text-accent bg-accent-soft font-medium'
                    : 'text-dim hover:text-bright hover:bg-surface'
                  }`}
              >
                {link.label}
                {link.path === '/tools' && (
                  <span className="text-[9px] font-mono text-muted">{tools.length} tools</span>
                )}
              </Link>
            ))}

            {/* Mobile PWA & Offline Link */}
            <button
              onClick={() => {
                setOpen(false)
                setPwaOpen(true)
              }}
              className="px-3 py-2 text-sm rounded-md transition-all duration-200 font-sans flex items-center justify-between text-dim hover:text-bright hover:bg-surface text-left"
            >
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-accent" />
                Offline Storage & PWA
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>

            {isInstallable && !isInstalled && (
              <button
                onClick={() => {
                  setOpen(false)
                  promptInstall()
                }}
                className="px-3 py-2 mt-1 text-sm rounded-md bg-accent-soft text-accent hover:bg-accent hover:text-accent-fg transition-all font-sans flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Install Application
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider">PWA</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </Suspense>
      )}

      {pwaOpen && (
        <Suspense fallback={null}>
          <PwaModal isOpen={pwaOpen} onClose={() => setPwaOpen(false)} />
        </Suspense>
      )}

      {/* ── Keyboard shortcut modal ─────────────────────────────────────── */}
      {showShortcutHint && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowShortcutHint(false)}
          />
          {/* Panel */}
          <div className="fixed top-20 right-4 sm:right-6 z-50 w-72 rounded-lg border border-border bg-bg shadow-lift animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[10px] font-mono text-subtle tracking-[0.2em] uppercase">
                Keyboard Shortcuts
              </span>
              <button
                onClick={() => setShowShortcutHint(false)}
                className="text-muted hover:text-dim text-xs font-mono transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {/* Shortcuts */}
            <div className="divide-y divide-border">
              {[
                { keys: ['?'], desc: 'Toggle this panel' },
                { keys: ['/'], desc: 'Go to Tools' },
                { keys: ['F12'], desc: 'Open DevTools' },
                { keys: ['Ctrl', 'K'], desc: 'Open command palette' },
              ].map(row => (
                <div key={row.desc} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-sans text-subtle">{row.desc}</span>
                  <div className="flex items-center gap-1">
                    {row.keys.map(k => (
                      <kbd
                        key={k}
                        className="px-1.5 py-0.5 border border-border text-[10px] font-mono text-muted"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-4 py-2.5">
              <p className="text-[10px] font-mono text-muted">
                Press <kbd className="px-1 border border-border text-[9px]">Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
