import { useState, useEffect, useCallback } from 'react'
import CommandPalette from './CommandPalette'
import { Link, useLocation } from 'react-router-dom'
import { tools } from '../tools/registry'
import ThemePicker from './ui/Themepicker'

// ── Nav config ─────────────────────────────────────────────────────────────
const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Tools', path: '/tools' },
  { label: 'Changelog', path: '/changelog' },
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
    <div className="w-7 h-7 grid grid-cols-2 gap-0.5">
      <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
      <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
      <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
      <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
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
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

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
                className={`relative px-4 py-1.5 text-sm rounded transition-all duration-200 font-sans
                  ${isActive(link.path)
                    ? 'text-bright bg-muted'
                    : 'text-dim hover:text-light hover:bg-surface'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right controls ────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Keyboard shortcut hint */}
            <button
              onClick={() => setShowShortcutHint(h => !h)}
              className="hidden sm:flex items-center justify-center w-7 h-7 border border-border text-[11px] font-mono text-muted hover:text-dim hover:border-subtle transition-colors"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-mono text-subtle hover:border-subtle hover:text-bright transition-colors"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <kbd className="text-[9px] text-muted">Ctrl K</kbd>
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
                className={`px-3 py-2 text-sm rounded transition-all duration-200 font-sans flex items-center justify-between
                  ${isActive(link.path)
                    ? 'text-bright bg-muted'
                    : 'text-dim hover:text-light'
                  }`}
              >
                {link.label}
                {link.path === '/tools' && (
                  <span className="text-[9px] font-mono text-muted">{tools.length} tools</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* ── Keyboard shortcut modal ─────────────────────────────────────── */}
      {showShortcutHint && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowShortcutHint(false)}
          />
          {/* Panel */}
          <div className="fixed top-20 right-4 sm:right-6 z-50 w-72 border border-border bg-bg shadow-xl animate-slide-up">
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
