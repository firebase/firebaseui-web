import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@firebase-oss/ui-styles": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../styles/src"),
      "@firebase-oss/ui-translations": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../translations/src"
      ),
      "~/tests": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./tests"),
      "~": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
});
