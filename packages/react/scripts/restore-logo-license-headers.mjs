#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const licenseHeader = `/**
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

`;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const logosDir = join(scriptDir, "../src/components/logos");


async function findLogoComponents(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findLogoComponents(path)));
    } else if (entry.isFile() && entry.name === "Logo.tsx") {
      files.push(path);
    }
  }

  return files;
}

const logoComponents = await findLogoComponents(logosDir);

await Promise.all(
  logoComponents.map(async (path) => {
    const contents = await readFile(path, "utf8");

    if (contents.startsWith(licenseHeader)) {
      return;
    }

    await writeFile(path, `${licenseHeader}${contents}`, "utf8");
  }),
);
