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
        'industrial-card': '#1A1A1A',
        'industrial-border': '#2D2D2D',
        'industrial-title': '#999999',
        'neon-orange': '#FF6B00',
      },
      boxShadow: {
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
