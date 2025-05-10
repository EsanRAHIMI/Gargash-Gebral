// /frontend/tailwind.config.js
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: { 
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        luxury: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          platinum: '#e5e4e2',
        }
      },
      boxShadow: {
        'luxury': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'luxury-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(to right, #1e293b, #334155, #1e293b)',
        'luxury-dashboard': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
    } 
  },
  plugins: [],
}