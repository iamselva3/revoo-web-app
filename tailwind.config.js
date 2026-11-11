/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        genie: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          purple: '#8b5cf6',
          pink: '#ec4899',
          dark: '#0f0f1a',
        },
        // Deep plum "ink" used for selected states & headings (turncash-style dark chips)
        ink: {
          DEFAULT: '#1f1147',
          soft: '#2d1b69',
          50: '#f5f3fb',
          100: '#ebe7f6',
        },
        revoo: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Primary Genie Gold
          600: '#d97706', // Deep Gold
          700: '#b45309',
          800: '#7c3aed', // Genie Magic Purple
          900: '#0f0f1a', // Genie Dark Slate
          950: '#07070d',
          accent: '#ec4899', // Genie Pink
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'emerald-glow': '0 10px 25px -5px rgba(5, 150, 105, 0.25), 0 8px 10px -6px rgba(5, 150, 105, 0.2)',
        'emerald-sm': '0 4px 12px rgba(5, 150, 105, 0.15)',
        'brand-glow': '0 10px 25px -5px rgba(225, 29, 72, 0.35), 0 8px 10px -6px rgba(139, 92, 246, 0.3)',
        'brand-sm': '0 4px 14px rgba(225, 29, 72, 0.25)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'cta': '0 10px 24px -8px rgba(245, 158, 11, 0.55)',
        'soft': '0 1px 2px rgba(16, 12, 40, 0.04), 0 4px 16px -6px rgba(16, 12, 40, 0.08)',
      },
    },
  },
  plugins: [],
};

