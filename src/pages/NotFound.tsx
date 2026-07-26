import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center animate-fade-in">
      <p className="font-mono text-xs text-subtle tracking-widest uppercase mb-4">404</p>
      <h1 className="font-display text-7xl sm:text-9xl text-bright mb-6">NOT FOUND</h1>
      <p className="text-dim font-sans mb-10">This page doesn't exist.</p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/tools" className="btn-ghost">Browse Tools</Link>
      </div>
    </main>
  )
}
