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
        bg: '#ffffff',        // page background → white
        surface: '#f5f5f5',   // card / input background → off-white
        border: '#e0e0e0',    // borders → light gray
        muted: '#cccccc',     // muted elements
        subtle: '#999999',    // subtle text / icons
        dim: '#666666',       // secondary text
        light: '#333333',     // body text
        bright: '#0a0a0a',    // headings / primary text → near black
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
