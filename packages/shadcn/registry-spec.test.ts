import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import fs from "fs";

const regisryFiles = import.meta.glob([
  "./src/registry/**/*.tsx",
  "!./src/registry/**/*.test.tsx",
  "!./src/registry/**/*.spec.tsx",
]);

describe("registry-spec", () => {
  it("should be a valid JSON file", () => {
    const registrySpec = fs.readFileSync("./registry-spec.json", "utf8");
    expect(registrySpec).toBeDefined();
    expect(() => JSON.parse(registrySpec)).not.toThrow();
  });

  for (const path of Object.keys(regisryFiles)) {
    it(`${path} should exist in the registry`, () => {
      const registrySpec = fs.readFileSync("./registry-spec.json", "utf8");
      const json = JSON.parse(registrySpec);

      const name = path.split("/").at(-1)?.split(".")[0];
      const item = json.items.find((item: any) => item.name === name);
      expect(item).toBeDefined();
    });
  }
});
