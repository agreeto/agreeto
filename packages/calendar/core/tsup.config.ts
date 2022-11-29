import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: [],
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
  outDir: "dist",
});
