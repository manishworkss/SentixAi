/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentix: {
          bg: '#14181c', // Main body background
          panel: '#1e252b', // Header, cards
          border: '#2c3440',
          text: '#9ab', // Muted text
          textLight: '#fff', // Primary text
          cyan: '#00B4D8', // Accent
          cyanHover: '#0096b3',
          green: '#00e054', // Success/Create
          greenHover: '#00b042',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
