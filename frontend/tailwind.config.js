/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4CAF50', dark: '#388E3C', light: '#81C784' },
        accent:  { DEFAULT: '#FF6B35', dark: '#E64A19' },
        neutral: { 50: '#f9f9f9', 100: '#f0f0f0', 800: '#333333' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
