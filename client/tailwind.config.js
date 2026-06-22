/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#5b7cfa',
          600: '#4f6fec',
          700: '#3f5fd8',
        },
        ink: {
          900: '#191f28',
          800: '#2b3440',
          700: '#4e5968',
          500: '#8b95a1',
          300: '#d1d6db',
        },
        line: '#e5e8eb',
        surface: '#ffffff',
        app: {
          bg: '#f8fafc',
          hero: '#eff6ff',
        },
        success: {
          50: '#f0fdf4',
          600: '#16a34a',
          700: '#15803d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(25, 31, 40, 0.08)',
        card: '0 4px 16px rgba(25, 31, 40, 0.04)',
        input: '0 0 0 3px rgba(91, 124, 250, 0.16)',
      },
      borderRadius: {
        ui: '10px',
      },
    },
  },
  plugins: [],
};
