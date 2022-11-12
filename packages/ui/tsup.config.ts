import { defineConfig } from "tsup";
import { execSync } from "child_process";

// `opts` are brought in from CLI args
export default defineConfig((opts) => ({
  clean: true,
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react"],
  sourcemap: true,
  minify: !opts.watch,
  outDir: "dist",
  async onSuccess() {
    // emit sourcemap to enable jump to definition
    execSync("pnpm tsc --project tsconfig.sourcemap.json");
  },
}));
