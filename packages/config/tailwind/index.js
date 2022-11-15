// FIXME: disable ts rule for config .js files? https://eslint.org/docs/latest/user-guide/configuring#disabling-rules-only-for-a-group-of-files
// eslint-disable-next-line
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
    // eslint-disable-next-line
    require("windy-radix-palette")({
      colors: {
        mauveA: radixColors.mauveA,
        mauveDarkA: radixColors.mauveDarkA,
        red: radixColors.red,
        redDark: radixColors.redDark,
      },
    }),
  ],
};
