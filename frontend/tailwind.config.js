/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'sans-serif'],
        display: ['Outfit', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'navy-dark': '#07090e',
      },
    },
  },
  plugins: [],
}
