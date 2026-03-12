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
        bg:      'var(--color-bg)',
        surface: 'var(--color-surface)',
        border:  'var(--color-border)',
        muted:   'var(--color-muted)',
        subtle:  'var(--color-subtle)',
        dim:     'var(--color-dim)',
        light:   'var(--color-light)',
        bright:  'var(--color-bright)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
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
