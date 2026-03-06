import { defineConfig } from "vite";
import veauryVitePlugins from "veaury/vite/index.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    veauryVitePlugins({
      type: "vue",
    }),
  ],
});
