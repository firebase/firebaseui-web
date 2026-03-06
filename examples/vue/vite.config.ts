import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import veauryVitePlugins from "veaury/vite/index.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    // Handles both Vue and React JSX — jsx in files under react_app/ is
    // compiled as React JSX; everything else is compiled as Vue JSX.
    veauryVitePlugins({
      type: "vue",
    }) as Plugin,
  ],
  resolve: {
    // Ensure Vite follows the react_app symlink into the sibling package.
    preserveSymlinks: false,
  },
});
