import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Get the domain from CLI args
const [, , domain] = process.argv;

if (!domain) {
  console.error("Missing domain argument");
  process.exit(1);
}

const registryPath = path.resolve("registry-spec.json");
const registryRaw = fs.readFileSync(registryPath, "utf8");

const replaced = registryRaw.replace(/{{\s*DOMAIN\s*}}/g, domain);
fs.writeFileSync("registry.json", replaced, "utf8");

const publicRDir = path.resolve("public", "r");
if (fs.existsSync(publicRDir)) {
  execSync("rm -rf " + publicRDir, { stdio: "inherit" });
}

try {
  execSync("shadcn build", { stdio: "inherit" });
} finally {
  execSync("rm registry.json");
}
