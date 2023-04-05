/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'Outfit' : ['Outfit'],
        'Inter' : ['Inter']
      }
    },
  },
  plugins: [],
};