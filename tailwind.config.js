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
  safelist: [
    // mockData.ts colorClass
    'bg-sage-light/50', 'text-sage-dark', 'bg-rose-light/50', 'text-rose-dark',
    'bg-lavender-light/50', 'text-lavender-dark', 'bg-sand-light/50', 'text-sand-dark',
    'bg-ink-soft/10', 'text-ink-main', 'bg-sand-light/30',
    // mockData.ts borderColor
    'border-sage-main', 'border-lavender-main', 'border-rose-light',
    // dashboardData.ts appointmentStatus
    'opacity-40', 'opacity-80', 'border-l-2', 'border-lavender-dark', 'bg-lavender-light/50', 'pl-3',
    // VitalCard statusConfig
    'bg-sage-light', 'border', 'border-sage-main', 'bg-lavender-light', 'border-lavender-main',
    'bg-rose-light', 'border-rose-main',
    // PredictionsPage barCls
    'bg-rose-dark/80', 'bg-amber-main', 'bg-ink-soft/50', 'bg-sage-main', 'bg-sage-dark/60',
    'bg-rose-main/90', 'bg-amber-main/90', 'bg-rose-light', 'bg-lavender-main/80', 'bg-sage-main/80',
    // PredictionsPage textCls
    'text-amber-dark', 'text-lavender-dark',
    // PredictionsPage borderCls
    'border-rose-dark/20', 'border-amber-dark/20', 'border-black/5',
    // PredictionsPage labelCls
    'text-rose-dark', 'text-amber-dark',
    // ClinicalReportsPage
    'border-rose-dark/15', 'border-sage-dark/15', 'border-lavender-dark/15',
    'bg-rose-light/10', 'bg-sage-light/10', 'bg-lavender-light/20',
    'hover:bg-rose-light/20', 'hover:bg-sage-light/20', 'hover:bg-lavender-light/40',
    'border-rose-dark/10', 'border-sage-dark/10', 'border-lavender-dark/10',
    'text-rose-dark', 'text-sage-dark', 'text-lavender-dark',
    // PatientHistoryPage statusCls
    'bg-sand-light/80', 'bg-rose-light', 'border-rose-dark/10',
    'bg-sage-main/30', 'border-sage-dark/10',
    // PatientHistoryPage valueCls
    'text-sage-dark', 'text-rose-dark',
    // PatientHistoryPage accentBar
    'bg-rose-dark/40', 'bg-sage-main/60',
    // PatientHistoryPage icons
    'bg-sage-light/50', 'bg-lavender-light/50', 'bg-ink-soft/10', 'bg-sand-light/50',
    'text-sage-dark', 'text-lavender-dark', 'text-ink-main', 'text-sand-dark',
    // PatientHistoryPage SELECTED_VITALS color
    'bg-sage-light/40', 'bg-lavender-light/40', 'bg-sand-light/40',
    // AIInsightsPage badgeCls
    'bg-rose-light', 'bg-amber-light', 'bg-sage-light',
    'border-rose-dark/10', 'border-amber-dark/10', 'border-sage-dark/10',
    // AIInsightsPage iconHoverBorder / iconHoverText
    'group-hover:border-rose-dark/30', 'group-hover:border-amber-dark/30', 'group-hover:border-sage-dark/30',
    'group-hover:text-rose-dark', 'group-hover:text-amber-dark', 'group-hover:text-sage-dark',
    // AIInsightsPage POP_BARS
    'bg-amber-main', 'text-amber-dark',
    // VitalInputPage VITAL_CARDS iconBg / iconColor / focusRing
    'bg-sage-light/50', 'bg-lavender-light/50', 'bg-sand-light/50',
    'focus-within:border-sage-dark/30', 'focus-within:border-lavender-dark/30', 'focus-within:border-sand-dark/30',
    // VitalInputPage WAVE_COLORS
    'bg-sage-dark', 'bg-lavender-main', 'bg-lavender-dark',
    // VitalInputPage preset dots
    'bg-amber-dark', 'bg-rose-dark',
    // col-span-2
    'col-span-2',
  ],
}

