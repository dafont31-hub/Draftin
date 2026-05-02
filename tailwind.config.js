/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'industrial-bg': '#0A0A0A',
        'industrial-card': '#141414',
        'industrial-border': '#222222',
        'primary': 'var(--primary-color)',
        'accent-green': '#00FF88',
        'accent-red': '#FF0044',
      },
      boxShadow: {
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
