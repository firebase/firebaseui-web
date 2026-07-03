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

import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exampleMeta, type ExampleMeta } from "./fixtures/example-meta";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_WEB_SERVER_TIMEOUT_MS = 120_000;

function webServerForMeta(meta: ExampleMeta) {
  if (!meta.webServerCommand) {
    return undefined;
  }

  return {
    command: meta.webServerCommand,
    url: meta.webServerHealthURL ?? meta.baseURL,
    cwd: REPO_ROOT,
    reuseExistingServer: !process.env.CI,
    timeout: meta.webServerTimeoutMs ?? DEFAULT_WEB_SERVER_TIMEOUT_MS,
  };
}

/** Playwright only reads top-level webServer (not per-project). Serial runner sets E2E_PROJECT. */
function resolveWebServerMeta() {
  const fromEnv = process.env.E2E_PROJECT ? exampleMeta[process.env.E2E_PROJECT] : undefined;

  if (fromEnv?.webServerCommand) {
    return fromEnv;
  }

  return Object.values(exampleMeta).find((meta) => meta.webServerCommand);
}

const webServerMeta = resolveWebServerMeta();

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  ...(webServerMeta ? { webServer: webServerForMeta(webServerMeta) } : {}),
  projects: Object.values(exampleMeta).map((meta) => ({
    name: meta.name,
    timeout: meta.name === "angular-example" ? 90_000 : undefined,
    expect: meta.name === "angular-example" ? { timeout: 30_000 } : undefined,
    use: {
      baseURL: meta.baseURL,
      actionTimeout: meta.name === "angular-example" ? 15_000 : undefined,
    },
  })),
});
