/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    run([
      {
        name: "build registry",
        pattern: ["src/components/**/*.tsx", "registry-spec.json"],
        run: ["tsx", "build.ts", "--domain", "http://localhost:5177", "--outDir", "public-dev/r", "--dev"],
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
