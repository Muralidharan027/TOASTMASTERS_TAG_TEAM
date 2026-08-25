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
        canvas: {
          light: '#FBFBFA',
          subtle: '#F4F4F2',
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
          darkSubtle: '#1E293B',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#102A43',
          900: '#0F172A',
          950: '#0A0F1D',
        },
        // Role brand colors
        timer: {
          light: '#ECFDF5',
          DEFAULT: '#059669',
          dark: '#047857',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
        ahcounter: {
          light: '#FFF7ED',
          DEFAULT: '#EA580C',
          dark: '#C2410C',
        },
        grammarian: {
          light: '#F5F3FF',
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        trivia: {
          light: '#F0F9FF',
          DEFAULT: '#0284C7',
          dark: '#0369A1',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-yellow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
      },
    },
  },
  plugins: [],
};
