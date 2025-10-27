import parser from "yargs-parser";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const args = parser(process.argv.slice(2));
const domain = String(args.domain);
const publicDir = args.publicDir ? String(args.publicDir) : "public";
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

const publicRDir = path.resolve(publicDir);
if (fs.existsSync(publicRDir)) {
  execSync("rm -rf " + publicRDir, { stdio: "inherit" });
}

try {
  try {
    execSync(`./node_modules/.bin/shadcn build -o ${publicDir}`, { stdio: "inherit" });
  } catch (error) {
    console.error("shadcn build failed:", error);
    process.exit(1);
  }
} finally {
  execSync("rm registry.json");
}
