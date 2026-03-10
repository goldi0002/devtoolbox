import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { tools } from '../tools/registry'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Tools', path: '/tools' },
  { label: 'About', path: '/about' },
]

const toolSlugs = new Set(tools.map(t => t.slug))

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/tools') {
      const slug = pathname.slice(1)
      return pathname === '/tools' || toolSlugs.has(slug)
    }
    return pathname === path
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 grid grid-cols-2 gap-0.5">
            <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
            <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
            <div className="bg-subtle rounded-sm transition-all duration-300 group-hover:bg-dim" />
            <div className="bg-bright rounded-sm transition-all duration-300 group-hover:bg-white" />
          </div>
          <span className="font-display text-xl tracking-wider text-bright">DEVTOOLBOX</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
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
          className="sm:hidden flex flex-col gap-1.5 p-2 group"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-bright transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-bright transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-bright transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-border bg-bg px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
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
