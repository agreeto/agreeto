import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default ({ mode }: any) => {
  const env = loadEnv(mode, process.cwd());

  if (env.VITE_NODE_ENV === "development") {
    return defineConfig({
      server: { https: true, port: 8082 },
      plugins: [mkcert(), react()],
    });
  }

  return defineConfig({
    plugins: [react()],
  });
};
