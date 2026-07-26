/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      colors: {
        bg:      'rgb(var(--color-bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        border:  'rgb(var(--color-border-rgb) / <alpha-value>)',
        muted:   'rgb(var(--color-muted-rgb) / <alpha-value>)',
        subtle:  'rgb(var(--color-subtle-rgb) / <alpha-value>)',
        dim:     'rgb(var(--color-dim-rgb) / <alpha-value>)',
        light:   'rgb(var(--color-light-rgb) / <alpha-value>)',
        bright:  'rgb(var(--color-bright-rgb) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          fg:      'rgb(var(--color-accent-fg-rgb) / <alpha-value>)',
          soft:    'var(--color-accent-soft)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'accent-pulse': 'accentPulse 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        accentPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        pageLoaderBar: {
          '0%, 100%': { height: '10px', opacity: '0.2' },
          '50%': { height: '48px', opacity: '1' },
        },
        pageLoaderFade: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        toolBar: {
          '0% 100%': { height: '8px', opacity: '0.15' },
          '100%': { height: '22px', opacity: '0.6' }
        },
      },
    },
  },
  plugins: [],
}
