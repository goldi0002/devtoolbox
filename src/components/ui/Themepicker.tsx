import { useState, useEffect, useRef } from 'react'

type Theme = 'toolbox4devs' | 'light' | 'dark' | 'sepia' | 'nord' | 'terminal' | 'dracula' | 'solarized' | 'rose' | 'monokai'

const THEMES: { id: Theme; label: string; icon: string }[] = [
    { id: 'toolbox4devs', label: 'Toolbox4Devs', icon: '🧰' },
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'sepia', label: 'Sepia', icon: '📜' },
    { id: 'nord', label: 'Nord', icon: '❄️' },
    { id: 'terminal', label: 'Terminal', icon: '💻' },
    { id: 'dracula', label: 'Dracula', icon: '🧛‍♂️' },
    { id: 'solarized', label: 'Solarized', icon: '🌊' },
    { id: 'rose', label: 'Rose', icon: '🌹' },
    { id: 'monokai', label: 'Monokai', icon: '🍊' },
]

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'toolbox4devs'
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && THEMES.some(t => t.id === stored)) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'toolbox4devs'
}

function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
}

export default function ThemePicker() {
    const [theme, setTheme] = useState<Theme>('toolbox4devs')
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const t = getInitialTheme()
        setTheme(t)
        applyTheme(t)
        setMounted(true)
    }, [])

    // Close on click outside
    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        // slight delay so the toggle click doesn't immediately close
        const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
        return () => {
            clearTimeout(id)
            document.removeEventListener('mousedown', handleClick)
        }
    }, [open])

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    const select = (t: Theme) => {
        setTheme(t)
        applyTheme(t)
        setOpen(false)
    }

    const current = THEMES.find(t => t.id === theme)

    if (!mounted) return null

    return (
        <div ref={ref} className="relative">

            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center justify-center w-7 h-7 border text-sm
          transition-all duration-200
          ${open
                        ? 'border-subtle text-bright'
                        : 'border-border text-dim hover:text-bright hover:border-subtle'
                    }`}
                aria-label="Change theme"
                aria-expanded={open}
                title="Change theme"
            >
                {current?.icon}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-9 w-40 border border-border bg-bg z-50 shadow-lg animate-fade-in">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-border">
                        <span className="text-[9px] font-mono text-muted uppercase tracking-widest">
                            Theme
                        </span>
                    </div>

                    {/* Options */}
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => select(t.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono
                transition-colors text-left
                ${theme === t.id
                                    ? 'text-bright bg-surface'
                                    : 'text-dim hover:text-bright hover:bg-surface'
                                }`}
                        >
                            <span className="text-sm leading-none">{t.icon}</span>
                            <span>{t.label}</span>
                            {theme === t.id && (
                                <span className="ml-auto text-[10px] text-muted">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}