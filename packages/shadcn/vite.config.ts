import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { run } from "vite-plugin-run";

// https://vite.dev/config/
export default defineConfig({
  publicDir: "./public-dev",
  server: {
    port: 5177,
  },
  plugins: [
    react(),
    tailwindcss(),
    // @ts-expect-error - vite-plugin-run is not well typed
    run([
      {
        name: "build registry",
        pattern: ["src/registry/**/*.tsx", "registry-spec.json"],
        run: ["tsx", "build.ts", "--domain", "http://localhost:5177", "--publicDir", "public-dev", "--dev"],
      },
    ]),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/tests": path.resolve(__dirname, "./tests"),
    },
  },
});
