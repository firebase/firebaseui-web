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

import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { values, positionals } = parseArgs({
  options: {
    outDir: {
      type: "string",
      default: "./public-dev/r",
    },
  },
  allowPositionals: true,
});

const command = positionals[0];
const outputPath = positionals[1] || values.outDir;

// Registry is at dist/registry, CLI is at dist/bin, so go up one level
const sourceDir = "../registry";

if (command === "copy") {
  const sourcePath = path.resolve(__dirname, sourceDir);

  // Output path should be relative to where the user runs the command from
  const destPath = path.resolve(process.cwd(), outputPath);

  // Check if source directory exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source directory "${sourcePath}" does not exist`);
    process.exit(1);
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  // Copy files from source to destination
  const files = fs.readdirSync(sourcePath);
  let copiedCount = 0;

  for (const file of files) {
    const sourceFile = path.join(sourcePath, file);
    const destFile = path.join(destPath, file);

    const stat = fs.statSync(sourceFile);
    if (stat.isFile()) {
      fs.copyFileSync(sourceFile, destFile);
      copiedCount++;
      console.log(`Copied: ${file}`);
    }
  }

  console.log(`\nSuccessfully copied ${copiedCount} item(s) from "${sourcePath}" to "${destPath}"`);
} else {
  console.error(`Unknown command: ${command || "none"}`);
  console.error("Usage: copy <output-path>");
  process.exit(1);
}
