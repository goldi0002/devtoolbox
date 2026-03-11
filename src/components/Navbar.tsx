import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { tools } from '../tools/registry'

const navLinks = [
  { label: 'Home',  path: '/'      },
  { label: 'Tools', path: '/tools' },
  { label: 'About', path: '/about' },
]

const toolSlugs = tools.map(t => t.slug)

// ── Logo variants ──────────────────────────────────────────────
function LogoMark({ variant = 'grid' }: { variant?: string }) {
  if (variant === 'grid') return (
    // Original: 2×2 squares with diagonal bright pattern
    <div className="w-7 h-7 grid grid-cols-2 gap-0.5">
      <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
      <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
      <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
      <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
    </div>
  )

  if (variant === 'brackets') return (
    // Code brackets < > as a nod to dev tooling
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <text x="0" y="21" fontFamily="monospace" fontSize="20" className="fill-bright
        transition-all duration-300 group-hover:fill-white">
        {'<>'}
      </text>
    </svg>
  )

  if (variant === 'hex') return (
    // Hexagon — suggests precision / tech
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon
        points="14,2 25,8 25,20 14,26 3,20 3,8"
        className="fill-bright transition-all duration-300 group-hover:fill-white"
      />
      <polygon
        points="14,7 21,11 21,19 14,23 7,19 7,11"
        fill="transparent"
        className="stroke-bg"
        strokeWidth="1.5"
      />
    </svg>
  )

  if (variant === 'slash') return (
    // Forward slash — universal dev symbol
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="5" className="fill-bright transition-all duration-300 group-hover:fill-white" />
      <line x1="19" y1="5" x2="9" y2="23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        className="stroke-bg" />
    </svg>
  )

  if (variant === 'terminal') return (
    // Terminal prompt _ cursor blink
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="4" className="fill-surface" />
      <text x="5" y="18" fontFamily="monospace" fontSize="11"
        className="fill-bright transition-all duration-300 group-hover:fill-white">
        {'_'}
      </text>
      <text x="11" y="18" fontFamily="monospace" fontSize="11"
        className="fill-dim transition-all duration-300 group-hover:fill-light">
        {'$'}
      </text>
    </svg>
  )

  return null
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix: actually set mounted so isActive works
  useEffect(() => { setMounted(true) }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

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
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoMark variant="grid" /> {/* swap variant here */}
          <span className="font-display text-xl tracking-wider text-bright">TOOLBOX4DEVS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 text-sm rounded transition-all duration-200 font-sans
                ${isActive(link.path)
                  ? 'text-bright bg-muted'
                  : 'text-dim hover:text-light hover:bg-surface'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2"
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

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-border bg-bg px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 text-sm rounded transition-all duration-200 font-sans
                ${isActive(link.path)
                  ? 'text-bright bg-muted'
                  : 'text-dim hover:text-light'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}