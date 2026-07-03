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
import path from "node:path";
import { fileURLToPath } from "node:url";

const E2E_DIR = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(E2E_DIR, ".state", "emulator.json");

type EmulatorState = {
  startedBySetup: boolean;
  pid?: number;
};

function readEmulatorState(): EmulatorState | null {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as EmulatorState;
  } catch {
    return null;
  }
}

export default async function globalTeardown(): Promise<void> {
  const state = readEmulatorState();

  if (state?.startedBySetup && state.pid !== undefined) {
    try {
      process.kill(-state.pid, "SIGTERM");
    } catch {
      // Emulator may already have stopped.
    }
  }

  try {
    rmSync(path.dirname(STATE_FILE), { recursive: true, force: true });
  } catch {
    // Best-effort cleanup of ephemeral setup state.
  }
}
