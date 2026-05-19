/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./index.html", "./partials/*.html"],
  theme: {
    extend: {
      fontFamily: {
        Outfit: ["Outfit"],
        Inter: ["Inter"],
      },
      colors: {
        brand: {
          primary: "#4094b8",
          "primary-dark": "#2d6c8a",
          ink: "#0f172a",
          paper: "#fafaf9",
          rule: "#d4d4d8",
        },
      },
    },
  },
  plugins: [],
};
