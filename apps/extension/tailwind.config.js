/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@agreeto/tailwind-config")],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{tsx,ts}", "../../packages/calendar/react/src/**/*.{tsx,ts}"],
};
