/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F5F1EA',
        cream: '#FAF7F2',
        paper: '#FFFFFF',
        ink: {
          main: '#2C2926',
          muted: '#7A746D',
          soft: '#A69F95',
        },
        sage: {
          light: '#E2E8DE',
          main: '#D2DECB',
          dark: '#63755A',
        },
        lavender: {
          light: '#EBE9F0',
          main: '#E2DFEC',
          dark: '#6A608A',
        },
        rose: {
          light: '#F0E6E6',
          main: '#E8D5D5',
          dark: '#8A4B4B',
        },
        sand: {
          light: '#EBE5D8',
          main: '#DBCBB9',
          dark: '#A69580',
        },
        amber: {
          light: '#FDF3E1',
          main: '#F2D091',
          dark: '#B88222',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        soft: '0 12px 32px rgba(44,41,38,0.04), 0 2px 8px rgba(44,41,38,0.02)',
        card: '0 8px 24px rgba(44,41,38,0.04), 0 2px 6px rgba(44,41,38,0.02)',
        float: '0 32px 80px rgba(44,41,38,0.08), 0 8px 24px rgba(44,41,38,0.04)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.02)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

