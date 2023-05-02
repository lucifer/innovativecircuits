/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/**/*.{html,js}", "./dist/index.html"],
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
