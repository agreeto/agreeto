// // T should be the redix color type
// type T = any
// const colors = fetchFromPrisma()
// const themes: Record<string, T> = colors.map((c) => ({
//   [c.name]: redixColors[name]
// })
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "~/../tailwind.config.js";

// FIXME: continue here
//eslint-disable-next-line
const fullConfig = resolveConfig({
  ...tailwindConfig,
  content: ["./src/**/*.{html,js,ts,tsx}"],
});

export default {};
