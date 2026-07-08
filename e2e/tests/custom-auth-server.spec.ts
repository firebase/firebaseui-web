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

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, request, test } from "@playwright/test";
import { exampleMeta, type HttpExampleMeta } from "../fixtures/example-meta";

/** HTTP boot smoke for custom-auth-server — AD-6. */
const PROJECT = "custom-auth-server";
const PORT = "4001";
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CUSTOM_AUTH_SERVER_DIR = path.join(REPO_ROOT, "examples", "custom-auth-server");
/** Canonical start command: examples/custom-auth-server/package.json `"start": "node build/index.js"`. */
const SERVER_ENTRY = path.join(CUSTOM_AUTH_SERVER_DIR, "build", "index.js");

const meta = exampleMeta[PROJECT];
if (meta.kind !== "http") {
  throw new Error(`Expected ${PROJECT} to be an http example, got kind "${meta.kind}"`);
}
const httpMeta: HttpExampleMeta = meta;

let server: ChildProcess | undefined;

function stopServer(): void {
  if (!server || server.pid === undefined || server.exitCode !== null) {
    return;
  }
  // Spawned detached so teardown can signal the process group (AD-6).
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const context = await request.newContext();
  const deadline = Date.now() + timeoutMs;

  try {
    while (Date.now() < deadline) {
      if (server?.exitCode != null) {
        throw new Error(`custom-auth-server exited early with code ${server.exitCode}`);
      }
      try {
        // Any HTTP response means the server is listening (AD-6).
        await context.get(url, { timeout: 2_000 });
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw new Error(`custom-auth-server did not respond at ${url} within ${timeoutMs}ms`);
  } finally {
    await context.dispose();
  }
}

test.describe(`custom-auth-server HTTP smoke (${PROJECT})`, () => {
  test.beforeAll(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== PROJECT, `runs only on the ${PROJECT} project`);
    test.setTimeout(120_000);

    const build = spawnSync("pnpm", ["--filter=custom-auth-server", "run", "build"], {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    expect(build.status, "custom-auth-server build failed").toBe(0);

    server = spawn(process.execPath, [SERVER_ENTRY], {
      cwd: CUSTOM_AUTH_SERVER_DIR,
      stdio: "inherit",
      detached: true,
      env: { ...process.env, PORT },
    });
    server.unref();

    await waitForServer(`${httpMeta.baseURL}${httpMeta.smokePath}`);
  });

  test.afterAll(async () => {
    stopServer();
  });

  test("H1: server responds on the config route", async () => {
    const context = await request.newContext({ baseURL: httpMeta.baseURL });

    try {
      const response = await context.get(httpMeta.smokePath);

      // 500 without SNAPCHAT_CLIENT_ID (default env); 200 when credentials are present.
      expect([200, 500]).toContain(response.status());

      const body = await response.json();

      if (response.status() === 500) {
        expect(body).toMatchObject({ error: "Server missing Snapchat client ID" });
      } else {
        expect(body).toMatchObject({ clientId: expect.any(String) });
      }
    } finally {
      await context.dispose();
    }
  });
});
