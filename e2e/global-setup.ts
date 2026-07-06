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

import { execSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(E2E_DIR, "..");
const STATE_DIR = path.join(E2E_DIR, ".state");
const STATE_FILE = path.join(STATE_DIR, "emulator.json");
/** Auth-only config — avoids root firebase.json framework hosting and global webframeworks experiment. */
const EMULATOR_CONFIG = path.join(E2E_DIR, "firebase.emulator.json");
const TEST_WORKFLOW = path.join(REPO_ROOT, ".github/workflows/test.yaml");
const AUTH_EMULATOR_URL = "http://127.0.0.1:9099";
const EMULATOR_WAIT_MS = 240_000;

/** Core library packages built by `build:packages`; examples import these artifacts. */
const REQUIRED_DIST_ARTIFACTS = [
  "packages/translations/dist/index.js",
  "packages/styles/dist/index.js",
  "packages/core/dist/index.js",
  "packages/react/dist/index.js",
  "packages/angular/dist/fesm2022/firebase-oss-ui-angular.mjs",
] as const;

type EmulatorState = {
  startedBySetup: boolean;
  pid?: number;
};

/** DRY: firebase-tools version is owned by `.github/workflows/test.yaml` (Install Firebase CLI step). */
function readFirebaseToolsVersion(): string {
  const content = readFileSync(TEST_WORKFLOW, "utf8");
  const match = content.match(/firebase-tools@(\d+\.\d+\.\d+)/);
  const version = match?.[1];
  if (!version) {
    throw new Error(`Could not parse firebase-tools version from ${TEST_WORKFLOW}`);
  }
  return version;
}

function readEmulatorState(): EmulatorState | null {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as EmulatorState;
  } catch {
    return null;
  }
}

async function isAuthEmulatorReachable(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port: 9099, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(2_000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForAuthEmulator(timeoutMs = EMULATOR_WAIT_MS): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isAuthEmulatorReachable()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`Auth emulator did not become reachable at ${AUTH_EMULATOR_URL} within ${timeoutMs / 1000}s`);
}

function assertPackagesBuilt(): void {
  const missing = REQUIRED_DIST_ARTIFACTS.filter((artifact) => !existsSync(path.join(REPO_ROOT, artifact)));

  if (missing.length > 0) {
    throw new Error(
      `Expected built package artifacts are missing after build:packages:\n${missing.map((entry) => `  - ${entry}`).join("\n")}`
    );
  }
}

function runBuildPackages(): void {
  try {
    execSync("pnpm build:packages", {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
  } catch {
    throw new Error("pnpm build:packages failed — examples require built @firebase-oss/ui-* packages");
  }

  assertPackagesBuilt();
}

function writeEmulatorState(state: EmulatorState): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function ensureFirebaseToolsCached(version: string): void {
  try {
    execSync(`npx --yes firebase-tools@${version} --version`, {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
  } catch {
    throw new Error(`Failed to cache firebase-tools@${version} via npx — Auth emulator cannot start`);
  }
}

function startAuthEmulator(version: string): ChildProcess {
  const child = spawn(
    "npx",
    [
      "--yes",
      `firebase-tools@${version}`,
      "emulators:start",
      "--config",
      EMULATOR_CONFIG,
      "--only",
      "auth",
      "--project",
      "demo-test",
    ],
    {
      cwd: REPO_ROOT,
      detached: true,
      stdio: "ignore",
    }
  );

  if (child.pid === undefined) {
    throw new Error("Failed to start Auth emulator: spawn returned no PID");
  }

  child.unref();
  return child;
}

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_SKIP_BUILD_PACKAGES === "1") {
    assertPackagesBuilt();
  } else {
    runBuildPackages();
  }

  if (await isAuthEmulatorReachable()) {
    const existing = readEmulatorState();
    writeEmulatorState({
      startedBySetup: existing?.startedBySetup ?? false,
      pid: existing?.pid,
    });
    return;
  }

  const firebaseToolsVersion = readFirebaseToolsVersion();
  ensureFirebaseToolsCached(firebaseToolsVersion);
  const emulatorProcess = startAuthEmulator(firebaseToolsVersion);

  try {
    await waitForAuthEmulator();
  } catch (error) {
    try {
      process.kill(-emulatorProcess.pid!, "SIGTERM");
    } catch {
      // Process may already have exited.
    }

    throw error;
  }

  writeEmulatorState({ startedBySetup: true, pid: emulatorProcess.pid });
}
