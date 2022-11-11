import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // This work is done to keep the css file name fixed
        assetFileNames: ({ name }) => {
          if (!name) return "";

          const fileNameArr = name.split("/");
          const fileName = fileNameArr[fileNameArr.length - 1];
          return `assets/${fileName}`;
        },
      },
    },
  },
});
