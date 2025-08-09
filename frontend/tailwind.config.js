/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern color palette with main blue accent
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2C66ED', // Main accent blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2C66ED', // Main accent blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Soft whites for light mode
        soft: {
          50: '#FFFFFF',
          100: '#F7F7F7', // Main soft white
          200: '#F0F0F0',
          300: '#E8E8E8',
          400: '#D0D0D0',
          500: '#B8B8B8',
        },
        // Dark palette for dark mode
        dark: {
          50: '#404040',
          100: '#383838',
          200: '#303030',
          300: '#282828',
          400: '#202020',
          500: '#191919', // Main dark background
          600: '#141414',
          700: '#0F0F0F',
          800: '#0A0A0A',
          900: '#050505',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
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
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Saroshi', 'Inter', 'system-ui', 'sans-serif'],
        saroshi: ['Saroshi', 'sans-serif'],
      },
      fontWeight: {
        'extralight': 200,
        'normal': 400,
        'bold': 700,
        'black': 900,
      },
      borderRadius: {
        'glass': '24px',
        'card': '20px',
        'button': '16px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'glass': '0 4px 16px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'float': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'float-dark': '0 4px 20px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
