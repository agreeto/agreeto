import type {
  EventColorDirectoryUserRadix,
  EventColorUserRadix,
} from "@agreeto/api/client";

import * as tailwindConfig from "../../tailwind.config.cjs";
import resolveConfig from "tailwindcss/resolveConfig";

// This gets assigned for unknown attendees, basically just as a filler
// Should be different from any of the user / directory colors
export const unknownColorName = "mauve";

/** Resolve tailwind config to get our radix colors to an object */
export const themeColors = resolveConfig(tailwindConfig).theme
  ?.colors as Record<
  | EventColorUserRadix
  | EventColorDirectoryUserRadix
  | "mauve"
  | typeof unknownColorName,
  Record<number, string> // this maps a number to a css variable
>;
