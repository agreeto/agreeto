import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react"],
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
  outDir: "dist",
});
