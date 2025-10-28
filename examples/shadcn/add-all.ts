import parser from "yargs-parser";
import readline from "node:readline";
import registryJson from "../../packages/shadcn/registry-spec.json";
import { execSync } from "node:child_process";

const components = registryJson.items.map((item) => item.name);
const args = parser(process.argv.slice(2));
const prefix = String(args.prefix) || "@dev";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const items = components
  .map((component) => {
    return `${prefix}/${component}`;
  })
  .join(" ");

rl.question(
  `Add ${components.length} components. This will overrwrite all existing files. Continue? (y/N) `,
  (answer: unknown) => {
    const answerString = String(answer || "n").toLowerCase();

    if (answerString === "y") {
      try {
        execSync(`pnpm dlx shadcn@latest add -y -o -a ${items}`, { stdio: "inherit" });
        process.exit(0);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    }

    console.log("Aborting...");
    process.exit(0);
  }
);
