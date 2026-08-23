import { Link } from 'react-router-dom'
import { ArrowRight, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center animate-fade-in">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-rose-500/8 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/8 text-rose-400 text-[11px] font-mono font-medium mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        Page Not Found
      </div>

      <h1 className="font-display text-[clamp(4rem,12vw,8rem)] leading-[0.85] mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400">
          404
        </span>
      </h1>

      <p className="text-dim font-sans text-base mb-3">This page doesn't exist or has been moved.</p>
      <p className="text-subtle font-mono text-xs mb-10">Try one of these instead:</p>

      <div className="flex items-center justify-center gap-4">
        <Link to="/" className="btn-primary !text-xs !gap-1.5">
          <Home size={14} />
          Go Home
          <ArrowRight size={13} />
        </Link>
        <Link to="/tools" className="btn-ghost !text-xs !gap-1.5">
          <Search size={14} />
          Browse Tools
        </Link>
      </div>
    </main>
  )
}
