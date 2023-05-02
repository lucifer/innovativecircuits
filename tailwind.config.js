/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/**/*.{html,js}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        Outfit: ["Outfit"],
        Inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
