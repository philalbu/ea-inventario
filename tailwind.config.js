/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc6c6',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff3030',
          600: '#ed1515',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
          950: '#4b0404',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
