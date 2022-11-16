/* eslint-disable @typescript-eslint/no-var-requires */
const radixColors = require("@radix-ui/colors");
/** @type {import('tailwindcss').Config} */
module.exports = {
  // mode: "jit",
  darkMode: "class",
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0165FF",
      },
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: ["Georgia", "serif"],
    },
  },
  variants: { extend: { typography: ["dark"] } },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("windy-radix-palette"),
  ],
};
