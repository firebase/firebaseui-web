import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import veauryVitePlugins from "veaury/vite/index.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    // type:"react" restricts the Vue JSX plugin to only JSX inside .vue script
    // blocks. All standalone .tsx/.jsx files — both ReactRoot.tsx and every
    // file resolved through the react_app symlink — are handled by the React
    // plugin. This is necessary because Vite resolves the symlink before
    // passing paths to plugins (preserveSymlinks:false), so path-based exclude
    // patterns like /react_app/ would never match the real on-disk paths.
    veauryVitePlugins({
      type: "react",
    }) as Plugin,
  ],
  resolve: {
    // Ensure Vite follows the react_app symlink into the sibling package.
    preserveSymlinks: false,
  },
});
