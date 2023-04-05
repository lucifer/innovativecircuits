/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.{html,js}',
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