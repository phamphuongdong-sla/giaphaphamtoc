/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1510',
        'ink-soft': '#3d2e24',
        muted: '#7a6a5a',
        lacquer: '#7b2d24',
        'lacquer-d': '#3e1410',
        'lacquer-l': '#a84d40',
        gold: '#b8893c',
        'gold-l': '#dbb96a',
        'gold-pale': '#f0ddb0',
        paper: '#fdf6e9',
        'paper-warm': '#f8eedb',
        'paper-mid': '#f0e2c8',
        cream: '#fffcf5',
        ivory: '#fff9ee',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif"', 'serif'],
        serif: ['"Noto Serif"', '"Cormorant Garamond"', 'serif'],
        body: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}