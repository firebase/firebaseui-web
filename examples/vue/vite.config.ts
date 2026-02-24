import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error veaury vite helper has no published types.
import veauryVitePlugins from "veaury/vite/index.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [veauryVitePlugins({ type: "vue" }), tailwindcss()],
});
