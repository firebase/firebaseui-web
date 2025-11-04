import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import fs from "fs";
import { fail } from "assert";

const regisryFiles = import.meta.glob([
  "./src/components/*.tsx",
  "!./src/components/**/*.test.tsx",
  "!./src/components/**/*.spec.tsx",
]);

describe("registry-spec", () => {
  it("should be a valid JSON file", () => {
    const registrySpec = fs.readFileSync("./registry-spec.json", "utf8");
    expect(registrySpec).toBeDefined();
    expect(() => JSON.parse(registrySpec)).not.toThrow();
  });

  const sortedFilePaths = Object.keys(regisryFiles).sort();

  for (let i = 0; i < sortedFilePaths.length; i++) {
    const path = sortedFilePaths[i];
    if (!path) continue;

    it(`"${path}" should exist in the registry at the correct index`, () => {
      const registrySpec = fs.readFileSync("./registry-spec.json", "utf8");
      const json = JSON.parse(registrySpec);

      const name = path.split("/").at(-1)?.split(".")[0];
      const index = json.items.findIndex((item: any) => item.name === name);

      if (index === -1) {
        fail(`"${path}" should exist in the registry`);
      }

      if (index !== i) {
        fail(`"${path}" should be ordered alphabetically based on the name`);
      }
    });
  }
});
