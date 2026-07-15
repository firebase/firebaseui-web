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

import { readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resetCoverageArtifacts } from "../e2e/fixtures/coverage-artifacts.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMULATOR_STATE_FILE = path.join(REPO_ROOT, "e2e", ".state", "emulator.json");

/** UI examples exercised serially by `pnpm test:e2e` (browser smoke S1–S3). */
const E2E_UI_EXAMPLES = ["react", "shadcn", "nextjs", "nextjs-ssr", "angular-example"];

/** Non-browser examples (HTTP boot smoke), run after the UI examples. AD-6. */
const E2E_HTTP_EXAMPLES = ["custom-auth-server"];

const E2E_EXAMPLES = [...E2E_UI_EXAMPLES, ...E2E_HTTP_EXAMPLES];

function ensurePackagesBuilt() {
  console.log("\n[e2e-run] build:packages (once)…\n");
  const build = spawnSync("pnpm", ["build:packages"], { cwd: REPO_ROOT, stdio: "inherit" });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

function runExample(example) {
  console.log(`\n[e2e-run] Starting ${example}…\n`);

  const result = spawnSync("pnpm", ["--filter=e2e", "exec", "playwright", "test", `--project=${example}`], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      E2E_PROJECT: example,
      E2E_KEEP_EMULATOR: "1",
    },
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
}

function stopOrchestratedEmulator() {
  try {
    const state = JSON.parse(readFileSync(EMULATOR_STATE_FILE, "utf8"));
    if (state?.startedBySetup && state.pid !== undefined) {
      try {
        process.kill(-state.pid, "SIGTERM");
      } catch {
        // Emulator may already have stopped.
      }
    }
  } catch {
    // No state file — nothing to stop.
  }

  try {
    rmSync(path.dirname(EMULATOR_STATE_FILE), { recursive: true, force: true });
  } catch {
    // Best-effort cleanup.
  }
}

ensurePackagesBuilt();
resetCoverageArtifacts();

for (const example of E2E_EXAMPLES) {
  runExample(example);
  if (process.exitCode) {
    break;
  }
}

stopOrchestratedEmulator();

if (process.exitCode) {
  process.exit(process.exitCode);
}
