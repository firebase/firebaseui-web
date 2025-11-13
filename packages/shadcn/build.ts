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

import parser from "yargs-parser";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const args = parser(process.argv.slice(2));
const domain = String(args.domain);
const outDir = args.outDir ? String(args.outDir) : "dist/registry";
const isDev = !!args.dev;

if (!domain) {
  console.error("Missing domain argument");
  process.exit(1);
}

const registryPath = path.resolve("registry-spec.json");
const registryRaw = fs.readFileSync(registryPath, "utf8");

let replaced = registryRaw.replace(/{{\s*DOMAIN\s*}}/g, domain);

// Replace dependency placeholder based on dev flag
replaced = replaced.replace(/{{\s*DEP\s*\|\s*([^}]+)\s*}}/g, (_, packageName) => {
  return isDev ? `${packageName.trim()}@workspace:*` : packageName.trim();
});
fs.writeFileSync("registry.json", replaced, "utf8");

const publicRDir = path.resolve(outDir);
if (fs.existsSync(publicRDir)) {
  execSync("rm -rf " + publicRDir, { stdio: "inherit" });
}

try {
  try {
    execSync(`./node_modules/.bin/shadcn build -o ${outDir}`, { stdio: "inherit" });
  } catch (error) {
    console.error("shadcn build failed:", error);
    process.exit(1);
  }
} finally {
  execSync("rm registry.json");
}
