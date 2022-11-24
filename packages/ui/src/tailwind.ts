import resolveConfig from "tailwindcss/resolveConfig";
// @ts-expect-error (richard) Possibly need to declare a module for the tailwind config?
import tailwindConfig from "./../tailwind.config";
import type { EventColorRadix } from "@prisma/client";

const fullConfig = resolveConfig({
  ...tailwindConfig,
  content: ["./src/**/*.{html,js,ts,tsx}"],
});

export const themeColors = fullConfig.theme?.colors as Record<
  EventColorRadix & string,
  string
>;
