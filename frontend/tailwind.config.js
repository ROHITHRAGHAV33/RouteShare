/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1220',
          900: '#101A2E',
          800: '#16233D',
          700: '#1E304F',
          600: '#2A4066',
        },
        amber: {
          400: '#F2A93B',
          500: '#E89526',
          600: '#C97A15',
        },
        slate: {
          50: '#F6F7F9',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
